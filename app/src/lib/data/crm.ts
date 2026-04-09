import type {
  Company,
  Contact,
  ContactEmail,
  ContactPhone,
  Interaction,
  ListValue,
  Task
} from "@prisma/client";

import {
  createFallbackCompany,
  createFallbackContact,
  createFallbackInteraction,
  createFallbackTask,
  getFallbackInteractionById,
  getFallbackTaskById,
  getFallbackCompanyById,
  getFallbackContactById,
  listFallbackCompanies,
  listFallbackCompanyOptions,
  listFallbackContacts,
  listFallbackInteractions,
  listFallbackLookupValues,
  listFallbackTasks,
  searchFallbackCrm,
  updateFallbackCompany,
  updateFallbackContact,
  updateFallbackInteraction,
  updateFallbackTask
} from "./fallback-store";

function hasDatabaseUrl() {
  return Boolean(process.env.DATABASE_URL?.trim());
}

async function getPrisma() {
  const {prisma} = await import("@/lib/prisma/client");

  return prisma;
}

export type LookupOption = {
  id: string;
  key: string;
  labelEn: string;
  labelHe: string;
};

export type CompanyInput = {
  companyName: string;
  website: string | null;
  sourceValueId: string | null;
  stageValueId: string | null;
  notes: string | null;
  actorUserId: string;
};

export type ContactInput = {
  firstName: string | null;
  lastName: string | null;
  fullName: string;
  roleTitle: string | null;
  companyId: string | null;
  notes: string | null;
  emails: string[];
  primaryEmail: string | null;
  phones: string[];
  primaryPhone: string | null;
  actorUserId: string;
};

export type InteractionInput = {
  interactionDate: string;
  companyId: string | null;
  contactId: string | null;
  interactionTypeValueId: string;
  subject: string;
  summary: string;
  outcomeStatusValueId: string | null;
  actorUserId: string;
};

export type TaskInput = {
  companyId: string | null;
  contactId: string | null;
  relatedInteractionId: string | null;
  taskTypeValueId: string;
  dueDate: string;
  priorityValueId: string;
  statusValueId: string;
  notes: string | null;
  actorUserId: string;
};

export type CompanyListItem = Company & {
  contactsCount: number;
  sourceLabelEn?: string | null;
  sourceLabelHe?: string | null;
  stageLabelEn?: string | null;
  stageLabelHe?: string | null;
};

export type ContactListItem = Contact & {
  companyName: string | null;
  primaryEmail: string | null;
  primaryPhone: string | null;
};

export type CompanyDetail = Company & {
  contacts: Array<{
    id: string;
    fullName: string;
    roleTitle: string | null;
    primaryEmail: string | null;
    primaryPhone: string | null;
  }>;
  sourceLabelEn?: string | null;
  sourceLabelHe?: string | null;
  stageLabelEn?: string | null;
  stageLabelHe?: string | null;
  lastInteractionDate?: Date | string | null;
  openTasksCount?: number;
  overdueTasksCount?: number;
  inactivityLabel?: "active" | "stale";
};

export type ContactDetail = Contact & {
  companyName: string | null;
  emails: ContactEmail[];
  phones: ContactPhone[];
  lastInteractionDate?: Date | string | null;
  openTasksCount?: number;
  overdueTasksCount?: number;
  inactivityLabel?: "active" | "stale";
};

export type InteractionListItem = Interaction & {
  companyName: string | null;
  contactName: string | null;
  interactionTypeLabelEn?: string | null;
  interactionTypeLabelHe?: string | null;
  outcomeLabelEn?: string | null;
  outcomeLabelHe?: string | null;
};

export type InteractionDetail = Interaction & {
  companyName: string | null;
  contactName: string | null;
  interactionTypeLabelEn?: string | null;
  interactionTypeLabelHe?: string | null;
  outcomeLabelEn?: string | null;
  outcomeLabelHe?: string | null;
  relatedTasks: Array<{
    id: string;
    dueDate: Date | string;
    notes: string | null;
    statusValueId: string;
    statusLabelEn?: string | null;
    statusLabelHe?: string | null;
  }>;
};

export type TaskListItem = Task & {
  companyName: string | null;
  contactName: string | null;
  taskTypeLabelEn?: string | null;
  taskTypeLabelHe?: string | null;
  priorityLabelEn?: string | null;
  priorityLabelHe?: string | null;
  statusLabelEn?: string | null;
  statusLabelHe?: string | null;
};

export type TaskDetail = Task & {
  companyName: string | null;
  contactName: string | null;
  interactionSubject: string | null;
  taskTypeLabelEn?: string | null;
  taskTypeLabelHe?: string | null;
  priorityLabelEn?: string | null;
  priorityLabelHe?: string | null;
  statusLabelEn?: string | null;
  statusLabelHe?: string | null;
};

function normalizeLookupOptions(values: ListValue[]): LookupOption[] {
  return values.map((value) => ({
    id: value.id,
    key: value.key,
    labelEn: value.labelEn,
    labelHe: value.labelHe
  }));
}

