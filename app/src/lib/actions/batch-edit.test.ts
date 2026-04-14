import {beforeEach, describe, expect, it, vi} from "vitest";

const {
  revalidatePath,
  getCurrentSession,
  getCompanyFormOptions,
  getOpportunityFormOptions,
  companyUpdateMany,
  opportunityUpdateMany
} = vi.hoisted(() => ({
  revalidatePath: vi.fn(),
  getCurrentSession: vi.fn(),
  getCompanyFormOptions: vi.fn(),
  getOpportunityFormOptions: vi.fn(),
  companyUpdateMany: vi.fn(),
  opportunityUpdateMany: vi.fn()
}));

vi.mock("next/cache", () => ({
  revalidatePath
}));

vi.mock("@/lib/auth/session", () => ({
  getCurrentSession,
  isLocale: (value: string) => value === "en" || value === "he"
}));

vi.mock("@/lib/data/crm", () => ({
  getCompanyFormOptions,
  getOpportunityFormOptions
}));

vi.mock("@/lib/prisma/client", () => ({
  prisma: {
    company: {
      updateMany: companyUpdateMany
    },
    opportunity: {
      updateMany: opportunityUpdateMany
    }
  }
}));

import {batchUpdateCompaniesAction, batchUpdateOpportunitiesAction} from "./batch-edit";

describe("admin batch edit actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    getCurrentSession.mockResolvedValue({
      id: "user_admin",
      email: "admin@crm.local",
      fullName: "Admin",
      role: "admin",
      languagePreference: "en"
    });
    getCompanyFormOptions.mockResolvedValue({
      sourceOptions: [{id: "source-ok", labelEn: "Referral", labelHe: "Referral"}],
      stageOptions: [{id: "stage-ok", labelEn: "Active", labelHe: "Active"}]
    });
    getOpportunityFormOptions.mockResolvedValue({
      stageOptions: [{id: "opp-stage-ok", labelEn: "Qualified", labelHe: "Qualified"}],
      statusOptions: [{id: "opp-status-ok", labelEn: "Open", labelHe: "Open"}]
    });
    companyUpdateMany.mockResolvedValue({count: 1});
    opportunityUpdateMany.mockResolvedValue({count: 1});
  });

  it("rejects company updates with a forged source id", async () => {
    const result = await batchUpdateCompaniesAction({
      locale: "en",
      ids: ["company-1"],
      sourceValueId: "forged-source"
    });

    expect(result).toEqual({
      ok: false,
      message: "Invalid company source."
    });
    expect(companyUpdateMany).not.toHaveBeenCalled();
  });

  it("rejects opportunity updates with a forged status id", async () => {
    const result = await batchUpdateOpportunitiesAction({
      locale: "en",
      ids: ["opportunity-1"],
      statusValueId: "forged-status"
    });

    expect(result).toEqual({
      ok: false,
      message: "Invalid opportunity status."
    });
    expect(opportunityUpdateMany).not.toHaveBeenCalled();
  });

  it("accepts allowed company lookup ids and revalidates affected pages", async () => {
    const result = await batchUpdateCompaniesAction({
      locale: "en",
      ids: ["company-1", "company-2"],
      sourceValueId: "source-ok",
      stageValueId: "stage-ok"
    });

    expect(result).toEqual({ok: true});
    expect(companyUpdateMany).toHaveBeenCalledWith({
      where: {id: {in: ["company-1", "company-2"]}},
      data: {
        sourceValueId: "source-ok",
        stageValueId: "stage-ok"
      }
    });
    expect(revalidatePath).toHaveBeenCalledWith("/en/companies");
    expect(revalidatePath).toHaveBeenCalledWith("/en/dashboard");
  });
});
