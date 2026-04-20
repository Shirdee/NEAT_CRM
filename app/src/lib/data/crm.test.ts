import {beforeEach, describe, expect, it} from "vitest";

import {resetFallbackStore} from "./fallback-store";
import {
  createCompany,
  createContact,
  deleteCompany,
  deleteTask,
  getCompanyFilterOptions,
  getContactFilterOptions,
  getDashboardSnapshot,
  getCompanyById,
  getInteractionListFilterOptions,
  listOpportunities,
  listCompanies,
  listContacts,
  normalizeContactPayload,
  searchCrm,
  updateContact
} from "./crm";

describe("crm fallback repository", () => {
  beforeEach(() => {
    resetFallbackStore();
    delete process.env.DATABASE_URL;
  });

  it("lists seeded companies with contact counts", async () => {
    const companies = await listCompanies();

    expect(companies.length).toBeGreaterThan(1);
    expect(companies[0]).toHaveProperty("contactsCount");
  });

  it("creates a company and exposes it in search", async () => {
    const company = await createCompany({
      companyName: "Cedar Metrics",
      website: "https://cedar.example",
      sourceValueId: null,
      stageValueId: null,
      notes: "Searchable through Sprint 3",
      actorUserId: "user_admin"
    });

    const results = await searchCrm("cedar");

    expect(results.companies.some((item) => item.id === company.id)).toBe(true);
  });

  it("creates and updates a contact with multiple communication methods", async () => {
    const contact = await createContact({
      firstName: "Lior",
      lastName: "Amar",
      fullName: "Lior Amar",
      roleTitle: "Ops",
      companyId: null,
      notes: null,
      emails: ["lior@example.test", "lior.work@example.test"],
      primaryEmail: "lior.work@example.test",
      phones: ["050-111-2222"],
      primaryPhone: "050-111-2222",
      actorUserId: "user_editor"
    });

    await updateContact(contact.id, {
      firstName: "Lior",
      lastName: "Amar",
      fullName: "Lior Amar",
      roleTitle: "Operations Lead",
      companyId: "company_northern",
      notes: "Updated in Sprint 3",
      emails: ["lior.work@example.test"],
      primaryEmail: "lior.work@example.test",
      phones: ["050-111-2222", "050-333-4444"],
      primaryPhone: "050-333-4444",
      actorUserId: "user_admin"
    });

    const contacts = await listContacts({query: "lior"});
    const updated = contacts.find((item) => item.id === contact.id);

    expect(updated).toMatchObject({
      roleTitle: "Operations Lead",
      companyName: "Northern Light Labs",
      primaryPhone: "050-333-4444"
    });
  });

  it("returns related contacts on company detail", async () => {
    const company = await getCompanyById("company_northern");

    expect(company?.contacts.some((contact) => contact.fullName === "Maya Levi")).toBe(true);
  });

  it("blocks deleting a company with linked records", async () => {
    const opportunitiesBefore = await listOpportunities({companyId: "company_northern"});
    expect(opportunitiesBefore.length).toBeGreaterThan(0);

    const deleted = await deleteCompany("company_northern", "user_admin");

    expect(deleted).toBe(true);

    const companies = await listCompanies();
    const contacts = await listContacts({companyId: "company_northern"});
    const opportunitiesAfter = await listOpportunities({companyId: "company_northern"});

    expect(companies.some((item) => item.id === "company_northern")).toBe(false);
    expect(contacts.some((item) => item.companyId === "company_northern")).toBe(false);
    expect(opportunitiesAfter.length).toBe(0);
  });

  it("deletes a task without dependencies", async () => {
    const task = await deleteTask("task_talia_archive", "user_admin");

    expect(task).toBe(true);
  });

  it("normalizes contact payload from multiline form fields", () => {
    const payload = normalizeContactPayload({
      firstName: "Dana",
      lastName: "Shalev",
      roleTitle: "",
      companyId: "",
      notes: "",
      emailsText: "dana@example.test\ndana@example.test\n",
      primaryEmail: "",
      phonesText: "050-555-1111\n050-999-0000",
      primaryPhone: "050-999-0000",
      actorUserId: "user_admin"
    });

    expect(payload.fullName).toBe("Dana Shalev");
    expect(payload.emails).toEqual(["dana@example.test"]);
    expect(payload.primaryPhone).toBe("050-999-0000");
  });

  it("builds dashboard snapshot from fallback data", async () => {
    const snapshot = await getDashboardSnapshot(7);

    expect(snapshot.overdueTasksCount).toBeGreaterThanOrEqual(snapshot.overdueTasks.length);
    expect(snapshot.overdueTasks.length).toBeLessThanOrEqual(5);
    expect(snapshot.recentInteractions.length).toBeLessThanOrEqual(4);
    expect(snapshot.activeCompanies.length).toBeLessThanOrEqual(4);
  });

  it("returns lightweight list filter options", async () => {
    const [companies, contacts, interactionFilters] = await Promise.all([
      getCompanyFilterOptions(),
      getContactFilterOptions(),
      getInteractionListFilterOptions()
    ]);

    expect(companies.length).toBeGreaterThan(0);
    expect(contacts.length).toBeGreaterThan(0);
    expect(interactionFilters.interactionTypeOptions.length).toBeGreaterThan(0);
    expect(interactionFilters).not.toHaveProperty("outcomeOptions");
  });
});