function buildLookupMap(values: LookupOption[]) {
  return new Map(values.map((value) => [value.id, value]));
}

const INACTIVITY_THRESHOLD_DAYS = 14;

function deriveInactivityLabel(lastInteractionDate: Date | string | null | undefined) {
  if (!lastInteractionDate) {
    return "stale";
  }

  const diffMs = Date.now() - new Date(lastInteractionDate).getTime();
  const thresholdMs = INACTIVITY_THRESHOLD_DAYS * 24 * 60 * 60 * 1000;

  return diffMs > thresholdMs ? "stale" : "active";
}

async function getTaskStatusKey(statusValueId: string) {
  const options = await listLookupOptions("task_status");
  return options.find((option) => option.id === statusValueId)?.key ?? null;
}

function normalizeText(value: string) {
  return value.trim();
}

function cleanOptional(value: string | null | undefined) {
  const normalized = String(value ?? "").trim();
  return normalized ? normalized : null;
}

export class ValidationError extends Error {
  fields: string[];

  constructor(message: string, fields: string[]) {
    super(message);
    this.name = "ValidationError";
    this.fields = fields;
  }
}

function cleanRequired(value: string | null | undefined, field: string) {
  const normalized = cleanOptional(value);

  if (!normalized) {
    throw new Error(`${field} is required.`);
  }

  return normalized;
}

function dedupeValues(values: string[]) {
  const seen = new Set<string>();

  return values
    .map((value) => value.trim())
    .filter((value) => {
      const key = value.toLowerCase();

      if (!key || seen.has(key)) {
        return false;
      }

      seen.add(key);
      return true;
    });
}

export function parseLinesField(value: FormDataEntryValue | null) {
  return dedupeValues(
    String(value ?? "")
      .split(/\r?\n/)
      .map((line) => line.trim())
  );
}

export function normalizeCompanyPayload(input: {
  companyName: string;
  website: string;
  sourceValueId: string;
  stageValueId: string;
  notes: string;
  actorUserId: string;
}): CompanyInput {
  const companyName = normalizeText(input.companyName);

  if (!companyName) {
    throw new ValidationError("Company name is required.", ["companyName"]);
  }

  return {
    companyName,
    website: cleanOptional(input.website),
    sourceValueId: cleanOptional(input.sourceValueId),
    stageValueId: cleanOptional(input.stageValueId),
    notes: cleanOptional(input.notes),
    actorUserId: input.actorUserId
  };
}

export function normalizeContactPayload(input: {
  firstName: string;
  lastName: string;
  roleTitle: string;
  companyId: string;
  notes: string;
  emailsText: FormDataEntryValue | null;
  primaryEmail: string;
  phonesText: FormDataEntryValue | null;
  primaryPhone: string;
  actorUserId: string;
}): ContactInput {
  const firstName = cleanOptional(input.firstName);
  const lastName = cleanOptional(input.lastName);
  const fullName = [firstName, lastName].filter(Boolean).join(" ").trim();

  if (!fullName) {
    throw new ValidationError("Contact name is required.", ["firstName", "lastName"]);
  }

  const emails = parseLinesField(input.emailsText);
  const phones = parseLinesField(input.phonesText);

  if (emails.length === 0 && phones.length === 0) {
    throw new ValidationError("At least one email or phone number is required.", ["emailsText", "phonesText"]);
  }

  const primaryEmail = cleanOptional(input.primaryEmail);
  const primaryPhone = cleanOptional(input.primaryPhone);

  return {
    firstName,
    lastName,
    fullName,
    roleTitle: cleanOptional(input.roleTitle),
    companyId: cleanOptional(input.companyId),
    notes: cleanOptional(input.notes),
    emails,
    primaryEmail: primaryEmail && emails.some((email) => email.toLowerCase() === primaryEmail.toLowerCase())
      ? primaryEmail
      : emails[0] ?? null,
    phones,
    primaryPhone: primaryPhone && phones.some((phone) => phone.toLowerCase() === primaryPhone.toLowerCase())
      ? primaryPhone
      : phones[0] ?? null,
    actorUserId: input.actorUserId
  };
}

export function normalizeInteractionPayload(input: {
  interactionDate: string;
  companyId: string;
  contactId: string;
  interactionTypeValueId: string;
  subject: string;
  summary: string;
  outcomeStatusValueId: string;
  actorUserId: string;
}): InteractionInput {
  const interactionDate = cleanRequired(input.interactionDate, "Interaction date");
  const interactionTypeValueId = cleanRequired(input.interactionTypeValueId, "Interaction type");
  const subject = cleanRequired(input.subject, "Subject");
  const summary = cleanRequired(input.summary, "Summary");
  const companyId = cleanOptional(input.companyId);
  const contactId = cleanOptional(input.contactId);

  const missingFields: string[] = [];
  if (!cleanOptional(input.interactionDate)) missingFields.push("interactionDate");
  if (!cleanOptional(input.interactionTypeValueId)) missingFields.push("interactionTypeValueId");
  if (!cleanOptional(input.subject)) missingFields.push("subject");
  if (!cleanOptional(input.summary)) missingFields.push("summary");
  if (!companyId && !contactId) {
    missingFields.push("companyId", "contactId");
  }

  if (missingFields.length > 0) {
    throw new ValidationError("Interaction validation failed.", missingFields);
  }

  return {
    interactionDate,
    companyId,
    contactId,
    interactionTypeValueId,
    subject,
    summary,
    outcomeStatusValueId: cleanOptional(input.outcomeStatusValueId),
    actorUserId: input.actorUserId
  };
}

