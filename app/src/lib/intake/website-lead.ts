import type {BatchIntakeSource, InboundLeadPayload, StageableImportRow, WorkbookProfile} from "@/lib/import/types";
import {createImportBatch, stageInboundRecords} from "@/lib/import/repository";
import {extractWebsiteDomain, normalizeDisplayValue, normalizePhoneNumber, splitMultiValue} from "@/lib/import/normalize";

type WebsiteLeadSubmission = {
  companyName?: string | null;
  contactFullName?: string | null;
  contactFirstName?: string | null;
  contactLastName?: string | null;
  email?: string | null;
  emails?: string[] | null;
  phone?: string | null;
  phones?: string[] | null;
  website?: string | null;
  notes?: string | null;
  leadSourceRaw?: string | null;
  locale?: string | null;
  sourceRef?: string | null;
  _hp?: string | null;
};

export type ValidWebsiteLeadSubmission = {
  submission: Omit<WebsiteLeadSubmission, "_hp">;
  intakePayload: InboundLeadPayload;
  rawFields: Record<string, string>;
  locale: string | null;
  sourceRef: string | null;
  isHoneypotTripped: boolean;
};

type ValidationResult =
  | {ok: true; value: ValidWebsiteLeadSubmission}
  | {ok: false; error: string};

const allowedBodyKeys = new Set([
  "companyName",
  "contactFullName",
  "contactFirstName",
  "contactLastName",
  "email",
  "emails",
  "phone",
  "phones",
  "website",
  "notes",
  "leadSourceRaw",
  "locale",
  "sourceRef",
  "_hp"
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function asOptionalString(value: unknown) {
  if (value == null) {
    return null;
  }

  if (typeof value !== "string") {
    return null;
  }

  const normalized = normalizeDisplayValue(value);
  return normalized ? normalized : null;
}

function asOptionalStringArray(value: unknown) {
  if (value == null) {
    return null;
  }

  if (!Array.isArray(value)) {
    return null;
  }

  const result = value
    .filter((item) => typeof item === "string")
    .map((item) => normalizeDisplayValue(item))
    .filter(Boolean);

  return result.length ? result : [];
}

function isValidEmail(value: string) {
  // Minimal safety checks; we keep this permissive because normalization/duplicates are handled later.
  const normalized = value.trim().toLowerCase();
  if (!normalized || normalized.length > 254) {
    return false;
  }
  const at = normalized.indexOf("@");
  return at > 0 && at < normalized.length - 1 && !/\s/.test(normalized);
}

function normalizeEmails(input: {email: string | null; emails: string[] | null}) {
  const fromSingle = input.email ? splitMultiValue(input.email) : [];
  const fromArray = input.emails ?? [];
  const merged = [...fromSingle, ...fromArray]
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean)
    .filter(isValidEmail);

  return Array.from(new Set(merged)).slice(0, 5);
}

function normalizePhones(input: {phone: string | null; phones: string[] | null}) {
  const fromSingle = input.phone ? splitMultiValue(input.phone) : [];
  const fromArray = input.phones ?? [];
  const merged = [...fromSingle, ...fromArray]
    .map((value) => normalizePhoneNumber(value))
    .filter(Boolean)
    .filter((value) => value.length >= 7 && value.length <= 20);

  return Array.from(new Set(merged)).slice(0, 5);
}

function normalizeLocale(value: string | null) {
  if (!value) {
    return null;
  }

  const normalized = value.trim().toLowerCase();
  if (normalized === "en" || normalized === "he") {
    return normalized;
  }

  return null;
}

export function validateWebsiteLeadSubmission(body: unknown): ValidationResult {
  if (!isRecord(body)) {
    return {ok: false, error: "Invalid request body."};
  }

  const unknownKeys = Object.keys(body).filter((key) => !allowedBodyKeys.has(key));
  if (unknownKeys.length) {
    return {ok: false, error: "Request contains unsupported fields."};
  }

  const submission: WebsiteLeadSubmission = {
    companyName: asOptionalString(body.companyName),
    contactFullName: asOptionalString(body.contactFullName),
    contactFirstName: asOptionalString(body.contactFirstName),
    contactLastName: asOptionalString(body.contactLastName),
    email: asOptionalString(body.email),
    emails: asOptionalStringArray(body.emails),
    phone: asOptionalString(body.phone),
    phones: asOptionalStringArray(body.phones),
    website: asOptionalString(body.website),
    notes: asOptionalString(body.notes),
    leadSourceRaw: asOptionalString(body.leadSourceRaw),
    locale: asOptionalString(body.locale),
    sourceRef: asOptionalString(body.sourceRef),
    _hp: asOptionalString(body._hp)
  };

  const isHoneypotTripped = Boolean(submission._hp?.trim());
  const locale = normalizeLocale(submission.locale ?? null);

  const emails = normalizeEmails({email: submission.email ?? null, emails: submission.emails ?? null});
  const phones = normalizePhones({phone: submission.phone ?? null, phones: submission.phones ?? null});

  const websiteValue = submission.website ? submission.website.trim() : null;
  const websiteDomain = websiteValue ? extractWebsiteDomain(websiteValue) : null;
  if (websiteValue && !websiteDomain) {
    return {ok: false, error: "Invalid website URL."};
  }

  const notes = submission.notes ? submission.notes.trim() : null;
  if (notes && notes.length > 2000) {
    return {ok: false, error: "Notes are too long."};
  }

  const companyName = submission.companyName ? submission.companyName.trim() : null;
  const contactFullName = submission.contactFullName ? submission.contactFullName.trim() : null;
  const contactFirstName = submission.contactFirstName ? submission.contactFirstName.trim() : null;
  const contactLastName = submission.contactLastName ? submission.contactLastName.trim() : null;
  const leadSourceRaw = submission.leadSourceRaw ? submission.leadSourceRaw.trim() : null;

  const hasSignal = Boolean(
    companyName ||
      contactFullName ||
      contactFirstName ||
      contactLastName ||
      emails.length ||
      phones.length ||
      websiteValue ||
      notes ||
      leadSourceRaw
  );

  if (!hasSignal) {
    return {ok: false, error: "Submission is empty."};
  }

  const intakePayload: InboundLeadPayload = {
    companyName,
    contactFullName,
    contactFirstName,
    contactLastName,
    emails,
    phones,
    website: websiteValue ?? null,
    notes,
    leadSourceRaw
  };

  const rawFields: Record<string, string> = {
    company_name: companyName ?? "",
    full_name: contactFullName ?? "",
    first_name: contactFirstName ?? "",
    last_name: contactLastName ?? "",
    email: emails.join(", "),
    phone: phones.join(", "),
    website: websiteValue ?? "",
    notes: notes ?? "",
    lead_source: leadSourceRaw ?? ""
  };

  const {_hp: _ignoredHoneypot, ...submissionWithoutHoneypot} = submission;

  return {
    ok: true,
    value: {
      submission: submissionWithoutHoneypot,
      intakePayload,
      rawFields,
      locale,
      sourceRef: submission.sourceRef ?? null,
      isHoneypotTripped
    }
  };
}

function buildWebsiteBatchProfile(input: {headers: string[]; rowCount: number}): WorkbookProfile {
  return {
    sheetCount: 1,
    totalDataRows: input.rowCount,
    sheets: [
      {
        name: "Website Form",
        guessedEntityType: "company",
        headers: input.headers,
        rowCount: input.rowCount,
        columnCount: input.headers.length,
        mixedLanguageCells: 0,
        multiValueCells: 0
      }
    ],
    risks: []
  };
}

export async function stageWebsiteLeadSubmission(input: {
  uploadedById: string;
  intake: ValidWebsiteLeadSubmission;
  requestMeta: {
    origin: string | null;
    referer: string | null;
    ip: string | null;
    userAgent: string | null;
  };
}) {
  const now = new Date().toISOString();
  const headers = Object.keys(input.intake.rawFields);
  const row: StageableImportRow = {
    sheetName: "website_form",
    rowNumber: 2,
    headers,
    cells: headers.map((header) => input.intake.rawFields[header] ?? "")
  };

  const sourceRef =
    input.intake.sourceRef ??
    input.requestMeta.referer ??
    input.requestMeta.origin ??
    (input.requestMeta.ip ? `ip:${input.requestMeta.ip}` : null);

  const intakeSource: Partial<BatchIntakeSource> = {
    channel: "website_form",
    sourceLabel: "Website Form",
    sourceRef,
    receivedAt: now,
    submittedByType: "public",
    locale: input.intake.locale
  };

  const batch = await createImportBatch({
    uploadedById: input.uploadedById,
    sourceFilename: `Website Form ${now}`,
    profile: buildWebsiteBatchProfile({headers, rowCount: 1}),
    intakeSource
  });

  const staged = await stageInboundRecords({
    batchId: batch.id,
    records: [
      {
        row,
        intakePayload: input.intake.intakePayload
      }
    ]
  });

  return {
    batchId: batch.id,
    batchStatus: staged.status
  };
}
