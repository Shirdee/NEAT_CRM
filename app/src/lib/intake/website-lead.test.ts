import {beforeEach, describe, expect, it} from "vitest";

import {resetFallbackStore} from "../data/fallback-store";
import {getImportBatchReview, listImportBatches, resetImportFallbackStore} from "../import/repository";

import {stageWebsiteLeadSubmission, validateWebsiteLeadSubmission} from "./website-lead";

describe("website lead intake staging", () => {
  beforeEach(() => {
    delete process.env.DATABASE_URL;
    resetFallbackStore();
    resetImportFallbackStore();
  });

  it("validates a strict allowlist payload and normalizes it", () => {
    const result = validateWebsiteLeadSubmission({
      companyName: "Acme Ltd",
      contactFullName: "Dana Founder",
      email: " DANA@ACME.TEST ",
      phone: "+1 (555) 000-0000",
      website: "acme.test",
      notes: "Hello",
      leadSourceRaw: "Website",
      locale: "en",
      sourceRef: "/contact"
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.value.intakePayload).toMatchObject({
      companyName: "Acme Ltd",
      contactFullName: "Dana Founder",
      emails: ["dana@acme.test"]
    });
    expect(result.value.locale).toBe("en");
    expect(result.value.sourceRef).toBe("/contact");
    expect(result.value.isHoneypotTripped).toBe(false);
  });

  it("rejects unsupported fields", () => {
    const result = validateWebsiteLeadSubmission({
      companyName: "Acme",
      unexpected: "nope"
    });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toMatch(/unsupported/i);
  });

  it("rejects invalid website URLs", () => {
    const result = validateWebsiteLeadSubmission({
      email: "test@example.com",
      website: "http://"
    });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toMatch(/website/i);
  });

  it("flags honeypot submissions without blocking validation", () => {
    const result = validateWebsiteLeadSubmission({
      email: "test@example.com",
      _hp: "filled"
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.isHoneypotTripped).toBe(true);
  });

  it("stages a website submission into a new intake batch with website metadata", async () => {
    const validation = validateWebsiteLeadSubmission({
      companyName: "Acme",
      contactFullName: "Dana Founder",
      emails: ["dana@acme.test"],
      phones: ["+1 555 000 0000"],
      notes: "Call me back",
      sourceRef: "/contact",
      locale: "he"
    });

    expect(validation.ok).toBe(true);
    if (!validation.ok) return;

    const staged = await stageWebsiteLeadSubmission({
      uploadedById: "user_admin",
      intake: validation.value,
      requestMeta: {
        origin: "https://example.com",
        referer: "https://example.com/contact",
        ip: "127.0.0.1",
        userAgent: "vitest"
      }
    });

    const batches = await listImportBatches();
    expect(batches).toHaveLength(1);
    expect(batches[0]?.intakeSource?.channel).toBe("website_form");
    expect(staged.batchId).toBe(batches[0]?.id);

    const review = await getImportBatchReview(staged.batchId);
    expect(review?.intakeSource?.channel).toBe("website_form");
    expect(review?.intakeSource?.submittedByType).toBe("public");
    expect(review?.rows).toHaveLength(1);
    expect(review?.rows[0]?.intakeEnvelope?.channel).toBe("website_form");
    expect(review?.rows[0]?.intakePayload?.emails).toEqual(["dana@acme.test"]);
    expect(review?.rows[0]?.intakePayload?.phones?.[0]).toMatch(/\d/);
  });
});
