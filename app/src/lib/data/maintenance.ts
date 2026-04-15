import type {OpportunityListItem, TaskListItem} from "./crm";

import {
  listCompanies,
  listContacts,
  listOpportunities,
  listTasks,
  updateCompany,
  updateOpportunity,
  updateTask
} from "./crm";
import {mergeFallbackCompanies, mergeFallbackContacts} from "./fallback-store";

function hasDatabaseUrl() {
  return Boolean(process.env.DATABASE_URL?.trim());
}

async function getPrisma() {
  const {prisma} = await import("@/lib/prisma/client");

  return prisma;
}

export type BatchEditEntity = "companies" | "tasks" | "opportunities";

export type BatchEditField =
  | "sourceValueId"
  | "stageValueId"
  | "taskTypeValueId"
  | "priorityValueId"
  | "statusValueId"
  | "opportunityStageValueId"
  | "opportunityTypeValueId";

export type BatchFieldDefinition = {
  field: BatchEditField;
  categoryKey: string;
};

export const BATCH_EDIT_FIELDS: Record<BatchEditEntity, BatchFieldDefinition[]> = {
  companies: [
    {field: "sourceValueId", categoryKey: "lead_source"},
    {field: "stageValueId", categoryKey: "company_stage"}
  ],
  tasks: [
    {field: "taskTypeValueId", categoryKey: "task_type"},
    {field: "priorityValueId", categoryKey: "task_priority"},
    {field: "statusValueId", categoryKey: "task_status"}
  ],
  opportunities: [
    {field: "opportunityStageValueId", categoryKey: "opportunity_stage"},
    {field: "opportunityTypeValueId", categoryKey: "opportunity_type"},
    {field: "statusValueId", categoryKey: "opportunity_status"}
  ]
} as const;

export type DuplicateKind = "companies" | "contacts";

export type DuplicateRecord = {
  id: string;
  title: string;
  detail: string;
  meta: string[];
};

export type DuplicateGroup = {
  entity: DuplicateKind;
  key: string;
  reason: string;
  title: string;
  records: DuplicateRecord[];
};

export function normalizeMaintenanceKey(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFKC")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeDomain(value: string | null | undefined) {
  const raw = value?.trim();

  if (!raw) {
    return "";
  }

  try {
    const url = new URL(raw.includes("://") ? raw : `https://${raw}`);

    return url.hostname.replace(/^www\./i, "").toLowerCase();
  } catch {
    return raw.toLowerCase().replace(/^www\./i, "");
  }
}

function toRecordMeta(values: Array<string | null | undefined>) {
  return values.filter((value): value is string => Boolean(value && value.trim())).map((value) => value.trim());
}

function combineNotes(primary: string | null | undefined, duplicate: string | null | undefined) {
  const primaryNotes = primary?.trim() ?? "";
  const duplicateNotes = duplicate?.trim() ?? "";

  if (!primaryNotes) {
    return duplicateNotes || null;
  }

  if (!duplicateNotes || primaryNotes === duplicateNotes) {
    return primaryNotes;
  }

  return `${primaryNotes}\n\n${duplicateNotes}`;
}

type DuplicateCompanySource = {
  id: string;
  companyName: string;
  website: string | null;
  notes: string | null;
  createdAt: Date | string;
  contactsCount: number;
  sourceLabelEn?: string | null;
  stageLabelEn?: string | null;
};

type DuplicateContactSource = {
  id: string;
  fullName: string;
  companyName: string | null;
  primaryEmail: string | null;
  primaryPhone: string | null;
  createdAt: Date | string;
};

