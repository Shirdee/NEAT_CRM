import {beforeEach, describe, expect, it} from "vitest";

import {listLookupOptions} from "@/lib/data/crm";
import {
  createFallbackCompany,
  createFallbackContact,
  createFallbackInteraction,
  createFallbackOpportunity,
  createFallbackTask,
  listFallbackCompanies,
  listFallbackContacts,
  resetFallbackStore
} from "@/lib/data/fallback-store";

import {applyBatchEdit, mergeDuplicateRecord, listDuplicateGroups} from "./maintenance";

describe("maintenance helpers", () => {
  beforeEach(() => {
    resetFallbackStore();
  });

  it("applies a limited batch edit to selected companies", async () => {
    const [sourceValue] = await listLookupOptions("lead_source");
    const company = await createFallbackCompany({
      companyName: "Batch Target",
      website: null,
      sourceValueId: null,
      stageValueId: null,
      notes: null,
      actorUserId: "user_admin"
    });

    const result = await applyBatchEdit({
      entity: "companies",
      field: "sourceValueId",
      valueId: sourceValue?.id ?? "",
      ids: [company.id],
      actorUserId: "user_admin"
    });

    const updated = await listFallbackCompanies();

    expect(result.count).toBe(1);
    expect(updated[0]?.sourceValueId).toBe(sourceValue?.id ?? "");
  });

  it("groups Hebrew names for duplicate cleanup", async () => {
    await createFallbackCompany({
      companyName: "טלמר",
      website: null,
      sourceValueId: null,
      stageValueId: null,
      notes: null,
      actorUserId: "user_admin"
    });
    await createFallbackCompany({
      companyName: "טלמר",
      website: "https://example.org",
      sourceValueId: null,
      stageValueId: null,
      notes: null,
      actorUserId: "user_admin"
    });

    const groups = await listDuplicateGroups();

    expect(groups.companies.some((group) => group.title === "טלמר")).toBe(true);
  });

  it("merges duplicate companies and keeps related records", async () => {
    const [interactionType] = await listLookupOptions("interaction_type");
    const [taskType] = await listLookupOptions("task_type");
    const [taskPriority] = await listLookupOptions("task_priority");
    const [taskStatus] = await listLookupOptions("task_status");
    const [opportunityStage] = await listLookupOptions("opportunity_stage");
    const [opportunityType] = await listLookupOptions("opportunity_type");
    const [opportunityStatus] = await listLookupOptions("opportunity_status");

    const primary = await createFallbackCompany({
      companyName: "Duplicate Co",
      website: null,
      sourceValueId: null,
      stageValueId: null,
      notes: "Primary note",
      actorUserId: "user_admin"
    });
    const duplicate = await createFallbackCompany({
      companyName: "Duplicate Co",
      website: "https://duplicate.example",
      sourceValueId: null,
      stageValueId: null,
      notes: "Duplicate note",
      actorUserId: "user_admin"
    });
    const contact = await createFallbackContact({
      firstName: "Noa",
      lastName: "Tester",
      fullName: "Noa Tester",
      roleTitle: null,
      companyId: duplicate.id,
      notes: null,
      emails: ["noa@example.com"],
      primaryEmail: "noa@example.com",
      phones: ["050-1111111"],
      primaryPhone: "050-1111111",
      actorUserId: "user_admin"
    });
    await createFallbackInteraction({
      interactionDate: "2026-04-10T10:00:00.000Z",
      companyId: duplicate.id,
      contactId: contact.id,
      interactionTypeValueId: interactionType?.id ?? "",
      subject: "Follow-up",
      summary: "Call moved to primary company",
      outcomeStatusValueId: null,
      actorUserId: "user_admin"
    });
    await createFallbackTask({
      companyId: duplicate.id,
      contactId: contact.id,
      relatedInteractionId: null,
      taskTypeValueId: taskType?.id ?? "",
      dueDate: "2026-04-11T10:00:00.000Z",
      priorityValueId: taskPriority?.id ?? "",
      statusValueId: taskStatus?.id ?? "",
      notes: "Duplicate task",
      actorUserId: "user_admin",
      completedAt: null
    });
    await createFallbackOpportunity({
      companyId: duplicate.id,
      contactId: contact.id,
      opportunityName: "Duplicate deal",
      opportunityStageValueId: opportunityStage?.id ?? "",
      opportunityTypeValueId: opportunityType?.id ?? "",
      estimatedValue: "1200",
      statusValueId: opportunityStatus?.id ?? "",
      targetCloseDate: null,
      notes: "Duplicate opportunity",
      actorUserId: "user_admin"
    });

    const groupsBefore = await listDuplicateGroups();
    expect(groupsBefore.companies.length).toBeGreaterThan(0);

    await mergeDuplicateRecord({
      entity: "companies",
      primaryId: primary.id,
      duplicateId: duplicate.id,
      actorUserId: "user_admin"
    });

    const companies = await listFallbackCompanies();
    const contacts = await listFallbackContacts({companyId: primary.id});
    const mergedContact = contacts.find((item) => item.id === contact.id);
    const mergedCompany = companies.find((item) => item.id === primary.id);

    expect(companies.some((item) => item.id === duplicate.id)).toBe(false);
    expect(contacts.some((item) => item.id === contact.id)).toBe(true);
    expect(mergedContact?.companyId).toBe(primary.id);
    expect(mergedCompany?.notes).toContain("Primary note");
    expect(mergedCompany?.notes).toContain("Duplicate note");
  });

  it("merges duplicate contacts and preserves related values", async () => {
    const company = await createFallbackCompany({
      companyName: "Contact Merge Co",
      website: null,
      sourceValueId: null,
      stageValueId: null,
      notes: null,
      actorUserId: "user_admin"
    });
    const primary = await createFallbackContact({
      firstName: "Amit",
      lastName: "One",
      fullName: "Amit One",
      roleTitle: null,
      companyId: company.id,
      notes: "Primary contact",
      emails: ["amit.one@example.com"],
      primaryEmail: "amit.one@example.com",
      phones: ["050-1111111"],
      primaryPhone: "050-1111111",
      actorUserId: "user_admin"
    });
    const duplicate = await createFallbackContact({
      firstName: "Amit",
      lastName: "One",
      fullName: "Amit One",
      roleTitle: "CEO",
      companyId: company.id,
      notes: "Duplicate contact",
      emails: ["amit.one+alt@example.com"],
      primaryEmail: "amit.one+alt@example.com",
      phones: ["050-2222222"],
      primaryPhone: "050-2222222",
      actorUserId: "user_admin"
    });
    await createFallbackInteraction({
      interactionDate: "2026-04-10T10:00:00.000Z",
      companyId: company.id,
      contactId: duplicate.id,
      interactionTypeValueId: (await listLookupOptions("interaction_type"))[0]?.id ?? "",
      subject: "Contact merge",
      summary: "Relink this interaction",
      outcomeStatusValueId: null,
      actorUserId: "user_admin"
    });

    await mergeDuplicateRecord({
      entity: "contacts",
      primaryId: primary.id,
      duplicateId: duplicate.id,
      actorUserId: "user_admin"
    });

    const contacts = await listFallbackContacts({companyId: company.id});
    const mergedPrimary = contacts.find((item) => item.id === primary.id);

    expect(contacts.some((item) => item.id === duplicate.id)).toBe(false);
    expect(contacts.some((item) => item.id === primary.id)).toBe(true);
    expect(mergedPrimary?.primaryEmail).toBe("amit.one@example.com");
    expect(mergedPrimary?.primaryPhone).toBe("050-1111111");
  });

  it("rejects self merges", async () => {
    const company = await createFallbackCompany({
      companyName: "Self Merge Co",
      website: null,
      sourceValueId: null,
      stageValueId: null,
      notes: null,
      actorUserId: "user_admin"
    });

    await expect(
      mergeDuplicateRecord({
        entity: "companies",
        primaryId: company.id,
        duplicateId: company.id,
        actorUserId: "user_admin"
      })
    ).rejects.toThrow("Select two different records.");
  });
});