export function normalizeTaskPayload(input: {
  companyId: string;
  contactId: string;
  relatedInteractionId: string;
  taskTypeValueId: string;
  dueDate: string;
  priorityValueId: string;
  statusValueId: string;
  notes: string;
  actorUserId: string;
}): TaskInput {
  const taskTypeValueId = cleanRequired(input.taskTypeValueId, "Task type");
  const dueDate = cleanRequired(input.dueDate, "Due date");
  const priorityValueId = cleanRequired(input.priorityValueId, "Priority");
  const statusValueId = cleanRequired(input.statusValueId, "Status");
  const companyId = cleanOptional(input.companyId);
  const contactId = cleanOptional(input.contactId);

  const missingFields: string[] = [];
  if (!cleanOptional(input.taskTypeValueId)) missingFields.push("taskTypeValueId");
  if (!cleanOptional(input.dueDate)) missingFields.push("dueDate");
  if (!cleanOptional(input.priorityValueId)) missingFields.push("priorityValueId");
  if (!cleanOptional(input.statusValueId)) missingFields.push("statusValueId");
  if (!companyId && !contactId) {
    missingFields.push("companyId", "contactId");
  }

  if (missingFields.length > 0) {
    throw new ValidationError("Task validation failed.", missingFields);
  }

  return {
    companyId,
    contactId,
    relatedInteractionId: cleanOptional(input.relatedInteractionId),
    taskTypeValueId,
    dueDate,
    priorityValueId,
    statusValueId,
    notes: cleanOptional(input.notes),
    actorUserId: input.actorUserId
  };
}

export async function listLookupOptions(categoryKey: string) {
  if (!hasDatabaseUrl()) {
    return listFallbackLookupValues(categoryKey);
  }

  try {
    const prisma = await getPrisma();
    const values = await prisma.listValue.findMany({
      where: {
        category: {
          key: categoryKey
        },
        isActive: true
      },
      orderBy: [{sortOrder: "asc"}, {labelEn: "asc"}]
    });

    if (values.length === 0) {
      return listFallbackLookupValues(categoryKey);
    }

    return normalizeLookupOptions(values);
  } catch {
    return listFallbackLookupValues(categoryKey);
  }
}

export async function getCompanyFormOptions() {
  const [sourceOptions, stageOptions] = await Promise.all([
    listLookupOptions("lead_source"),
    listLookupOptions("company_stage")
  ]);

  return {sourceOptions, stageOptions};
}

export async function getContactFormOptions() {
  if (!hasDatabaseUrl()) {
    return {
      companies: await listFallbackCompanyOptions()
    };
  }

  const prisma = await getPrisma();
  const companies = await prisma.company.findMany({
    select: {
      id: true,
      companyName: true
    },
    orderBy: {
      companyName: "asc"
    }
  });

  return {companies};
}

export async function getInteractionFormOptions() {
  const [{companies}, interactionTypeOptions, outcomeOptions] = await Promise.all([
    getContactFormOptions(),
    listLookupOptions("interaction_type"),
    listLookupOptions("interaction_outcome_status")
  ]);
  const contacts = await listContacts();

  return {
    companies,
    contacts: contacts.map((contact) => ({
      id: contact.id,
      fullName: contact.fullName,
      companyId: contact.companyId ?? null
    })),
    interactionTypeOptions,
    outcomeOptions
  };
}

export async function getTaskFormOptions() {
  const [{companies}, taskTypeOptions, priorityOptions, statusOptions] = await Promise.all([
    getContactFormOptions(),
    listLookupOptions("task_type"),
    listLookupOptions("task_priority"),
    listLookupOptions("task_status")
  ]);
  const contacts = await listContacts();
  const interactions = await listInteractions();

  return {
    companies,
    contacts: contacts.map((contact) => ({
      id: contact.id,
      fullName: contact.fullName,
      companyId: contact.companyId ?? null
    })),
    interactions: interactions.map((interaction) => ({
      id: interaction.id,
      subject: interaction.subject
    })),
    taskTypeOptions,
    priorityOptions,
    statusOptions
  };
}