function groupItems<T>(items: T[], keyForItem: (item: T) => {key: string; reason: string; title: string}) {
  const groups = new Map<string, {reason: string; title: string; records: T[]}>();

  for (const item of items) {
    const descriptor = keyForItem(item);

    if (!descriptor.key) {
      continue;
    }

    const current = groups.get(descriptor.key);

    if (!current) {
      groups.set(descriptor.key, {reason: descriptor.reason, title: descriptor.title, records: [item]});
      continue;
    }

    current.records.push(item);
  }

  return Array.from(groups.entries())
    .filter(([, group]) => group.records.length > 1)
    .map(([key, group]) => ({key, ...group}));
}

function buildCompanyGroup(record: DuplicateCompanySource) {
  const nameKey = normalizeMaintenanceKey(record.companyName);
  const domainKey = normalizeDomain(record.website);

  if (nameKey) {
    return {
      key: `name:${nameKey}`,
      reason: "name",
      title: record.companyName
    };
  }

  if (domainKey) {
    return {
      key: `domain:${domainKey}`,
      reason: "website",
      title: record.website ?? domainKey
    };
  }

  return {key: "", reason: "name", title: record.companyName};
}

function buildContactGroup(record: DuplicateContactSource) {
  const emailKey = normalizeMaintenanceKey(record.primaryEmail ?? "");
  const phoneKey = normalizeMaintenanceKey(record.primaryPhone ?? "");
  const companyKey = normalizeMaintenanceKey(record.companyName ?? "");
  const nameKey = normalizeMaintenanceKey(record.fullName);

  if (emailKey) {
    return {
      key: `email:${emailKey}`,
      reason: "email",
      title: record.primaryEmail ?? record.fullName
    };
  }

  if (phoneKey) {
    return {
      key: `phone:${phoneKey}`,
      reason: "phone",
      title: record.primaryPhone ?? record.fullName
    };
  }

  const groupKey = companyKey ? `name-company:${nameKey}:${companyKey}` : `name:${nameKey}`;

  return {
    key: groupKey,
    reason: companyKey ? "name-company" : "name",
    title: record.fullName
  };
}

export async function applyBatchEdit(input: {
  entity: BatchEditEntity;
  field: BatchEditField;
  valueId: string;
  ids: string[];
  actorUserId: string;
}) {
  if (!input.ids.length) {
    throw new Error("Select at least one record.");
  }

  if (input.entity === "companies") {
    if (!["sourceValueId", "stageValueId"].includes(input.field)) {
      throw new Error("Unsupported company field.");
    }

    const companies = await listCompanies();
    const selected = companies.filter((company) => input.ids.includes(company.id));

    for (const company of selected) {
      await updateCompany(company.id, {
        companyName: company.companyName,
        website: company.website ?? null,
        sourceValueId: input.field === "sourceValueId" ? input.valueId : company.sourceValueId ?? null,
        stageValueId: input.field === "stageValueId" ? input.valueId : company.stageValueId ?? null,
        notes: company.notes ?? null,
        actorUserId: input.actorUserId
      });
    }

    return {count: selected.length};
  }

  if (input.entity === "tasks") {
    if (!["taskTypeValueId", "priorityValueId", "statusValueId"].includes(input.field)) {
      throw new Error("Unsupported task field.");
    }

    const tasks = await listTasks();
    const selected = tasks.filter((task) => input.ids.includes(task.id));

    for (const task of selected) {
      await updateTask(task.id, {
        companyId: task.companyId ?? null,
        contactId: task.contactId ?? null,
        relatedInteractionId: task.relatedInteractionId ?? null,
        taskTypeValueId: input.field === "taskTypeValueId" ? input.valueId : task.taskTypeValueId,
        dueDate:
          task.dueDate instanceof Date ? task.dueDate.toISOString() : new Date(task.dueDate).toISOString(),
        priorityValueId: input.field === "priorityValueId" ? input.valueId : task.priorityValueId,
        statusValueId: input.field === "statusValueId" ? input.valueId : task.statusValueId,
        notes: task.notes ?? null,
        actorUserId: input.actorUserId
      });
    }

    return {count: selected.length};
  }

  if (!["opportunityStageValueId", "opportunityTypeValueId", "statusValueId"].includes(input.field)) {
    throw new Error("Unsupported opportunity field.");
  }

  const opportunities = await listOpportunities();
  const selected = opportunities.filter((opportunity) => input.ids.includes(opportunity.id));

  for (const opportunity of selected) {
    await updateOpportunity(opportunity.id, {
      companyId: opportunity.companyId,
      contactId: opportunity.contactId ?? null,
      opportunityName: opportunity.opportunityName,
      opportunityStageValueId:
        input.field === "opportunityStageValueId"
          ? input.valueId
          : opportunity.opportunityStageValueId,
      opportunityTypeValueId:
        input.field === "opportunityTypeValueId" ? input.valueId : opportunity.opportunityTypeValueId,
      estimatedValue:
        opportunity.estimatedValue === null ? null : String(opportunity.estimatedValue),
      statusValueId: input.field === "statusValueId" ? input.valueId : opportunity.statusValueId,
      targetCloseDate:
        opportunity.targetCloseDate instanceof Date
          ? opportunity.targetCloseDate.toISOString()
          : opportunity.targetCloseDate ?? null,
      notes: opportunity.notes ?? null,
      actorUserId: input.actorUserId
    });
  }

  return {count: selected.length};
}

