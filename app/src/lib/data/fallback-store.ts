import {randomUUID} from "node:crypto";

import {
  seededCategories,
  seededCompanies,
  seededContacts,
  seededUsers,
  type SeedListCategory,
  type SeedCompany,
  type SeedContact,
  type SeedContactEmail,
  type SeedContactPhone,
  type SeedListValue,
  type SeedUser
} from "./seed";

type MutableState = {
  categories: SeedListCategory[];
  companies: SeedCompany[];
  contacts: SeedContact[];
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

  if (!company) {
    return null;
  }

  return {
    ...company,
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

  if (!contact) {
    return null;
  }

  const company = getState().companies.find((item) => item.id === contact.companyId);

  return {
    ...contact,
    companyName: company?.companyName ?? null
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