export async function listCompanies(filters?: {
  query?: string;
  sourceValueId?: string;
  stageValueId?: string;
}) {
  if (!hasDatabaseUrl()) {
    const [items, sourceOptions, stageOptions] = await Promise.all([
      listFallbackCompanies(filters),
      listLookupOptions("lead_source"),
      listLookupOptions("company_stage")
    ]);
    const sourceMap = buildLookupMap(sourceOptions);
    const stageMap = buildLookupMap(stageOptions);

    return items.map((item) => ({
      ...item,
      sourceLabelEn: item.sourceValueId ? sourceMap.get(item.sourceValueId)?.labelEn ?? null : null,
      sourceLabelHe: item.sourceValueId ? sourceMap.get(item.sourceValueId)?.labelHe ?? null : null,
      stageLabelEn: item.stageValueId ? stageMap.get(item.stageValueId)?.labelEn ?? null : null,
      stageLabelHe: item.stageValueId ? stageMap.get(item.stageValueId)?.labelHe ?? null : null
    }));
  }

  const prisma = await getPrisma();
  const companies = await prisma.company.findMany({
    where: {
      sourceValueId: filters?.sourceValueId || undefined,
      stageValueId: filters?.stageValueId || undefined,
      OR: filters?.query
        ? [
            {companyName: {contains: filters.query, mode: "insensitive"}},
            {website: {contains: filters.query, mode: "insensitive"}},
            {notes: {contains: filters.query, mode: "insensitive"}}
          ]
        : undefined
    },
    include: {
      contacts: {
        select: {
          id: true
        }
      }
    },
    orderBy: {
      companyName: "asc"
    }
  });

  const [sourceOptions, stageOptions] = await Promise.all([
    listLookupOptions("lead_source"),
    listLookupOptions("company_stage")
  ]);
  const sourceMap = buildLookupMap(sourceOptions);
  const stageMap = buildLookupMap(stageOptions);

  return companies.map((company) => ({
    ...company,
    contactsCount: company.contacts.length,
    sourceLabelEn: company.sourceValueId ? sourceMap.get(company.sourceValueId)?.labelEn ?? null : null,
    sourceLabelHe: company.sourceValueId ? sourceMap.get(company.sourceValueId)?.labelHe ?? null : null,
    stageLabelEn: company.stageValueId ? stageMap.get(company.stageValueId)?.labelEn ?? null : null,
    stageLabelHe: company.stageValueId ? stageMap.get(company.stageValueId)?.labelHe ?? null : null
  }));
}

export async function getCompanyById(id: string) {
  if (!hasDatabaseUrl()) {
    const company = await getFallbackCompanyById(id);

    if (!company) {
      return null;
    }

    const [sourceOptions, stageOptions] = await Promise.all([
      listLookupOptions("lead_source"),
      listLookupOptions("company_stage")
    ]);
    const sourceMap = buildLookupMap(sourceOptions);
    const stageMap = buildLookupMap(stageOptions);

    return {
      ...company,
      lastInteractionDate: company.lastInteractionDate ?? null,
      openTasksCount: company.openTasksCount ?? 0,
      overdueTasksCount: company.overdueTasksCount ?? 0,
      inactivityLabel: deriveInactivityLabel(company.lastInteractionDate ?? null),
      sourceLabelEn: company.sourceValueId ? sourceMap.get(company.sourceValueId)?.labelEn ?? null : null,
      sourceLabelHe: company.sourceValueId ? sourceMap.get(company.sourceValueId)?.labelHe ?? null : null,
      stageLabelEn: company.stageValueId ? stageMap.get(company.stageValueId)?.labelEn ?? null : null,
      stageLabelHe: company.stageValueId ? stageMap.get(company.stageValueId)?.labelHe ?? null : null
    };
  }

  const prisma = await getPrisma();
  const company = await prisma.company.findUnique({
    where: {id},
    include: {
      contacts: {
        include: {
          emails: true,
          phones: true
        },
        orderBy: {
          fullName: "asc"
        }
      },
      interactions: {
        select: {
          interactionDate: true
        },
        orderBy: {
          interactionDate: "desc"
        },
        take: 1
      },
      tasks: {
        select: {
          dueDate: true,
          completedAt: true
        }
      }
    }
  });

  if (!company) {
    return null;
  }

  const [sourceOptions, stageOptions] = await Promise.all([
    listLookupOptions("lead_source"),
    listLookupOptions("company_stage")
  ]);
  const sourceMap = buildLookupMap(sourceOptions);
  const stageMap = buildLookupMap(stageOptions);

  return {
    ...company,
    lastInteractionDate: company.interactions[0]?.interactionDate ?? null,
    openTasksCount: company.tasks.filter((task) => !task.completedAt).length,
    overdueTasksCount: company.tasks.filter(
      (task) => !task.completedAt && new Date(task.dueDate).getTime() < Date.now()
    ).length,
    inactivityLabel: deriveInactivityLabel(company.interactions[0]?.interactionDate ?? null),
    contacts: company.contacts.map((contact) => ({
      id: contact.id,
      fullName: contact.fullName,
      roleTitle: contact.roleTitle,
      primaryEmail: contact.emails.find((email) => email.isPrimary)?.email ?? contact.emails[0]?.email ?? null,
      primaryPhone:
        contact.phones.find((phone) => phone.isPrimary)?.phoneNumber ?? contact.phones[0]?.phoneNumber ?? null
    })),
    sourceLabelEn: company.sourceValueId ? sourceMap.get(company.sourceValueId)?.labelEn ?? null : null,
    sourceLabelHe: company.sourceValueId ? sourceMap.get(company.sourceValueId)?.labelHe ?? null : null,
    stageLabelEn: company.stageValueId ? stageMap.get(company.stageValueId)?.labelEn ?? null : null,
    stageLabelHe: company.stageValueId ? stageMap.get(company.stageValueId)?.labelHe ?? null : null
  };
}

