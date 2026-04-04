import {beforeEach, describe, expect, it} from "vitest";

import {resetFallbackStore} from "../data/fallback-store";

import {createStageableRows, profileWorkbookSource} from "./workbook";
import {
  commitImportBatch,
  createImportBatch,
  getImportBatchReview,
  resetImportFallbackStore,
  stageImportRows,
  updateImportRow
} from "./repository";

describe("import repository fallback flow", () => {
  beforeEach(() => {
    delete process.env.DATABASE_URL;
    resetFallbackStore();
    resetImportFallbackStore();
  });

  it("creates, stages, reviews, and commits a clean batch", async () => {
    const profile = profileWorkbookSource([
      {
        name: "Companies",
        rows: [
          ["Company Name", "Website"],
          ["Acme", "acme.test"]
        ]
      },
      {
        name: "Contacts",
        rows: [
          ["Full Name", "Company Name", "Email"],
          ["Dana Founder", "Acme", "dana@acme.test"]
        ]
      }
    ]);

    const batch = await createImportBatch({
      uploadedById: "user_admin",
      sourceFilename: "crm-import.xlsx",
      profile
    });

    await stageImportRows({
      batchId: batch.id,
      rows: [
        ...createStageableRows("Companies", ["Company Name", "Website"], [["Acme", "acme.test"]]),
        ...createStageableRows("Contacts", ["Full Name", "Company Name", "Email"], [["Dana Founder", "Acme", "dana@acme.test"]])
      ]
    });

    const reviewBeforeCommit = await getImportBatchReview(batch.id);

    expect(reviewBeforeCommit?.status).toBe("ready");
    expect(reviewBeforeCommit?.summary?.counts.totalRows).toBe(2);
    expect(reviewBeforeCommit?.issues).toHaveLength(0);

    const result = await commitImportBatch({
      batchId: batch.id,
      userId: "user_admin",
      allowWarnings: false
    });

    const reviewAfterCommit = await getImportBatchReview(batch.id);

    expect(result).toMatchObject({created: 2, skipped: 0});
    expect(reviewAfterCommit?.status).toBe("committed");
  });

  it("blocks commit when staging finds a blocking issue", async () => {
    const profile = profileWorkbookSource([
      {
        name: "Contacts",
        rows: [
          ["Full Name", "Company Name", "Email"],
          ["Dana Founder", "Missing Co", "dana@example.com"]
        ]
      }
    ]);

    const batch = await createImportBatch({
      uploadedById: "user_admin",
      sourceFilename: "contacts.xlsx",
      profile
    });

    await stageImportRows({
      batchId: batch.id,
      rows: createStageableRows("Contacts", ["Full Name", "Company Name", "Email"], [
        ["Dana Founder", "Missing Co", "dana@example.com"]
      ])
    });

    const review = await getImportBatchReview(batch.id);

    expect(review?.status).toBe("review_required");
    await expect(
      commitImportBatch({
        batchId: batch.id,
        userId: "user_admin",
        allowWarnings: true
      })
    ).rejects.toThrow("Resolve blocking import issues before commit.");
  });

  it("updates a flagged staged row and revalidates the batch", async () => {
    const profile = profileWorkbookSource([
      {
        name: "Interactions",
        rows: [
          ["Interaction Date", "Interaction Type", "Company Name", "Subject"],
          ["not-a-date", "Call", "Acme", "Discovery"]
        ]
      }
    ]);

    const batch = await createImportBatch({
      uploadedById: "user_admin",
      sourceFilename: "interactions.xlsx",
      profile
    });

    await stageImportRows({
      batchId: batch.id,
      rows: createStageableRows(
        "Interactions",
        ["Interaction Date", "Interaction Type", "Company Name", "Subject"],
        [["not-a-date", "Call", "Acme", "Discovery"]]
      )
    });

    const reviewBefore = await getImportBatchReview(batch.id);
    const row = reviewBefore?.rows[0];

    expect(reviewBefore?.issues.some((issue) => issue.issueCode === "invalid_interaction_date")).toBe(
      true
    );
    expect(row).toBeTruthy();

    await updateImportRow({
      batchId: batch.id,
      rowId: row!.id,
      rawFields: {
        interaction_date: "2026-04-04",
        interaction_type: "Call",
        company_name: "Acme",
        subject: "Discovery"
      },
      reviewDecision: {
        reviewState: "ready"
      }
    });

    const reviewAfter = await getImportBatchReview(batch.id);

    expect(reviewAfter?.issues.some((issue) => issue.issueCode === "invalid_interaction_date")).toBe(
      false
    );
    expect(reviewAfter?.rows[0]?.status).toBe("ready");
  });

  it("supports manual duplicate resolution and ready state on staged rows", async () => {
    const profile = profileWorkbookSource([
      {
        name: "Companies",
        rows: [
          ["Company Name", "Website"],
          ["Acme", "acme.test"],
          ["Acme", "acme.test"]
        ]
      }
    ]);

    const batch = await createImportBatch({
      uploadedById: "user_admin",
      sourceFilename: "dupes.xlsx",
      profile
    });

    await stageImportRows({
      batchId: batch.id,
      rows: createStageableRows("Companies", ["Company Name", "Website"], [
        ["Acme", "acme.test"],
        ["Acme", "acme.test"]
      ])
    });

    const reviewBefore = await getImportBatchReview(batch.id);
    const secondRow = reviewBefore?.rows[1];

    expect(secondRow?.status).toBe("needs_review");

    await updateImportRow({
      batchId: batch.id,
      rowId: secondRow!.id,
      rawFields: secondRow!.rawFields,
      reviewDecision: {
        reviewState: "ready",
        duplicateDecision: "keep_new"
      }
    });

    const reviewAfter = await getImportBatchReview(batch.id);

    expect(reviewAfter?.rows[1]?.status).toBe("ready");
  });

  it("allows admins to skip a staged row manually", async () => {
    const profile = profileWorkbookSource([
      {
        name: "Companies",
        rows: [
          ["Company Name", "Website"],
          ["Skip Me", "skip.test"]
        ]
      }
    ]);

    const batch = await createImportBatch({
      uploadedById: "user_admin",
      sourceFilename: "skip.xlsx",
      profile
    });

    await stageImportRows({
      batchId: batch.id,
      rows: createStageableRows("Companies", ["Company Name", "Website"], [["Skip Me", "skip.test"]])
    });

    const reviewBefore = await getImportBatchReview(batch.id);

    await updateImportRow({
      batchId: batch.id,
      rowId: reviewBefore!.rows[0]!.id,
      rawFields: reviewBefore!.rows[0]!.rawFields,
      reviewDecision: {
        reviewState: "skipped",
        duplicateDecision: "skip"
      }
    });

    const reviewAfter = await getImportBatchReview(batch.id);

    expect(reviewAfter?.rows[0]?.status).toBe("skipped");
  });
});
