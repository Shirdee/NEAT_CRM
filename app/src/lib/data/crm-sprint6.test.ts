import {beforeEach, describe, expect, it} from "vitest";

import {resetFallbackStore} from "./fallback-store";
import {
  createOpportunity,
  getOpportunityById,
  getOpportunityFormOptions,
  listOpportunities,
  normalizeOpportunityPayload,
  updateOpportunity
} from "./crm";

describe("crm sprint 6 opportunity data access", () => {
  beforeEach(() => {
    resetFallbackStore();
    delete process.env.DATABASE_URL;
  });

  it("returns opportunity form options with lookup categories", async () => {
    const options = await getOpportunityFormOptions();

    expect(options.companies.length).toBeGreaterThan(0);
    expect(options.stageOptions.some((option) => option.key === "qualified")).toBe(true);
    expect(options.typeOptions.some((option) => option.key === "new_business")).toBe(true);
    expect(options.statusOptions.some((option) => option.key === "open")).toBe(true);
  });

  it("creates and returns an opportunity with mapped labels", async () => {
    const [stageOption] = (await getOpportunityFormOptions()).stageOptions;
    const [typeOption] = (await getOpportunityFormOptions()).typeOptions;
    const [statusOption] = (await getOpportunityFormOptions()).statusOptions;

    const payload = normalizeOpportunityPayload({
      companyId: "company_northern",
      contactId: "contact_maya",
      opportunityName: "Expansion phase 2",
      opportunityStageValueId: stageOption?.id ?? "",
      opportunityTypeValueId: typeOption?.id ?? "",
      estimatedValue: "32000",
      statusValueId: statusOption?.id ?? "",
      targetCloseDate: "2026-06-20",
      notes: "Priority deal for quarter close.",
      actorUserId: "user_admin"
    });

    const created = await createOpportunity(payload);
    const detail = await getOpportunityById(created.id);

    expect(detail).toMatchObject({
      opportunityName: "Expansion phase 2",
      companyName: "Northern Light Labs",
      contactName: "Maya Levi"
    });
    expect(detail?.stageLabelEn).toBeTruthy();
    expect(detail?.typeLabelEn).toBeTruthy();
    expect(detail?.statusLabelEn).toBeTruthy();
  });

  it("updates opportunity fields and supports filtered listing", async () => {
    const options = await getOpportunityFormOptions();
    const stageId = options.stageOptions[1]?.id ?? options.stageOptions[0]?.id ?? "";
    const typeId = options.typeOptions[1]?.id ?? options.typeOptions[0]?.id ?? "";
    const statusId = options.statusOptions.find((option) => option.key === "won")?.id ?? options.statusOptions[0]?.id ?? "";

    await updateOpportunity(
      "opportunity_northern_discovery",
      normalizeOpportunityPayload({
        companyId: "company_northern",
        contactId: "contact_maya",
        opportunityName: "CRM rollout pilot - final",
        opportunityStageValueId: stageId,
        opportunityTypeValueId: typeId,
        estimatedValue: "50000",
        statusValueId: statusId,
        targetCloseDate: "2026-05-20",
        notes: "Marked for close.",
        actorUserId: "user_editor"
      })
    );

    const items = await listOpportunities({
      companyId: "company_northern",
      query: "rollout pilot - final"
    });

    expect(items.some((item) => item.id === "opportunity_northern_discovery")).toBe(true);
  });
});