export async function createCompany(input: CompanyInput) {
  if (!hasDatabaseUrl()) {
    return createFallbackCompany(input);
  }

  const prisma = await getPrisma();

  return prisma.company.create({
    data: {
      companyName: input.companyName,
      website: input.website,
      sourceValueId: input.sourceValueId,
      stageValueId: input.stageValueId,
      notes: input.notes,
      createdById: input.actorUserId,
      updatedById: input.actorUserId
    }
  });
}

export async function updateCompany(id: string, input: CompanyInput) {
  if (!hasDatabaseUrl()) {
    return updateFallbackCompany({
      id,
      ...input
    });
  }

  const prisma = await getPrisma();

  return prisma.company.update({
    where: {id},
    data: {
      companyName: input.companyName,
      website: input.website,
      sourceValueId: input.sourceValueId,
      stageValueId: input.stageValueId,
      notes: input.notes,
      updatedById: input.actorUserId
    }
  });
}

export async function listContacts(filters?: {query?: string; companyId?: string}) {
  if (!hasDatabaseUrl()) {
    return listFallbackContacts(filters);
  }

  const prisma = await getPrisma();
  const contacts = await prisma.contact.findMany({
    where: {
      companyId: filters?.companyId || undefined,
      OR: filters?.query
        ? [
            {fullName: {contains: filters.query, mode: "insensitive"}},
            {roleTitle: {contains: filters.query, mode: "insensitive"}},
            {notes: {contains: filters.query, mode: "insensitive"}},
            {company: {companyName: {contains: filters.query, mode: "insensitive"}}},
            {emails: {some: {email: {contains: filters.query, mode: "insensitive"}}}},
            {phones: {some: {phoneNumber: {contains: filters.query, mode: "insensitive"}}}}
          ]
        : undefined
    },
    include: {
      company: {
        select: {
          companyName: true
        }
      },
      emails: true,
      phones: true
    },
    orderBy: {
      fullName: "asc"
    }
  });

  return contacts.map((contact) => ({
    ...contact,
    companyName: contact.company?.companyName ?? null,
    primaryEmail: contact.emails.find((email) => email.isPrimary)?.email ?? contact.emails[0]?.email ?? null,
    primaryPhone:
      contact.phones.find((phone) => phone.isPrimary)?.phoneNumber ?? contact.phones[0]?.phoneNumber ?? null
  }));
}

export async function getContactById(id: string) {
  if (!hasDatabaseUrl()) {
    const contact = await getFallbackContactById(id);

    if (!contact) {
      return null;
    }

    return {
      ...contact,
      lastInteractionDate: contact.lastInteractionDate ?? null,
      openTasksCount: contact.openTasksCount ?? 0,
      overdueTasksCount: contact.overdueTasksCount ?? 0,
      inactivityLabel: deriveInactivityLabel(contact.lastInteractionDate ?? null)
    };
  }

  const prisma = await getPrisma();
  const contact = await prisma.contact.findUnique({
    where: {id},
    include: {
      company: {
        select: {
          companyName: true
        }
      },
      emails: true,
      phones: true,
      interactions: {
        select: {
          interactionDate: true
        },
        orderBy: {
          interactionDate: "desc"
        },
        take: 1
      },
      tasks: {
        select: {
          dueDate: true,
          completedAt: true
        }
      }
    }
  });

  if (!contact) {
    return null;
  }

  return {
    ...contact,
    companyName: contact.company?.companyName ?? null,
    lastInteractionDate: contact.interactions[0]?.interactionDate ?? null,
    openTasksCount: contact.tasks.filter((task) => !task.completedAt).length,
    overdueTasksCount: contact.tasks.filter(
      (task) => !task.completedAt && new Date(task.dueDate).getTime() < Date.now()
    ).length,
    inactivityLabel: deriveInactivityLabel(contact.interactions[0]?.interactionDate ?? null)
  };
}

export async function validateCompanyContactMatch(companyId: string | null, contactId: string | null) {
  if (!companyId || !contactId) {
    return;
  }

  const contact = await getContactById(contactId);

  if (!contact || contact.companyId !== companyId) {
    throw new ValidationError("Selected company and contact do not match.", ["companyId", "contactId"]);
  }
}

export async function createContact(input: ContactInput) {
  if (!hasDatabaseUrl()) {
    return createFallbackContact(input);
  }

  const prisma = await getPrisma();

  return prisma.contact.create({
    data: {
      firstName: input.firstName,
      lastName: input.lastName,
      fullName: input.fullName,
      roleTitle: input.roleTitle,
      companyId: input.companyId,
      notes: input.notes,
      createdById: input.actorUserId,
      updatedById: input.actorUserId,
      emails: {
        create: input.emails.map((email) => ({
          email,
          isPrimary: email === input.primaryEmail
        }))
      },
      phones: {
        create: input.phones.map((phone) => ({
          phoneNumber: phone,
          isPrimary: phone === input.primaryPhone
        }))
      }
    }
  });
}

