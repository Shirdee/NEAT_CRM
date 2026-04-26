import {randomUUID} from "node:crypto";

import {
  seededCategories,
  seededCompanies,
  seededContacts,
  seededInteractions,
  seededOpportunities,
  seededTasks,
  seededUsers,
  type SeedListCategory,
  type SeedCompany,
  type SeedContact,
  type SeedContactEmail,
  type SeedContactPhone,
  type SeedInteraction,
  type SeedListValue,
  type SeedOpportunity,
  type SeedTask,
  type SeedUser
} from "./seed";

type MutableState = {
  categories: SeedListCategory[];
  companies: SeedCompany[];
  contacts: SeedContact[];
  interactions: SeedInteraction[];
  tasks: SeedTask[];
  opportunities: SeedOpportunity[];
  users: SeedUser[];
};

function cloneState(): MutableState {
  return {
    categories: seededCategories.map((category) => ({
      ...category,
      values: category.values.map((value) => ({...value}))
    })),
    companies: seededCompanies.map((company) => ({...company})),
    contacts: seededContacts.map((contact) => ({
      ...contact,
      emails: contact.emails.map((email) => ({...email})),
      phones: contact.phones.map((phone) => ({...phone}))
    })),
    interactions: seededInteractions.map((interaction) => ({...interaction})),
    tasks: seededTasks.map((task) => ({...task})),
    opportunities: seededOpportunities.map((opportunity) => ({...opportunity})),
    users: seededUsers.map((user) => ({...user}))
  };
}

const globalState = globalThis as typeof globalThis & {
  crmFallbackState?: MutableState;
};

function getState() {
  if (!globalState.crmFallbackState) {
    globalState.crmFallbackState = cloneState();
  }

  return globalState.crmFallbackState;
}

export function resetFallbackStore() {
  globalState.crmFallbackState = cloneState();
}

export async function listFallbackCategories() {
  return getState().categories.map((category) => ({
    ...category,
    values: category.values
      .slice()
      .sort((left, right) => left.sortOrder - right.sortOrder || left.labelEn.localeCompare(right.labelEn))
  }));
}

export async function getFallbackUserByEmail(email: string) {
  return (
    getState().users.find(
      (user) => user.email.toLowerCase() === email.trim().toLowerCase() && user.isActive
    ) ?? null
  );
}

export async function getFallbackUserByIdentifier(identifier: string) {
  const value = identifier.trim();
  const normalized = value.toLowerCase();

  return (
    getState().users.find((user) => {
      if (!user.isActive) {
        return false;
      }

      if (value.includes("@")) {
        return user.email.toLowerCase() === normalized;
      }

      return user.fullName.toLowerCase() === normalized;
    }) ?? null
  );
}

export async function getFallbackUserByClerkUserId(clerkUserId: string) {
  return getState().users.find((user) => user.clerkUserId === clerkUserId && user.isActive) ?? null;
}

export async function linkFallbackUserToClerkIdentity(input: {
  clerkUserId: string;
  email: string;
}) {
  const normalizedEmail = input.email.trim().toLowerCase();
  const user = getState().users.find(
    (item) => item.email.toLowerCase() === normalizedEmail && !item.clerkUserId
  );

  if (!user) {
    return null;
  }

  user.clerkUserId = input.clerkUserId;
  return user;
}

export async function listFallbackUsers() {
  return getState().users
    .slice()
    .sort((left, right) => left.fullName.localeCompare(right.fullName));
}

export async function createFallbackUser(input: {
  email: string;
  fullName: string;
  clerkUserId?: string | null;
  passwordHash: string | null;
  role: SeedUser["role"];
  languagePreference: SeedUser["languagePreference"];
}) {
  const normalizedEmail = input.email.trim().toLowerCase();
  const emailTaken = getState().users.some((user) => user.email.toLowerCase() === normalizedEmail);

  if (emailTaken) {
    throw new Error("User email already exists");
  }

  const user: SeedUser = {
    id: randomUUID(),
    clerkUserId: input.clerkUserId ?? null,
    email: normalizedEmail,
    fullName: input.fullName.trim(),
    passwordHash: input.passwordHash,
    role: input.role,
    languagePreference: input.languagePreference,
    isActive: true
  };

  getState().users.push(user);
  return user;
}

export async function toggleFallbackUserActive(id: string) {
  const user = getState().users.find((item) => item.id === id);

  if (!user) {
    throw new Error("User not found");
  }

  user.isActive = !user.isActive;
  return user;
}

export async function createFallbackCategory(input: {key: string; name: string}) {
  const now = new Date().toISOString();
  const category: SeedListCategory = {
    id: randomUUID(),
    key: input.key,
    name: input.name,
    createdAt: now,
    values: []
  };

  getState().categories.push(category);
  return category;
}

