import type {Company, Contact, ContactEmail, ContactPhone, ListValue} from "@prisma/client";

import {
  createFallbackCompany,
  createFallbackContact,
  getFallbackCompanyById,
  getFallbackContactById,
  listFallbackCompanies,
  listFallbackCompanyOptions,
  listFallbackContacts,
  listFallbackLookupValues,
  searchFallbackCrm,
  updateFallbackCompany,
  updateFallbackContact
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
};

export type ContactDetail = Contact & {
  companyName: string | null;
  emails: ContactEmail[];
  phones: ContactPhone[];
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

function normalizeText(value: string) {
  return value.trim();
}

function cleanOptional(value: string | null | undefined) {
  const normalized = String(value ?? "").trim();
  return normalized ? normalized : null;
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
    throw new Error("Company name is required.");
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
    throw new Error("Contact name is required.");
  }

  const emails = parseLinesField(input.emailsText);
  const phones = parseLinesField(input.phonesText);

  if (emails.length === 0 && phones.length === 0) {
    throw new Error("At least one email or phone number is required.");
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

export async function listLookupOptions(categoryKey: string) {
  if (!hasDatabaseUrl()) {
    return listFallbackLookupValues(categoryKey);
  }

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

  return normalizeLookupOptions(values);
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
    return getFallbackContactById(id);
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
      phones: true
    }
  });

  if (!contact) {
    return null;
  }

  return {
    ...contact,
    companyName: contact.company?.companyName ?? null
  };
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