export async function updateContact(id: string, input: ContactInput) {
  if (!hasDatabaseUrl()) {
    return updateFallbackContact({
      id,
      ...input
    });
  }

  const prisma = await getPrisma();

  return prisma.contact.update({
    where: {id},
    data: {
      firstName: input.firstName,
      lastName: input.lastName,
      fullName: input.fullName,
      roleTitle: input.roleTitle,
      companyId: input.companyId,
      notes: input.notes,
      updatedById: input.actorUserId,
      emails: {
        deleteMany: {},
        create: input.emails.map((email) => ({
          email,
          isPrimary: email === input.primaryEmail
        }))
      },
      phones: {
        deleteMany: {},
        create: input.phones.map((phone) => ({
          phoneNumber: phone,
          isPrimary: phone === input.primaryPhone
        }))
      }
    }
  });
}

export async function searchCrm(query: string) {
  if (!hasDatabaseUrl()) {
    return searchFallbackCrm(query);
  }

  const prisma = await getPrisma();
  const term = query.trim();

  if (!term) {
    return {companies: [], contacts: []};
  }

  const [companies, contacts] = await Promise.all([
    listCompanies({query: term}),
    listContacts({query: term})
  ]);

  return {
    companies: companies.slice(0, 8),
    contacts: contacts.slice(0, 8)
  };
}

export async function createInteraction(input: InteractionInput) {
  if (!hasDatabaseUrl()) {
    return createFallbackInteraction(input);
  }

  const prisma = await getPrisma();

  return prisma.interaction.create({
    data: {
      interactionDate: new Date(input.interactionDate),
      companyId: input.companyId,
      contactId: input.contactId,
      interactionTypeValueId: input.interactionTypeValueId,
      subject: input.subject,
      summary: input.summary,
      outcomeStatusValueId: input.outcomeStatusValueId,
      createdById: input.actorUserId
    }
  });
}

export async function updateInteraction(id: string, input: InteractionInput) {
  if (!hasDatabaseUrl()) {
    return updateFallbackInteraction({
      id,
      ...input
    });
  }

  const prisma = await getPrisma();

  return prisma.interaction.update({
    where: {id},
    data: {
      interactionDate: new Date(input.interactionDate),
      companyId: input.companyId,
      contactId: input.contactId,
      interactionTypeValueId: input.interactionTypeValueId,
      subject: input.subject,
      summary: input.summary,
      outcomeStatusValueId: input.outcomeStatusValueId
    }
  });
}

export async function createTask(input: TaskInput) {
  const statusKey = await getTaskStatusKey(input.statusValueId);
  const completedAt = statusKey === "completed" ? new Date().toISOString() : null;

  if (!hasDatabaseUrl()) {
    return createFallbackTask({
      ...input,
      completedAt
    });
  }

  const prisma = await getPrisma();

  return prisma.task.create({
    data: {
      companyId: input.companyId,
      contactId: input.contactId,
      relatedInteractionId: input.relatedInteractionId,
      taskTypeValueId: input.taskTypeValueId,
      dueDate: new Date(input.dueDate),
      priorityValueId: input.priorityValueId,
      statusValueId: input.statusValueId,
      notes: input.notes,
      createdById: input.actorUserId,
      completedAt: completedAt ? new Date(completedAt) : null
    }
  });
}

export async function updateTask(id: string, input: TaskInput) {
  const statusKey = await getTaskStatusKey(input.statusValueId);
  const completedAt = statusKey === "completed" ? new Date().toISOString() : null;

  if (!hasDatabaseUrl()) {
    return updateFallbackTask({
      id,
      ...input,
      completedAt
    });
  }

  const prisma = await getPrisma();

  return prisma.task.update({
    where: {id},
    data: {
      companyId: input.companyId,
      contactId: input.contactId,
      relatedInteractionId: input.relatedInteractionId,
      taskTypeValueId: input.taskTypeValueId,
      dueDate: new Date(input.dueDate),
      priorityValueId: input.priorityValueId,
      statusValueId: input.statusValueId,
      notes: input.notes,
      completedAt: completedAt ? new Date(completedAt) : null
    }
  });
}