export async function createFallbackValue(input: {
  categoryId: string;
  key: string;
  labelEn: string;
  labelHe: string;
}) {
  const category = getState().categories.find((item) => item.id === input.categoryId);

  if (!category) {
    throw new Error("Category not found");
  }

  const now = new Date().toISOString();
  const value: SeedListValue = {
    id: randomUUID(),
    categoryId: input.categoryId,
    key: input.key,
    labelEn: input.labelEn,
    labelHe: input.labelHe,
    sortOrder: category.values.length + 1,
    isActive: true,
    createdAt: now,
    updatedAt: now
  };

  category.values.push(value);
  return value;
}

export async function updateFallbackValue(input: {
  id: string;
  labelEn: string;
  labelHe: string;
  key: string;
}) {
  for (const category of getState().categories) {
    const value = category.values.find((item) => item.id === input.id);

    if (value) {
      value.key = input.key;
      value.labelEn = input.labelEn;
      value.labelHe = input.labelHe;
      value.updatedAt = new Date().toISOString();
      return value;
    }
  }

  throw new Error("Value not found");
}

export async function toggleFallbackValue(id: string) {
  for (const category of getState().categories) {
    const value = category.values.find((item) => item.id === id);

    if (value) {
      value.isActive = !value.isActive;
      value.updatedAt = new Date().toISOString();
      return value;
    }
  }

  throw new Error("Value not found");
}

function normalizeText(value: string) {
  return value.trim().toLowerCase();
}