export async function listDuplicateGroups() {
  const [companies, contacts] = await Promise.all([listCompanies(), listContacts()]);

  const companyGroups = groupItems(companies, buildCompanyGroup).map(({key, reason, title, records}) => ({
    entity: "companies" as const,
    key,
    reason,
    title,
    records: records
      .slice()
      .sort((left, right) => new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime())
      .map((record) => ({
        id: record.id,
        title: record.companyName,
        detail: record.website ?? record.notes ?? "",
        meta: toRecordMeta([record.sourceLabelEn, record.stageLabelEn, `${record.contactsCount} contacts`])
      }))
  }));

  const contactGroups = groupItems(contacts, buildContactGroup).map(({key, reason, title, records}) => ({
    entity: "contacts" as const,
    key,
    reason,
    title,
    records: records
      .slice()
      .sort((left, right) => new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime())
      .map((record) => ({
        id: record.id,
        title: record.fullName,
        detail: record.companyName ?? record.primaryEmail ?? record.primaryPhone ?? "",
        meta: toRecordMeta([record.primaryEmail, record.primaryPhone, record.companyName])
      }))
  }));

  return {
    companies: companyGroups,
    contacts: contactGroups
  };
}

export async function mergeDuplicateRecord(input: {
  entity: DuplicateKind;
  primaryId: string;
  duplicateId: string;
  actorUserId: string;
}) {
  if (input.primaryId === input.duplicateId) {
    throw new Error("Select two different records.");
  }

  if (input.entity === "companies") {
    if (hasDatabaseUrl()) {
      const prisma = await getPrisma();
      const [primary, duplicate] = await Promise.all([
        prisma.company.findUnique({
          where: {id: input.primaryId},
          select: {
            id: true,
            companyName: true,
            website: true,
            sourceValueId: true,
            stageValueId: true,
            notes: true
          }
        }),
        prisma.company.findUnique({
          where: {id: input.duplicateId},
          select: {
            id: true,
            companyName: true,
            website: true,
            sourceValueId: true,
            stageValueId: true,
            notes: true
          }
        })
      ]);

      if (!primary || !duplicate) {
        throw new Error("Company not found");
      }

      await prisma.$transaction([
        prisma.company.update({
          where: {id: primary.id},
          data: {
            companyName: primary.companyName || duplicate.companyName,
            website: primary.website || duplicate.website,
            sourceValueId: primary.sourceValueId || duplicate.sourceValueId,
            stageValueId: primary.stageValueId || duplicate.stageValueId,
            notes: combineNotes(primary.notes, duplicate.notes),
            updatedById: input.actorUserId
          }
        }),
        prisma.contact.updateMany({
          where: {companyId: duplicate.id},
          data: {
            companyId: primary.id,
            updatedById: input.actorUserId
          }
        }),
        prisma.interaction.updateMany({
          where: {companyId: duplicate.id},
          data: {companyId: primary.id}
        }),
        prisma.task.updateMany({
          where: {companyId: duplicate.id},
          data: {companyId: primary.id}
        }),
        prisma.opportunity.updateMany({
          where: {companyId: duplicate.id},
          data: {
            companyId: primary.id,
            updatedById: input.actorUserId
          }
        }),
        prisma.company.delete({
          where: {id: duplicate.id}
        })
      ]);

      return {mergedId: primary.id};
    }

    await mergeFallbackCompanies(input.primaryId, input.duplicateId, input.actorUserId);
    return {mergedId: input.primaryId};
  }

  if (hasDatabaseUrl()) {
    const prisma = await getPrisma();
    const [primary, duplicate] = await Promise.all([
      prisma.contact.findUnique({
        where: {id: input.primaryId},
        include: {
          emails: true,
          phones: true
        }
      }),
      prisma.contact.findUnique({
        where: {id: input.duplicateId},
        include: {
          emails: true,
          phones: true
        }
      })
    ]);

    if (!primary || !duplicate) {
      throw new Error("Contact not found");
    }

    const mergedEmails = Array.from(
      new Map(
        [...primary.emails, ...duplicate.emails].map((email) => [email.email.trim().toLowerCase(), email.email])
      ).values()
    );
    const primaryEmail =
      primary.emails.find((email) => email.isPrimary)?.email ??
      duplicate.emails.find((email) => email.isPrimary)?.email ??
      mergedEmails[0] ??
      null;
    const mergedPhones = Array.from(
      new Map(
        [...primary.phones, ...duplicate.phones].map((phone) => [
          phone.phoneNumber.trim().toLowerCase(),
          phone.phoneNumber
        ])
      ).values()
    );
    const primaryPhone =
      primary.phones.find((phone) => phone.isPrimary)?.phoneNumber ??
      duplicate.phones.find((phone) => phone.isPrimary)?.phoneNumber ??
      mergedPhones[0] ??
      null;

    await prisma.$transaction([
        prisma.contact.update({
          where: {id: primary.id},
          data: {
            firstName: primary.firstName || duplicate.firstName,
            lastName: primary.lastName || duplicate.lastName,
            fullName: primary.fullName || duplicate.fullName,
            roleTitle: primary.roleTitle || duplicate.roleTitle,
            companyId: primary.companyId || duplicate.companyId,
            notes: combineNotes(primary.notes, duplicate.notes),
            updatedById: input.actorUserId,
            emails: {
            deleteMany: {},
            create: mergedEmails.map((email) => ({
              email,
              isPrimary: primaryEmail ? email.trim().toLowerCase() === primaryEmail.trim().toLowerCase() : false
            }))
          },
          phones: {
            deleteMany: {},
            create: mergedPhones.map((phone) => ({
              phoneNumber: phone,
              isPrimary: primaryPhone ? phone.trim().toLowerCase() === primaryPhone.trim().toLowerCase() : false
            }))
          }
        }
      }),
      prisma.interaction.updateMany({
        where: {contactId: duplicate.id},
        data: {contactId: primary.id}
      }),
      prisma.task.updateMany({
        where: {contactId: duplicate.id},
        data: {contactId: primary.id}
      }),
      prisma.opportunity.updateMany({
        where: {contactId: duplicate.id},
        data: {
          contactId: primary.id,
          updatedById: input.actorUserId
        }
      }),
      prisma.contact.delete({
        where: {id: duplicate.id}
      })
    ]);

    return {mergedId: primary.id};
  }

  await mergeFallbackContacts(input.primaryId, input.duplicateId, input.actorUserId);
  return {mergedId: input.primaryId};
}