export async function listInteractions(filters?: {
  query?: string;
  companyId?: string;
  contactId?: string;
  interactionTypeValueId?: string;
}) {
  const [typeOptions, outcomeOptions] = await Promise.all([
    listLookupOptions("interaction_type"),
    listLookupOptions("interaction_outcome_status")
  ]);
  const typeMap = buildLookupMap(typeOptions);
  const outcomeMap = buildLookupMap(outcomeOptions);

  if (!hasDatabaseUrl()) {
    const items = await listFallbackInteractions(filters);

    return items.map((item) => ({
      ...item,
      interactionTypeLabelEn: typeMap.get(item.interactionTypeValueId)?.labelEn ?? null,
      interactionTypeLabelHe: typeMap.get(item.interactionTypeValueId)?.labelHe ?? null,
      outcomeLabelEn: item.outcomeStatusValueId ? outcomeMap.get(item.outcomeStatusValueId)?.labelEn ?? null : null,
      outcomeLabelHe: item.outcomeStatusValueId ? outcomeMap.get(item.outcomeStatusValueId)?.labelHe ?? null : null
    }));
  }

  const prisma = await getPrisma();
  const interactions = await prisma.interaction.findMany({
    where: {
      companyId: filters?.companyId || undefined,
      contactId: filters?.contactId || undefined,
      interactionTypeValueId: filters?.interactionTypeValueId || undefined,
      OR: filters?.query
        ? [
            {subject: {contains: filters.query, mode: "insensitive"}},
            {summary: {contains: filters.query, mode: "insensitive"}},
            {company: {companyName: {contains: filters.query, mode: "insensitive"}}},
            {contact: {fullName: {contains: filters.query, mode: "insensitive"}}}
          ]
        : undefined
    },
    include: {
      company: {
        select: {
          companyName: true
        }
      },
      contact: {
        select: {
          fullName: true
        }
      }
    },
    orderBy: {
      interactionDate: "desc"
    }
  });

  return interactions.map((interaction) => ({
    ...interaction,
    companyName: interaction.company?.companyName ?? null,
    contactName: interaction.contact?.fullName ?? null,
    interactionTypeLabelEn: typeMap.get(interaction.interactionTypeValueId)?.labelEn ?? null,
    interactionTypeLabelHe: typeMap.get(interaction.interactionTypeValueId)?.labelHe ?? null,
    outcomeLabelEn: interaction.outcomeStatusValueId
      ? outcomeMap.get(interaction.outcomeStatusValueId)?.labelEn ?? null
      : null,
    outcomeLabelHe: interaction.outcomeStatusValueId
      ? outcomeMap.get(interaction.outcomeStatusValueId)?.labelHe ?? null
      : null
  }));
}

export async function getInteractionById(id: string) {
  const [typeOptions, outcomeOptions, taskStatusOptions] = await Promise.all([
    listLookupOptions("interaction_type"),
    listLookupOptions("interaction_outcome_status"),
    listLookupOptions("task_status")
  ]);
  const typeMap = buildLookupMap(typeOptions);
  const outcomeMap = buildLookupMap(outcomeOptions);
  const taskStatusMap = buildLookupMap(taskStatusOptions);

  if (!hasDatabaseUrl()) {
    const interaction = await getFallbackInteractionById(id);

    if (!interaction) {
      return null;
    }

    return {
      ...interaction,
      interactionTypeLabelEn: typeMap.get(interaction.interactionTypeValueId)?.labelEn ?? null,
      interactionTypeLabelHe: typeMap.get(interaction.interactionTypeValueId)?.labelHe ?? null,
      outcomeLabelEn: interaction.outcomeStatusValueId
        ? outcomeMap.get(interaction.outcomeStatusValueId)?.labelEn ?? null
        : null,
      outcomeLabelHe: interaction.outcomeStatusValueId
        ? outcomeMap.get(interaction.outcomeStatusValueId)?.labelHe ?? null
        : null,
      relatedTasks: interaction.relatedTasks.map((task) => ({
        ...task,
        statusLabelEn: taskStatusMap.get(task.statusValueId)?.labelEn ?? null,
        statusLabelHe: taskStatusMap.get(task.statusValueId)?.labelHe ?? null
      }))
    };
  }

  const prisma = await getPrisma();
  const interaction = await prisma.interaction.findUnique({
    where: {id},
    include: {
      company: {
        select: {
          companyName: true
        }
      },
      contact: {
        select: {
          fullName: true
        }
      },
      tasks: {
        orderBy: {
          dueDate: "asc"
        }
      }
    }
  });

  if (!interaction) {
    return null;
  }

  return {
    ...interaction,
    companyName: interaction.company?.companyName ?? null,
    contactName: interaction.contact?.fullName ?? null,
    interactionTypeLabelEn: typeMap.get(interaction.interactionTypeValueId)?.labelEn ?? null,
    interactionTypeLabelHe: typeMap.get(interaction.interactionTypeValueId)?.labelHe ?? null,
    outcomeLabelEn: interaction.outcomeStatusValueId
      ? outcomeMap.get(interaction.outcomeStatusValueId)?.labelEn ?? null
      : null,
    outcomeLabelHe: interaction.outcomeStatusValueId
      ? outcomeMap.get(interaction.outcomeStatusValueId)?.labelHe ?? null
      : null,
    relatedTasks: interaction.tasks.map((task) => ({
      id: task.id,
      dueDate: task.dueDate,
      notes: task.notes,
      statusValueId: task.statusValueId,
      statusLabelEn: taskStatusMap.get(task.statusValueId)?.labelEn ?? null,
      statusLabelHe: taskStatusMap.get(task.statusValueId)?.labelHe ?? null
    }))
  };
}