function dedupeStrings(values: string[]) {
  const seen = new Set<string>();

  return values.filter((value) => {
    const key = normalizeText(value);

    if (!key || seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

function archiveStateEntry<T extends {archivedAt?: string | null; archivedById?: string | null}>(
  entry: T,
  actorUserId: string
) {
  entry.archivedAt = new Date().toISOString();
  entry.archivedById = actorUserId;
}

export async function listFallbackLookupValues(categoryKey: string) {
  const category = getState().categories.find((item) => item.key === categoryKey);

  return (
    category?.values
      .filter((value) => value.isActive)
      .slice()
      .sort((left, right) => left.sortOrder - right.sortOrder || left.labelEn.localeCompare(right.labelEn)) ??
    []
  );
}

export async function listFallbackCompanyOptions() {
  return getState()
    .companies
    .filter((company) => !company.archivedAt)
    .slice()
    .sort((left, right) => left.companyName.localeCompare(right.companyName))
    .map((company) => ({
      id: company.id,
      companyName: company.companyName
    }));
}

export async function listFallbackCompanies(filters?: {
  query?: string;
  sourceValueId?: string;
  stageValueId?: string;
}) {
  const query = normalizeText(filters?.query ?? "");

  return getState()
    .companies
    .filter((company) => !company.archivedAt)
    .filter((company) => {
      if (filters?.sourceValueId && company.sourceValueId !== filters.sourceValueId) {
        return false;
      }

      if (filters?.stageValueId && company.stageValueId !== filters.stageValueId) {
        return false;
      }

      if (!query) {
        return true;
      }

      return [company.companyName, company.website ?? "", company.notes ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(query);
    })
    .sort((left, right) => left.companyName.localeCompare(right.companyName))
    .map((company) => ({
      ...company,
      contactsCount: getState().contacts.filter((contact) => contact.companyId === company.id).length
    }));
}

export async function getFallbackCompanyById(id: string) {
  const company = getState().companies.find((item) => item.id === id);

  if (!company || company.archivedAt) {
    return null;
  }

  const relatedInteractions = getState()
    .interactions.filter((interaction) => interaction.companyId === id)
    .sort((left, right) => new Date(right.interactionDate).getTime() - new Date(left.interactionDate).getTime());
  const relatedTasks = getState().tasks.filter((task) => task.companyId === id);

  return {
    ...company,
    lastInteractionDate: relatedInteractions[0]?.interactionDate ?? null,
    openTasksCount: relatedTasks.filter((task) => !task.completedAt).length,
    overdueTasksCount: relatedTasks.filter(
      (task) => !task.completedAt && new Date(task.dueDate).getTime() < Date.now()
    ).length,
    contacts: getState()
      .contacts.filter((contact) => contact.companyId === id)
      .map((contact) => ({
        id: contact.id,
        fullName: contact.fullName,
        roleTitle: contact.roleTitle,
        primaryEmail: contact.emails.find((email) => email.isPrimary)?.email ?? contact.emails[0]?.email ?? null,
        primaryPhone:
          contact.phones.find((phone) => phone.isPrimary)?.phoneNumber ?? contact.phones[0]?.phoneNumber ?? null
      }))
      .sort((left, right) => left.fullName.localeCompare(right.fullName))
  };
}

export async function createFallbackCompany(input: {
  companyName: string;
  website: string | null;
  sourceValueId: string | null;
  stageValueId: string | null;
  notes: string | null;
  actorUserId: string;
}) {
  const timestamp = new Date().toISOString();
  const company: SeedCompany = {
    id: randomUUID(),
    companyName: input.companyName,
    website: input.website,
    sourceValueId: input.sourceValueId,
    stageValueId: input.stageValueId,
    notes: input.notes,
    archivedAt: null,
    archivedById: null,
    createdAt: timestamp,
    updatedAt: timestamp,
    createdById: input.actorUserId,
    updatedById: input.actorUserId
  };

  getState().companies.push(company);
  return company;
}

export async function updateFallbackCompany(input: {
  id: string;
  companyName: string;
  website: string | null;
  sourceValueId: string | null;
  stageValueId: string | null;
  notes: string | null;
  actorUserId: string;
}) {
  const company = getState().companies.find((item) => item.id === input.id);

  if (!company) {
    throw new Error("Company not found");
  }

  company.companyName = input.companyName;
  company.website = input.website;
  company.sourceValueId = input.sourceValueId;
  company.stageValueId = input.stageValueId;
  company.notes = input.notes;
  company.updatedAt = new Date().toISOString();
  company.updatedById = input.actorUserId;

  return company;
}

export async function listFallbackContacts(filters?: {query?: string; companyId?: string}) {
  const query = normalizeText(filters?.query ?? "");

  return getState()
    .contacts
    .filter((contact) => !contact.archivedAt)
    .filter((contact) => {
      if (filters?.companyId && contact.companyId !== filters.companyId) {
        return false;
      }

      if (!query) {
        return true;
      }

      const companyName =
        getState().companies.find((company) => company.id === contact.companyId)?.companyName ?? "";

      return [
        contact.fullName,
        contact.roleTitle ?? "",
        contact.notes ?? "",
        companyName,
        contact.emails.map((email) => email.email).join(" "),
        contact.phones.map((phone) => phone.phoneNumber).join(" ")
      ]
        .join(" ")
        .toLowerCase()
        .includes(query);
    })
    .sort((left, right) => left.fullName.localeCompare(right.fullName))
    .map((contact) => ({
      ...contact,
      companyName:
        getState().companies.find((company) => company.id === contact.companyId)?.companyName ?? null,
      primaryEmail: contact.emails.find((email) => email.isPrimary)?.email ?? contact.emails[0]?.email ?? null,
      primaryPhone:
        contact.phones.find((phone) => phone.isPrimary)?.phoneNumber ?? contact.phones[0]?.phoneNumber ?? null
    }));
}

export async function getFallbackContactById(id: string) {
  const contact = getState().contacts.find((item) => item.id === id);

  if (!contact || contact.archivedAt) {
    return null;
  }

  const company = getState().companies.find((item) => item.id === contact.companyId);
  const relatedInteractions = getState()
    .interactions.filter((interaction) => interaction.contactId === id)
    .sort((left, right) => new Date(right.interactionDate).getTime() - new Date(left.interactionDate).getTime());
  const relatedTasks = getState().tasks.filter((task) => task.contactId === id);

  return {
    ...contact,
    companyName: company?.companyName ?? null,
    lastInteractionDate: relatedInteractions[0]?.interactionDate ?? null,
    openTasksCount: relatedTasks.filter((task) => !task.completedAt).length,
    overdueTasksCount: relatedTasks.filter(
      (task) => !task.completedAt && new Date(task.dueDate).getTime() < Date.now()
    ).length
  };
}

function toFallbackEmails(contactId: string, values: string[], primaryValue: string | null): SeedContactEmail[] {
  const deduped = dedupeStrings(values);
  const primaryKey = primaryValue ? normalizeText(primaryValue) : "";

  return deduped.map((email, index) => ({
    id: randomUUID(),
    contactId,
    email,
    isPrimary: primaryKey ? normalizeText(email) === primaryKey : index === 0,
    createdAt: new Date().toISOString()
  }));
}

function toFallbackPhones(contactId: string, values: string[], primaryValue: string | null): SeedContactPhone[] {
  const deduped = dedupeStrings(values);
  const primaryKey = primaryValue ? normalizeText(primaryValue) : "";

  return deduped.map((phone, index) => ({
    id: randomUUID(),
    contactId,
    phoneNumber: phone,
    isPrimary: primaryKey ? normalizeText(phone) === primaryKey : index === 0,
    createdAt: new Date().toISOString()
  }));
}

export async function createFallbackContact(input: {
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
}) {
  const timestamp = new Date().toISOString();
  const contactId = randomUUID();
  const contact: SeedContact = {
    id: contactId,
    firstName: input.firstName,
    lastName: input.lastName,
    fullName: input.fullName,
    roleTitle: input.roleTitle,
    companyId: input.companyId,
    notes: input.notes,
    archivedAt: null,
    archivedById: null,
    createdAt: timestamp,
    updatedAt: timestamp,
    createdById: input.actorUserId,
    updatedById: input.actorUserId,
    emails: toFallbackEmails(contactId, input.emails, input.primaryEmail),
    phones: toFallbackPhones(contactId, input.phones, input.primaryPhone)
  };

  getState().contacts.push(contact);
  return contact;
}

export async function updateFallbackContact(input: {
  id: string;
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
}) {
  const contact = getState().contacts.find((item) => item.id === input.id);

  if (!contact) {
    throw new Error("Contact not found");
  }

  contact.firstName = input.firstName;
  contact.lastName = input.lastName;
  contact.fullName = input.fullName;
  contact.roleTitle = input.roleTitle;
  contact.companyId = input.companyId;
  contact.notes = input.notes;
  contact.updatedAt = new Date().toISOString();
  contact.updatedById = input.actorUserId;
  contact.emails = toFallbackEmails(contact.id, input.emails, input.primaryEmail);
  contact.phones = toFallbackPhones(contact.id, input.phones, input.primaryPhone);

  return contact;
}

export async function searchFallbackCrm(query: string) {
  const needle = normalizeText(query);

  if (!needle) {
    return {companies: [], contacts: []};
  }

  const companies = (await listFallbackCompanies({query: needle})).slice(0, 6);
  const contacts = (await listFallbackContacts({query: needle})).slice(0, 6);

  return {companies, contacts};
}

export async function listFallbackInteractions(filters?: {
  query?: string;
  companyId?: string;
  contactId?: string;
  interactionTypeValueId?: string;
}) {
  const needle = normalizeText(filters?.query ?? "");

  return getState()
    .interactions
    .filter((interaction) => !interaction.archivedAt)
    .filter((interaction) => {
      if (filters?.companyId && interaction.companyId !== filters.companyId) {
        return false;
      }

      if (filters?.contactId && interaction.contactId !== filters.contactId) {
        return false;
      }

      if (
        filters?.interactionTypeValueId &&
        interaction.interactionTypeValueId !== filters.interactionTypeValueId
      ) {
        return false;
      }

      if (!needle) {
        return true;
      }

      const companyName =
        getState().companies.find((company) => company.id === interaction.companyId)?.companyName ?? "";
      const contactName =
        getState().contacts.find((contact) => contact.id === interaction.contactId)?.fullName ?? "";

      return [interaction.subject, interaction.summary, companyName, contactName]
        .join(" ")
        .toLowerCase()
        .includes(needle);
    })
    .sort(
      (left, right) =>
        new Date(right.interactionDate).getTime() - new Date(left.interactionDate).getTime()
    )
    .map((interaction) => ({
      ...interaction,
      companyName:
        getState().companies.find((company) => company.id === interaction.companyId)?.companyName ?? null,
      contactName:
        getState().contacts.find((contact) => contact.id === interaction.contactId)?.fullName ?? null
    }));
}

export async function getFallbackInteractionById(id: string) {
  const interaction = getState().interactions.find((item) => item.id === id);

  if (!interaction || interaction.archivedAt) {
    return null;
  }

  return {
    ...interaction,
    companyName:
      getState().companies.find((company) => company.id === interaction.companyId)?.companyName ?? null,
    contactName:
      getState().contacts.find((contact) => contact.id === interaction.contactId)?.fullName ?? null,
    relatedTasks: getState()
      .tasks.filter((task) => task.relatedInteractionId === interaction.id)
      .sort((left, right) => new Date(left.dueDate).getTime() - new Date(right.dueDate).getTime())
      .map((task) => ({
        id: task.id,
        dueDate: task.dueDate,
        notes: task.notes,
        statusValueId: task.statusValueId
      }))
  };
}

export async function listFallbackTasks(filters?: {
  query?: string;
  companyId?: string;
  contactId?: string;
  statusValueId?: string;
}) {
  const needle = normalizeText(filters?.query ?? "");

  return getState()
    .tasks
    .filter((task) => !task.archivedAt)
    .filter((task) => {
      if (filters?.companyId && task.companyId !== filters.companyId) {
        return false;
      }

      if (filters?.contactId && task.contactId !== filters.contactId) {
        return false;
      }

      if (filters?.statusValueId && task.statusValueId !== filters.statusValueId) {
        return false;
      }

      if (!needle) {
        return true;
      }

      const companyName = getState().companies.find((company) => company.id === task.companyId)?.companyName ?? "";
      const contactName = getState().contacts.find((contact) => contact.id === task.contactId)?.fullName ?? "";

      return [task.notes ?? "", task.followUpEmail ?? "", companyName, contactName]
        .join(" ")
        .toLowerCase()
        .includes(needle);
    })
    .sort((left, right) => new Date(left.dueDate).getTime() - new Date(right.dueDate).getTime())
    .map((task) => ({
      ...task,
      companyName: getState().companies.find((company) => company.id === task.companyId)?.companyName ?? null,
      contactName: getState().contacts.find((contact) => contact.id === task.contactId)?.fullName ?? null
    }));
}

export async function getFallbackTaskById(id: string) {
  const task = getState().tasks.find((item) => item.id === id);

  if (!task || task.archivedAt) {
    return null;
  }

  return {
    ...task,
    companyName: getState().companies.find((company) => company.id === task.companyId)?.companyName ?? null,
    contactName: getState().contacts.find((contact) => contact.id === task.contactId)?.fullName ?? null,
    interactionSubject:
      getState().interactions.find((interaction) => interaction.id === task.relatedInteractionId)?.subject ?? null
  };
}

export async function createFallbackInteraction(input: {
  interactionDate: string;
  companyId: string | null;
  contactId: string | null;
  interactionTypeValueId: string;
  subject: string;
  summary: string;
  outcomeStatusValueId: string | null;
  actorUserId: string;
}) {
  const timestamp = new Date().toISOString();
  const interaction: SeedInteraction = {
    id: randomUUID(),
    interactionDate: new Date(input.interactionDate).toISOString(),
    companyId: input.companyId,
    contactId: input.contactId,
    interactionTypeValueId: input.interactionTypeValueId,
    subject: input.subject,
    summary: input.summary,
    outcomeStatusValueId: input.outcomeStatusValueId,
    closeReasonValueId: null,
    archivedAt: null,
    archivedById: null,
    createdById: input.actorUserId,
    createdAt: timestamp,
    updatedAt: timestamp
  };

  getState().interactions.push(interaction);
  return interaction;
}

export async function updateFallbackInteraction(input: {
  id: string;
  interactionDate: string;
  companyId: string | null;
  contactId: string | null;
  interactionTypeValueId: string;
  subject: string;
  summary: string;
  outcomeStatusValueId: string | null;
}) {
  const interaction = getState().interactions.find((item) => item.id === input.id);

  if (!interaction) {
    throw new Error("Interaction not found");
  }

  interaction.interactionDate = new Date(input.interactionDate).toISOString();
  interaction.companyId = input.companyId;
  interaction.contactId = input.contactId;
  interaction.interactionTypeValueId = input.interactionTypeValueId;
  interaction.subject = input.subject;
  interaction.summary = input.summary;
  interaction.outcomeStatusValueId = input.outcomeStatusValueId;
  interaction.updatedAt = new Date().toISOString();

  return interaction;
}

export async function createFallbackTask(input: {
  companyId: string | null;
  contactId: string | null;
  relatedInteractionId: string | null;
  taskTypeValueId: string;
  dueDate: string;
  priorityValueId: string;
  statusValueId: string;
  notes: string | null;
  followUpEmail?: string | null;
  actorUserId: string;
  completedAt: string | null;
}) {
  const timestamp = new Date().toISOString();
  const task: SeedTask = {
    id: randomUUID(),
    companyId: input.companyId,
    contactId: input.contactId,
    relatedInteractionId: input.relatedInteractionId,
    taskTypeValueId: input.taskTypeValueId,
    dueDate: new Date(input.dueDate).toISOString(),
    priorityValueId: input.priorityValueId,
    statusValueId: input.statusValueId,
    closeReasonValueId: null,
    notes: input.notes,
    followUpEmail: input.followUpEmail ?? null,
    archivedAt: null,
    archivedById: null,
    createdById: input.actorUserId,
    createdAt: timestamp,
    updatedAt: timestamp,
    completedAt: input.completedAt
  };

  getState().tasks.push(task);
  return task;
}

export async function updateFallbackTask(input: {
  id: string;
  companyId: string | null;
  contactId: string | null;
  relatedInteractionId: string | null;
  taskTypeValueId: string;
  dueDate: string;
  priorityValueId: string;
  statusValueId: string;
  notes: string | null;
  followUpEmail?: string | null;
  completedAt: string | null;
}) {
  const task = getState().tasks.find((item) => item.id === input.id);

  if (!task) {
    throw new Error("Task not found");
  }

  task.companyId = input.companyId;
  task.contactId = input.contactId;
  task.relatedInteractionId = input.relatedInteractionId;
  task.taskTypeValueId = input.taskTypeValueId;
  task.dueDate = new Date(input.dueDate).toISOString();
  task.priorityValueId = input.priorityValueId;
  task.statusValueId = input.statusValueId;
  task.notes = input.notes;
  task.followUpEmail = input.followUpEmail ?? null;
  task.completedAt = input.completedAt;
  task.updatedAt = new Date().toISOString();

  return task;
}

export async function listFallbackOpportunities(filters?: {
  query?: string;
  companyId?: string;
  contactId?: string;
  opportunityStageValueId?: string;
  opportunityTypeValueId?: string;
  statusValueId?: string;
}) {
  const needle = normalizeText(filters?.query ?? "");

  return getState()
    .opportunities
    .filter((opportunity) => !opportunity.archivedAt)
    .filter((opportunity) => {
      if (filters?.companyId && opportunity.companyId !== filters.companyId) {
        return false;
      }

      if (filters?.contactId && opportunity.contactId !== filters.contactId) {
        return false;
      }

      if (
        filters?.opportunityStageValueId &&
        opportunity.opportunityStageValueId !== filters.opportunityStageValueId
      ) {
        return false;
      }

      if (
        filters?.opportunityTypeValueId &&
        opportunity.opportunityTypeValueId !== filters.opportunityTypeValueId
      ) {
        return false;
      }

      if (filters?.statusValueId && opportunity.statusValueId !== filters.statusValueId) {
        return false;
      }

      if (!needle) {
        return true;
      }

      const companyName =
        getState().companies.find((company) => company.id === opportunity.companyId)?.companyName ?? "";
      const contactName =
        getState().contacts.find((contact) => contact.id === opportunity.contactId)?.fullName ?? "";

      return [opportunity.opportunityName, opportunity.notes ?? "", companyName, contactName]
        .join(" ")
        .toLowerCase()
        .includes(needle);
    })
    .sort((left, right) => left.opportunityName.localeCompare(right.opportunityName))
    .map((opportunity) => ({
      ...opportunity,
      companyName:
        getState().companies.find((company) => company.id === opportunity.companyId)?.companyName ?? null,
      contactName:
        getState().contacts.find((contact) => contact.id === opportunity.contactId)?.fullName ?? null
    }));
}

export async function getFallbackOpportunityById(id: string) {
  const opportunity = getState().opportunities.find((item) => item.id === id);

  if (!opportunity || opportunity.archivedAt) {
    return null;
  }

  return {
    ...opportunity,
    companyName:
      getState().companies.find((company) => company.id === opportunity.companyId)?.companyName ?? null,
    contactName:
      getState().contacts.find((contact) => contact.id === opportunity.contactId)?.fullName ?? null
  };
}

export async function createFallbackOpportunity(input: {
  companyId: string;
  contactId: string | null;
  opportunityName: string;
  opportunityStageValueId: string;
  opportunityTypeValueId: string;
  estimatedValue: string | null;
  statusValueId: string;
  targetCloseDate: string | null;
  notes: string | null;
  actorUserId: string;
}) {
  const timestamp = new Date().toISOString();
  const opportunity: SeedOpportunity = {
    id: randomUUID(),
    companyId: input.companyId,
    contactId: input.contactId,
    opportunityName: input.opportunityName,
    opportunityStageValueId: input.opportunityStageValueId,
    opportunityTypeValueId: input.opportunityTypeValueId,
    estimatedValue: input.estimatedValue,
    statusValueId: input.statusValueId,
    targetCloseDate: input.targetCloseDate ? new Date(input.targetCloseDate).toISOString() : null,
    notes: input.notes,
    archivedAt: null,
    archivedById: null,
    createdById: input.actorUserId,
    updatedById: input.actorUserId,
    createdAt: timestamp,
    updatedAt: timestamp
  };

  getState().opportunities.push(opportunity);
  return opportunity;
}

export async function updateFallbackOpportunity(input: {
  id: string;
  companyId: string;
  contactId: string | null;
  opportunityName: string;
  opportunityStageValueId: string;
  opportunityTypeValueId: string;
  estimatedValue: string | null;
  statusValueId: string;
  targetCloseDate: string | null;
  notes: string | null;
  actorUserId: string;
}) {
  const opportunity = getState().opportunities.find((item) => item.id === input.id);

  if (!opportunity) {
    throw new Error("Opportunity not found");
  }

  opportunity.companyId = input.companyId;
  opportunity.contactId = input.contactId;
  opportunity.opportunityName = input.opportunityName;
  opportunity.opportunityStageValueId = input.opportunityStageValueId;
  opportunity.opportunityTypeValueId = input.opportunityTypeValueId;
  opportunity.estimatedValue = input.estimatedValue;
  opportunity.statusValueId = input.statusValueId;
  opportunity.targetCloseDate = input.targetCloseDate ? new Date(input.targetCloseDate).toISOString() : null;
  opportunity.notes = input.notes;
  opportunity.updatedById = input.actorUserId;
  opportunity.updatedAt = new Date().toISOString();

  return opportunity;
}

export async function deleteFallbackCompany(id: string, actorUserId: string) {
  const state = getState();
  const company = state.companies.find((item) => item.id === id);

  if (!company) {
    return {deleted: false, blockedBy: [] as string[]};
  }

  archiveStateEntry(company, actorUserId);
  state.contacts.filter((contact) => contact.companyId === id && !contact.archivedAt).forEach((contact) => {
    archiveStateEntry(contact, actorUserId);
  });
  state.interactions
    .filter((interaction) => interaction.companyId === id && !interaction.archivedAt)
    .forEach((interaction) => {
      archiveStateEntry(interaction, actorUserId);
    });
  state.tasks.filter((task) => task.companyId === id && !task.archivedAt).forEach((task) => {
    archiveStateEntry(task, actorUserId);
  });
  state.opportunities
    .filter((opportunity) => opportunity.companyId === id && !opportunity.archivedAt)
    .forEach((opportunity) => {
      archiveStateEntry(opportunity, actorUserId);
    });
  return {deleted: true, blockedBy: [] as string[]};
}

export async function deleteFallbackContact(id: string, actorUserId: string) {
  const state = getState();
  const contact = state.contacts.find((item) => item.id === id);

  if (!contact) {
    return {deleted: false, blockedBy: [] as string[]};
  }

  archiveStateEntry(contact, actorUserId);
  state.interactions
    .filter((interaction) => interaction.contactId === id && !interaction.archivedAt)
    .forEach((interaction) => {
      archiveStateEntry(interaction, actorUserId);
    });
  state.tasks.filter((task) => task.contactId === id && !task.archivedAt).forEach((task) => {
    archiveStateEntry(task, actorUserId);
  });
  return {deleted: true, blockedBy: [] as string[]};
}

export async function deleteFallbackInteraction(id: string, actorUserId: string) {
  const state = getState();
  const interaction = state.interactions.find((item) => item.id === id);

  if (!interaction) {
    return {deleted: false, blockedBy: [] as string[]};
  }

  archiveStateEntry(interaction, actorUserId);
  state.tasks
    .filter((task) => task.relatedInteractionId === id && !task.archivedAt)
    .forEach((task) => {
      archiveStateEntry(task, actorUserId);
    });
  return {deleted: true, blockedBy: [] as string[]};
}

export async function closeFallbackInteractionWithReason(
  id: string,
  closeReasonValueId: string,
  actorUserId: string
) {
  const interaction = getState().interactions.find((item) => item.id === id);

  if (!interaction || interaction.archivedAt) {
    return false;
  }

  interaction.closeReasonValueId = closeReasonValueId;
  interaction.updatedAt = new Date().toISOString();
  interaction.archivedById = interaction.archivedById ?? actorUserId;
  return true;
}

export async function deleteFallbackTask(id: string, actorUserId: string) {
  const state = getState();
  const task = state.tasks.find((item) => item.id === id);

  if (!task) {
    return {deleted: false, blockedBy: [] as string[]};
  }

  archiveStateEntry(task, actorUserId);
  return {deleted: true, blockedBy: [] as string[]};
}

export async function closeFallbackTaskWithReason(
  id: string,
  closeReasonValueId: string,
  completedStatusValueId: string,
  options?: {
    actorUserId?: string;
    interactionTypeValueId?: string;
    meetingDate?: string | null;
  }
) {
  const state = getState();
  const task = state.tasks.find((item) => item.id === id);

  if (!task || task.archivedAt) {
    return false;
  }

  if (options?.interactionTypeValueId && options.meetingDate) {
    const timestamp = new Date().toISOString();
    const interaction: SeedInteraction = {
      id: randomUUID(),
      interactionDate: new Date(options.meetingDate).toISOString(),
      companyId: task.companyId,
      contactId: task.contactId,
      interactionTypeValueId: options.interactionTypeValueId,
      subject: task.notes ? `Meeting: ${task.notes}` : "Meeting booked",
      summary: [
        "Created while closing follow-up task.",
        task.followUpEmail ? `Email context: ${task.followUpEmail}` : null
      ]
        .filter(Boolean)
        .join("\n"),
      outcomeStatusValueId: null,
      closeReasonValueId: null,
      archivedAt: null,
      archivedById: null,
      createdById: options.actorUserId ?? task.createdById,
      createdAt: timestamp,
      updatedAt: timestamp
    };

    state.interactions.push(interaction);
    task.relatedInteractionId = interaction.id;
  }

  task.closeReasonValueId = closeReasonValueId;
  task.statusValueId = completedStatusValueId;
  task.completedAt = new Date().toISOString();
  task.updatedAt = new Date().toISOString();
  return true;
}

export async function deleteFallbackOpportunity(id: string) {
  const state = getState();
  const opportunity = state.opportunities.find((item) => item.id === id);

  if (!opportunity || opportunity.archivedAt) {
    return {deleted: false, blockedBy: [] as string[]};
  }

  archiveStateEntry(opportunity, "system");
  return {deleted: true, blockedBy: [] as string[]};
}

function combineFallbackNotes(primary: string | null | undefined, duplicate: string | null | undefined) {
  const primaryText = primary?.trim() ?? "";
  const duplicateText = duplicate?.trim() ?? "";

  if (!primaryText) {
    return duplicateText || null;
  }

  if (!duplicateText || primaryText === duplicateText) {
    return primaryText;
  }

  return `${primaryText}\n\nMerged from duplicate:\n${duplicateText}`;
}

export async function mergeFallbackCompanies(primaryId: string, duplicateId: string, actorUserId: string) {
  const state = getState();
  const primary = state.companies.find((item) => item.id === primaryId);
  const duplicate = state.companies.find((item) => item.id === duplicateId);

  if (!primary || !duplicate) {
    throw new Error("Company not found");
  }

  primary.companyName = primary.companyName || duplicate.companyName;
  primary.website = primary.website || duplicate.website;
  primary.sourceValueId = primary.sourceValueId || duplicate.sourceValueId;
  primary.stageValueId = primary.stageValueId || duplicate.stageValueId;
  primary.notes = combineFallbackNotes(primary.notes, duplicate.notes);
  primary.updatedAt = new Date().toISOString();
  primary.updatedById = actorUserId;

  state.contacts.forEach((contact) => {
    if (contact.companyId === duplicateId) {
      contact.companyId = primaryId;
      contact.updatedAt = new Date().toISOString();
      contact.updatedById = actorUserId;
    }
  });

  state.interactions.forEach((interaction) => {
    if (interaction.companyId === duplicateId) {
      interaction.companyId = primaryId;
      interaction.updatedAt = new Date().toISOString();
    }
  });

  state.tasks.forEach((task) => {
    if (task.companyId === duplicateId) {
      task.companyId = primaryId;
      task.updatedAt = new Date().toISOString();
    }
  });

  state.opportunities.forEach((opportunity) => {
    if (opportunity.companyId === duplicateId) {
      opportunity.companyId = primaryId;
      opportunity.updatedAt = new Date().toISOString();
      opportunity.updatedById = actorUserId;
    }
  });

  state.companies = state.companies.filter((company) => company.id !== duplicateId);

  return primary;
}

export async function mergeFallbackContacts(primaryId: string, duplicateId: string, actorUserId: string) {
  const state = getState();
  const primary = state.contacts.find((item) => item.id === primaryId);
  const duplicate = state.contacts.find((item) => item.id === duplicateId);

  if (!primary || !duplicate) {
    throw new Error("Contact not found");
  }

  primary.firstName = primary.firstName || duplicate.firstName;
  primary.lastName = primary.lastName || duplicate.lastName;
  primary.fullName = primary.fullName || duplicate.fullName;
  primary.roleTitle = primary.roleTitle || duplicate.roleTitle;
  primary.companyId = primary.companyId || duplicate.companyId;
  primary.notes = combineFallbackNotes(primary.notes, duplicate.notes);
  primary.updatedAt = new Date().toISOString();
  primary.updatedById = actorUserId;

  const emailValues = dedupeStrings([
    ...primary.emails.map((email) => email.email),
    ...duplicate.emails.map((email) => email.email)
  ]);
  const emailPrimary =
    primary.emails.find((email) => email.isPrimary)?.email ??
    duplicate.emails.find((email) => email.isPrimary)?.email ??
    emailValues[0] ??
    null;
  primary.emails = toFallbackEmails(primary.id, emailValues, emailPrimary);

  const phoneValues = dedupeStrings([
    ...primary.phones.map((phone) => phone.phoneNumber),
    ...duplicate.phones.map((phone) => phone.phoneNumber)
  ]);
  const phonePrimary =
    primary.phones.find((phone) => phone.isPrimary)?.phoneNumber ??
    duplicate.phones.find((phone) => phone.isPrimary)?.phoneNumber ??
    phoneValues[0] ??
    null;
  primary.phones = toFallbackPhones(primary.id, phoneValues, phonePrimary);

  state.interactions.forEach((interaction) => {
    if (interaction.contactId === duplicateId) {
      interaction.contactId = primaryId;
      interaction.updatedAt = new Date().toISOString();
    }
  });

  state.tasks.forEach((task) => {
    if (task.contactId === duplicateId) {
      task.contactId = primaryId;
      task.updatedAt = new Date().toISOString();
    }
  });

  state.opportunities.forEach((opportunity) => {
    if (opportunity.contactId === duplicateId) {
      opportunity.contactId = primaryId;
      opportunity.updatedAt = new Date().toISOString();
      opportunity.updatedById = actorUserId;
    }
  });

  state.contacts = state.contacts.filter((contact) => contact.id !== duplicateId);

  return primary;
}
