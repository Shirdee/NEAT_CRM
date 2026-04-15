import {beforeEach, describe, expect, it} from "vitest";

import {resetFallbackStore} from "../data/fallback-store";

import {createStageableRows, profileWorkbookSource} from "./workbook";
import {
  commitImportBatch,
  createImportBatch,
  getImportBatchReview,
  listImportBatches,
  resetImportFallbackStore,
  stageInboundRecords,
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
    const committedCompany = reviewAfterCommit?.rows.find((row) => row.entityType === "company");
    const committedContact = reviewAfterCommit?.rows.find((row) => row.entityType === "contact");

    expect(result).toMatchObject({created: 2, skipped: 0});
    expect(reviewAfterCommit?.status).toBe("committed");
    expect((committedCompany?.normalizedFields.importCommit as {sourceFilename?: string})?.sourceFilename).toBe(
      "crm-import.xlsx"
    );
    expect((committedContact?.normalizedFields.importCommit as {action?: string})?.action).toBe("created");
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

  it("commits contacts that reference companies staged later in the same batch", async () => {
    const profile = profileWorkbookSource([
      {
        name: "Contacts",
        rows: [
          ["Full Name", "Company Name", "Email"],
          ["Dana Founder", "Acme", "dana@acme.test"]
        ]
      },
      {
        name: "Companies",
        rows: [
          ["Company Name", "Website"],
          ["Acme", "acme.test"]
        ]
      }
    ]);

    const batch = await createImportBatch({
      uploadedById: "user_admin",
      sourceFilename: "out-of-order.xlsx",
      profile
    });

    await stageImportRows({
      batchId: batch.id,
      rows: [
        ...createStageableRows("Contacts", ["Full Name", "Company Name", "Email"], [
          ["Dana Founder", "Acme", "dana@acme.test"]
        ]),
        ...createStageableRows("Companies", ["Company Name", "Website"], [["Acme", "acme.test"]])
      ]
    });

    const review = await getImportBatchReview(batch.id);

    expect(review?.issues.some((issue) => issue.issueCode === "orphan_company_reference")).toBe(
      false
    );

    await updateImportRow({
      batchId: batch.id,
      rowId: review!.rows.find((row) => row.entityType === "contact")!.id,
      rawFields: review!.rows.find((row) => row.entityType === "contact")!.rawFields,
      reviewDecision: {
        reviewState: "ready"
      }
    });

    await updateImportRow({
      batchId: batch.id,
      rowId: review!.rows.find((row) => row.entityType === "company")!.id,
      rawFields: review!.rows.find((row) => row.entityType === "company")!.rawFields,
      reviewDecision: {
        reviewState: "ready"
      }
    });

    const result = await commitImportBatch({
      batchId: batch.id,
      userId: "user_admin",
      allowWarnings: false
    });

    expect(result).toMatchObject({created: 2, skipped: 0});
  });

  it("uses attach-existing company decisions to link downstream contact commits with audit metadata", async () => {
    const seedBatch = await createImportBatch({
      uploadedById: "user_admin",
      sourceFilename: "seed-company.xlsx",
      profile: profileWorkbookSource([
        {
          name: "Companies",
          rows: [["Company Name"], ["Existing Anchor Co"]]
        }
      ])
    });

    await stageImportRows({
      batchId: seedBatch.id,
      rows: createStageableRows("Companies", ["Company Name"], [["Existing Anchor Co"]])
    });

    await commitImportBatch({
      batchId: seedBatch.id,
      userId: "user_admin",
      allowWarnings: false
    });

    const profile = profileWorkbookSource([
      {
        name: "Companies",
        rows: [
          ["Company Name", "Website"],
          ["Existing Anchor Co", "inbound-alias.test"]
        ]
      },
      {
        name: "Contacts",
        rows: [
          ["Full Name", "Company Name", "Email"],
          ["Inbound Person", "Existing Anchor Co", "inbound.person@test.com"]
        ]
      }
    ]);

    const batch = await createImportBatch({
      uploadedById: "user_admin",
      sourceFilename: "attach-existing.xlsx",
      profile
    });

    await stageImportRows({
      batchId: batch.id,
      rows: [
        ...createStageableRows("Companies", ["Company Name", "Website"], [["Existing Anchor Co", "inbound-alias.test"]]),
        ...createStageableRows("Contacts", ["Full Name", "Company Name", "Email"], [
          ["Inbound Person", "Existing Anchor Co", "inbound.person@test.com"]
        ])
      ]
    });

    const reviewBeforeCommit = await getImportBatchReview(batch.id);
    const companyTarget = reviewBeforeCommit?.options.companies[0];
    const companyRow = reviewBeforeCommit?.rows.find((row) => row.entityType === "company");
    const contactRow = reviewBeforeCommit?.rows.find((row) => row.entityType === "contact");

    expect(companyTarget).toBeTruthy();
    expect(companyRow).toBeTruthy();
    expect(contactRow).toBeTruthy();

    await updateImportRow({
      batchId: batch.id,
      rowId: companyRow!.id,
      rawFields: companyRow!.rawFields,
      reviewDecision: {
        reviewState: "ready",
        duplicateDecision: "attach_existing",
        existingTargetId: companyTarget!.id,
        existingTargetLabel: companyTarget!.label
      }
    });

    await updateImportRow({
      batchId: batch.id,
      rowId: contactRow!.id,
      rawFields: contactRow!.rawFields,
      reviewDecision: {
        reviewState: "ready"
      }
    });

    const result = await commitImportBatch({
      batchId: batch.id,
      userId: "user_admin",
      allowWarnings: true
    });
    const reviewAfterCommit = await getImportBatchReview(batch.id);
    const committedCompany = reviewAfterCommit?.rows.find((row) => row.entityType === "company");
    const committedContact = reviewAfterCommit?.rows.find((row) => row.entityType === "contact");

    expect(result).toMatchObject({created: 1, updated: 1, skipped: 0});
    expect(
      (committedCompany?.normalizedFields.importCommit as {action?: string; targetEntityId?: string})
        ?.action
    ).toBe("attached_existing");
    expect(
      (committedCompany?.normalizedFields.importCommit as {action?: string; targetEntityId?: string})
        ?.targetEntityId
    ).toBe(companyTarget!.id);
    expect(
      (committedContact?.normalizedFields.importCommit as {linkedCompanyId?: string})?.linkedCompanyId
    ).toBe(companyTarget!.id);
  });

  it("keeps multiple staged batches instead of clearing prior import history", async () => {
    const firstBatch = await createImportBatch({
      uploadedById: "user_admin",
      sourceFilename: "first.xlsx",
      profile: profileWorkbookSource([
        {
          name: "Companies",
          rows: [["Company Name"], ["Acme"]]
        }
      ])
    });

    await stageImportRows({
      batchId: firstBatch.id,
      rows: createStageableRows("Companies", ["Company Name"], [["Acme"]])
    });

    const secondBatch = await createImportBatch({
      uploadedById: "user_admin",
      sourceFilename: "second.xlsx",
      profile: profileWorkbookSource([
        {
          name: "Companies",
          rows: [["Company Name"], ["Orbit"]]
        }
      ])
    });

    const batches = await listImportBatches();
    const preservedFirstBatch = await getImportBatchReview(firstBatch.id);
    const currentBatch = await getImportBatchReview(secondBatch.id);

    expect(batches).toHaveLength(2);
    expect(batches[0]?.id).toBe(secondBatch.id);
    expect(batches[1]?.id).toBe(firstBatch.id);
    expect(preservedFirstBatch?.id).toBe(firstBatch.id);
    expect(currentBatch?.id).toBe(secondBatch.id);
  });

  it("persists shared intake metadata and allowlisted lead payloads on staged rows", async () => {
    const batch = await createImportBatch({
      uploadedById: "user_admin",
      sourceFilename: "website-intake",
      profile: profileWorkbookSource([
        {
          name: "Website Leads",
          rows: [["Company Name", "Full Name", "Email", "Phone", "Notes"], ["Orbit", "Dana", "dana@orbit.test", "+1 555 111", "Demo request"]]
        }
      ]),
      intakeSource: {
        channel: "website_form",
        sourceLabel: "Website Form",
        sourceRef: "landing-page-contact",
        submittedByType: "public",
        locale: "en"
      }
    });

    await stageInboundRecords({
      batchId: batch.id,
      records: [
        {
          row: createStageableRows(
            "Website Leads",
            ["company_name", "full_name", "email", "phone", "notes"],
            [["Orbit", "Dana", "dana@orbit.test", "+1 555 111", "Demo request"]]
          )[0]!,
          intakeEnvelope: {
            sourceRef: "landing-page-contact"
          }
        }
      ]
    });

    const review = await getImportBatchReview(batch.id);

    expect(review?.intakeSource).toMatchObject({
      channel: "website_form",
      sourceLabel: "Website Form",
      submittedByType: "public",
      locale: "en"
    });
    expect(review?.rows[0]?.intakeEnvelope).toMatchObject({
      channel: "website_form",
      sourceLabel: "Website Form",
      sourceRef: "landing-page-contact"
    });
    expect(review?.rows[0]?.intakePayload).toMatchObject({
      companyName: "Orbit",
      contactFullName: "Dana",
      emails: ["dana@orbit.test"],
      phones: ["+1555111"],
      notes: "Demo request"
    });
  });
});