export async function listTasks(filters?: {
  query?: string;
  companyId?: string;
  contactId?: string;
  statusValueId?: string;
}) {
  const [taskTypeOptions, priorityOptions, statusOptions] = await Promise.all([
    listLookupOptions("task_type"),
    listLookupOptions("task_priority"),
    listLookupOptions("task_status")
  ]);
  const taskTypeMap = buildLookupMap(taskTypeOptions);
  const priorityMap = buildLookupMap(priorityOptions);
  const statusMap = buildLookupMap(statusOptions);

  if (!hasDatabaseUrl()) {
    const items = await listFallbackTasks(filters);

    return items.map((task) => ({
      ...task,
      taskTypeLabelEn: taskTypeMap.get(task.taskTypeValueId)?.labelEn ?? null,
      taskTypeLabelHe: taskTypeMap.get(task.taskTypeValueId)?.labelHe ?? null,
      priorityLabelEn: priorityMap.get(task.priorityValueId)?.labelEn ?? null,
      priorityLabelHe: priorityMap.get(task.priorityValueId)?.labelHe ?? null,
      statusLabelEn: statusMap.get(task.statusValueId)?.labelEn ?? null,
      statusLabelHe: statusMap.get(task.statusValueId)?.labelHe ?? null
    }));
  }

  const prisma = await getPrisma();
  const tasks = await prisma.task.findMany({
    where: {
      companyId: filters?.companyId || undefined,
      contactId: filters?.contactId || undefined,
      statusValueId: filters?.statusValueId || undefined,
      OR: filters?.query
        ? [
            {notes: {contains: filters.query, mode: "insensitive"}},
            {company: {companyName: {contains: filters.query, mode: "insensitive"}}},
            {contact: {fullName: {contains: filters.query, mode: "insensitive"}}}
          ]
        : undefined
    },
    include: {
      company: {
        select: {
          companyName: true
        }
      },
      contact: {
        select: {
          fullName: true
        }
      }
    },
    orderBy: [{completedAt: "asc"}, {dueDate: "asc"}]
  });

  return tasks.map((task) => ({
    ...task,
    companyName: task.company?.companyName ?? null,
    contactName: task.contact?.fullName ?? null,
    taskTypeLabelEn: taskTypeMap.get(task.taskTypeValueId)?.labelEn ?? null,
    taskTypeLabelHe: taskTypeMap.get(task.taskTypeValueId)?.labelHe ?? null,
    priorityLabelEn: priorityMap.get(task.priorityValueId)?.labelEn ?? null,
    priorityLabelHe: priorityMap.get(task.priorityValueId)?.labelHe ?? null,
    statusLabelEn: statusMap.get(task.statusValueId)?.labelEn ?? null,
    statusLabelHe: statusMap.get(task.statusValueId)?.labelHe ?? null
  }));
}

export async function getTaskById(id: string) {
  const [taskTypeOptions, priorityOptions, statusOptions] = await Promise.all([
    listLookupOptions("task_type"),
    listLookupOptions("task_priority"),
    listLookupOptions("task_status")
  ]);
  const taskTypeMap = buildLookupMap(taskTypeOptions);
  const priorityMap = buildLookupMap(priorityOptions);
  const statusMap = buildLookupMap(statusOptions);

  if (!hasDatabaseUrl()) {
    const task = await getFallbackTaskById(id);

    if (!task) {
      return null;
    }

    return {
      ...task,
      taskTypeLabelEn: taskTypeMap.get(task.taskTypeValueId)?.labelEn ?? null,
      taskTypeLabelHe: taskTypeMap.get(task.taskTypeValueId)?.labelHe ?? null,
      priorityLabelEn: priorityMap.get(task.priorityValueId)?.labelEn ?? null,
      priorityLabelHe: priorityMap.get(task.priorityValueId)?.labelHe ?? null,
      statusLabelEn: statusMap.get(task.statusValueId)?.labelEn ?? null,
      statusLabelHe: statusMap.get(task.statusValueId)?.labelHe ?? null
    };
  }

  const prisma = await getPrisma();
  const task = await prisma.task.findUnique({
    where: {id},
    include: {
      company: {
        select: {
          companyName: true
        }
      },
      contact: {
        select: {
          fullName: true
        }
      },
      relatedInteraction: {
        select: {
          subject: true
        }
      }
    }
  });

  if (!task) {
    return null;
  }

  return {
    ...task,
    companyName: task.company?.companyName ?? null,
    contactName: task.contact?.fullName ?? null,
    interactionSubject: task.relatedInteraction?.subject ?? null,
    taskTypeLabelEn: taskTypeMap.get(task.taskTypeValueId)?.labelEn ?? null,
    taskTypeLabelHe: taskTypeMap.get(task.taskTypeValueId)?.labelHe ?? null,
    priorityLabelEn: priorityMap.get(task.priorityValueId)?.labelEn ?? null,
    priorityLabelHe: priorityMap.get(task.priorityValueId)?.labelHe ?? null,
    statusLabelEn: statusMap.get(task.statusValueId)?.labelEn ?? null,
    statusLabelHe: statusMap.get(task.statusValueId)?.labelHe ?? null
  };
}
