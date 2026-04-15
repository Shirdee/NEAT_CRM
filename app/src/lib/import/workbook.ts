import {
  detectCellLanguage,
  extractWebsiteDomain,
  normalizeCompanyName,
  normalizeDateInput,
  normalizeDisplayValue,
  normalizeLookupValue,
  normalizePersonName,
  normalizePhoneNumber,
  splitMultiValue
} from "./normalize";
import type {
  DuplicateDecision,
  InboundLeadPayload,
  ImportEntityType,
  ImportIssueRecord,
  ImportRowReviewDecision,
  LookupCandidate,
  NormalizedImportRow,
  StagedIntakeEnvelope,
  StageableImportRow,
  WorkbookProfile,
  WorkbookSheetPayload
} from "./types";

type LookupDirectory = Record<string, Map<string, string>>;

type ExistingDirectory = {
  companyNames: Set<string>;
  websiteDomains: Set<string>;
  contactFingerprints: Set<string>;
  emails: Set<string>;
  phones: Set<string>;
};

type ReviewDecisionDirectory = Record<string, ImportRowReviewDecision | undefined>;

type RowIssue = Omit<ImportIssueRecord, "sheetName" | "rowNumber" | "entityType">;

const entityHints: Array<{entityType: ImportEntityType; hints: string[]}> = [
  {entityType: "company", hints: ["company", "account", "organization", "firm"]},
  {entityType: "contact", hints: ["contact", "person", "people", "lead"]},
  {entityType: "interaction", hints: ["interaction", "activity", "outreach", "meeting", "call"]},
  {entityType: "task", hints: ["task", "action", "follow", "todo"]},
  {entityType: "opportunity", hints: ["opportunity", "deal", "pipeline"]}
];

const ignoredImportHeaders = new Set([
  "row number",
  "row_number",
  "row no",
  "row_no",
  "row num",
  "row_num",
  "line number",
  "line_number",
  "line no",
  "line_no",
  "serial",
  "serial number",
  "serial_number",
  "מספר שורה",
  "שורה"
]);

function normalizeHeader(value: string) {
  const normalizedValue = normalizeLookupValue(value);

  if (ignoredImportHeaders.has(normalizedValue)) {
    return "";
  }

  return normalizedValue.replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}

function hasAny(keys: string[], candidates: string[]) {
  return candidates.some((candidate) => keys.includes(candidate));
}

function getFirstValue(record: Record<string, string>, candidates: string[]) {
  for (const candidate of candidates) {
    const value = record[candidate];

    if (value) {
      return value;
    }
  }

  return "";
}

function deriveContactNameParts(firstName: string, lastName: string, fullNameValue: string) {
  if (firstName && lastName) {
    return {
      firstName,
      lastName,
      fullName: `${firstName} ${lastName}`.trim()
    };
  }

  const nameParts = fullNameValue
    .trim()
    .split(/\s+/)
    .map((part) => part.trim())
    .filter(Boolean);

  if (nameParts.length >= 2) {
    const derivedFirstName = firstName || nameParts[0] || "";
    const derivedLastName = lastName || nameParts.slice(1).join(" ");

    return {
      firstName: derivedFirstName,
      lastName: derivedLastName,
      fullName: `${derivedFirstName} ${derivedLastName}`.trim()
    };
  }

  return {
    firstName,
    lastName,
    fullName: fullNameValue.trim()
  };
}

function toRecord(headers: string[], cells: string[]) {
  return headers.reduce<Record<string, string>>((accumulator, header, index) => {
    if (header) {
      accumulator[header] = normalizeDisplayValue(cells[index] ?? "");
    }

    return accumulator;
  }, {});
}

export function inferEntityType(sheetName: string, headers: string[]): ImportEntityType {
  const normalizedSheetName = normalizeLookupValue(sheetName);
  const haystack = headers.map((value) => normalizeLookupValue(value));

  for (const {entityType, hints} of entityHints) {
    if (hints.some((hint) => normalizedSheetName.includes(hint))) {
      return entityType;
    }
  }

  for (const {entityType, hints} of entityHints) {
    if (hints.some((hint) => haystack.some((candidate) => candidate.includes(hint)))) {
      return entityType;
    }
  }

  if (hasAny(headers, ["company_name", "website"])) {
    return "company";
  }

  if (hasAny(headers, ["full_name", "email", "phone", "mobile"])) {
    return "contact";
  }

  if (hasAny(headers, ["interaction_date", "meeting_date", "call_date"])) {
    return "interaction";
  }

  if (hasAny(headers, ["due_date", "task_type", "priority"])) {
    return "task";
  }

  if (hasAny(headers, ["opportunity_name", "estimated_value", "close_date"])) {
    return "opportunity";
  }

  return "unknown";
}

export function profileWorkbookSource(sheets: WorkbookSheetPayload[]): WorkbookProfile {
  const profiledSheets = sheets.map((sheet) => {
    const [headerRow = [], ...dataRows] = sheet.rows;
    const headers = headerRow.map((cell) => normalizeHeader(String(cell ?? ""))).filter(Boolean);

    let mixedLanguageCells = 0;
    let multiValueCells = 0;

    for (const row of dataRows) {
      for (const cell of row) {
        const value = String(cell ?? "");
        if (!value.trim()) {
          continue;
        }

        if (detectCellLanguage(value) === "mixed") {
          mixedLanguageCells += 1;
        }

        if (/[\n,;/|]/.test(value)) {
          multiValueCells += 1;
        }
      }
    }

    return {
      name: sheet.name,
      guessedEntityType: inferEntityType(sheet.name, headers),
      headers,
      rowCount: dataRows.length,
      columnCount: headerRow.length,
      mixedLanguageCells,
      multiValueCells
    };
  });

  const risks = profiledSheets.flatMap((sheet) => {
    const nextRisks: string[] = [];

    if (sheet.guessedEntityType === "unknown") {
      nextRisks.push(`${sheet.name}: entity type could not be inferred automatically.`);
    }

    if (sheet.mixedLanguageCells > 0) {
      nextRisks.push(`${sheet.name}: mixed Hebrew and English cell content detected.`);
    }

    if (sheet.multiValueCells > 0) {
      nextRisks.push(`${sheet.name}: multi-value cells need structured splitting.`);
    }

    if (sheet.headers.length === 0) {
      nextRisks.push(`${sheet.name}: no header row was detected.`);
    }

    return nextRisks;
  });

  return {
    sheetCount: profiledSheets.length,
    totalDataRows: profiledSheets.reduce((total, sheet) => total + sheet.rowCount, 0),
    sheets: profiledSheets,
    risks
  };
}

export function createStageableRows(sheetName: string, headers: string[], rows: string[][]) {
  return rows.map<StageableImportRow>((cells, index) => ({
    sheetName,
    rowNumber: index + 2,
    headers,
    cells
  }));
}

const maxStructuredHeaders = 150;
const maxStructuredColumns = 150;
const maxStructuredSheetNameLength = 120;

export function validateStructuredWorkbookProfile(profile: WorkbookProfile) {
  if (!Number.isInteger(profile.sheetCount) || profile.sheetCount < 1) {
    return {ok: false, error: "Workbook profile must include at least one sheet."};
  }

  if (!Number.isInteger(profile.totalDataRows) || profile.totalDataRows < 0) {
    return {ok: false, error: "Workbook profile total rows is invalid."};
  }

  for (const sheet of profile.sheets) {
    if (!sheet.name.trim()) {
      return {ok: false, error: "Workbook profile contains an unnamed sheet."};
    }

    if (sheet.name.length > maxStructuredSheetNameLength) {
      return {ok: false, error: "Workbook profile contains an overlong sheet name."};
    }

    if (!Number.isInteger(sheet.rowCount) || sheet.rowCount < 0) {
      return {ok: false, error: "Workbook profile has an invalid row count."};
    }

    if (!Number.isInteger(sheet.columnCount) || sheet.columnCount < 0) {
      return {ok: false, error: "Workbook profile has an invalid column count."};
    }
  }

  return {ok: true} as const;
}

export function validateStructuredStageableRows(rows: StageableImportRow[]) {
  for (const row of rows) {
    if (!row.sheetName.trim()) {
      return {ok: false, error: "Staged row is missing sheetName."};
    }

    if (row.sheetName.length > maxStructuredSheetNameLength) {
      return {ok: false, error: "Staged row sheetName exceeds the supported length."};
    }

    if (!Number.isInteger(row.rowNumber) || row.rowNumber < 2) {
      return {ok: false, error: "Staged row rowNumber must be an integer >= 2."};
    }

    if (row.headers.length < 1 || row.headers.length > maxStructuredHeaders) {
      return {ok: false, error: "Staged row headers are outside the supported shape."};
    }

    if (row.cells.length > maxStructuredColumns || row.cells.length > row.headers.length) {
      return {ok: false, error: "Staged row cells are outside the supported shape."};
    }

    if (row.headers.some((header) => !String(header ?? "").trim())) {
      return {ok: false, error: "Staged row headers must be non-empty strings."};
    }
  }

  return {ok: true} as const;
}

function createLookupCandidate(
  categoryKey: string,
  rawValue: string,
  lookups: LookupDirectory,
  required: boolean,
  overrideValueId?: string | null
) {
  const normalizedValue = normalizeLookupValue(rawValue);

  if (!normalizedValue) {
    return required
      ? {
          candidate: null,
          issue: {
            severity: "error" as const,
            issueCode: "missing_lookup_value",
            rawValue,
            message: `${categoryKey} is required.`,
            resolutionStatus: "open"
          }
        }
      : {candidate: null, issue: null};
  }

  const category = lookups[categoryKey];
  const resolvedValueId = overrideValueId ?? category?.get(normalizedValue) ?? null;
  const candidate: LookupCandidate = {
    categoryKey,
    rawValue,
    normalizedValue,
    resolvedValueId
  };

  return {
    candidate,
    issue:
      category && !resolvedValueId
        ? {
            severity: "warning" as const,
            issueCode: "unknown_lookup_value",
            rawValue,
            message: `${rawValue} is not an active value in ${categoryKey}.`,
            resolutionStatus: "open"
          }
        : null
  };
}

function normalizeRow(
  input: StageableImportRow,
  lookups: LookupDirectory,
  reviewDecision?: ImportRowReviewDecision
): {row: NormalizedImportRow; issues: RowIssue[]} {
  const normalizedHeaders = input.headers.map((header) => normalizeHeader(header));
  const rawFields = toRecord(normalizedHeaders, input.cells.map((cell) => String(cell ?? "")));
  const entityType = reviewDecision?.entityOverride ?? inferEntityType(input.sheetName, normalizedHeaders);
  const issues: RowIssue[] = [];
  const sourceRowKey = `${input.sheetName}:${input.rowNumber}`;
  const nextReviewDecision: ImportRowReviewDecision = reviewDecision ?? {
    reviewState: "review",
    entityOverride: null,
    duplicateDecision: "auto",
    existingTargetId: null,
    existingTargetLabel: null,
    lookupOverrides: {}
  };
  const intakeEnvelope: StagedIntakeEnvelope = {
    channel: "structured_reimport",
    sourceLabel: input.sheetName,
    sourceRef: sourceRowKey,
    receivedAt: new Date().toISOString(),
    submittedByType: "admin",
    locale: null,
    rawFields
  };
  const emptyIntakePayload: InboundLeadPayload = {
    companyName: null,
    contactFullName: null,
    contactFirstName: null,
    contactLastName: null,
    emails: [],
    phones: [],
    website: null,
    notes: null,
    leadSourceRaw: null
  };

  if (Object.values(rawFields).every((value) => !value)) {
    return {
      row: {
        sourceRowKey,
        entityType,
        status: "skipped",
        displayLabel: `Empty row ${input.rowNumber}`,
        companyName: null,
        contactName: null,
        websiteDomain: null,
        primaryDate: null,
        rawFields,
        normalizedFields: {},
        intakeEnvelope,
        intakePayload: emptyIntakePayload,
        lookupCandidates: [],
        duplicateFingerprints: [],
        reviewDecision: nextReviewDecision
      },
      issues: [
        {
          severity: "info",
          issueCode: "empty_row_skipped",
          rawValue: null,
          message: "The row is empty and will be skipped.",
          resolutionStatus: "resolved"
        }
      ]
    };
  }

  if (entityType === "unknown") {
    issues.push({
      severity: "warning",
      issueCode: "unknown_entity_type",
      rawValue: input.sheetName,
      message: "The sheet could not be mapped to a supported CRM entity automatically.",
      resolutionStatus: "open"
    });
  }

  const companyName = getFirstValue(rawFields, ["company_name", "company", "account_name"]);
  const companyNameNormalized = companyName ? normalizeCompanyName(companyName) : "";
  const website = getFirstValue(rawFields, ["website", "domain", "company_website"]);
  const websiteDomain = extractWebsiteDomain(website);
  const firstName = getFirstValue(rawFields, ["first_name", "first"]);
  const lastName = getFirstValue(rawFields, ["last_name", "last"]);
  const fullNameValue = getFirstValue(rawFields, ["full_name", "contact_name", "name"]);
  const contactNameParts = deriveContactNameParts(firstName, lastName, fullNameValue);
  const resolvedFirstName = contactNameParts.firstName;
  const resolvedLastName = contactNameParts.lastName;
  const fullName =
    contactNameParts.fullName || [resolvedFirstName, resolvedLastName].filter(Boolean).join(" ").trim();
  const normalizedContactName = fullName ? normalizePersonName(fullName) : "";
  const notes = getFirstValue(rawFields, ["notes", "summary", "description"]);
  const dateValue = getFirstValue(rawFields, [
    "interaction_date",
    "meeting_date",
    "call_date",
    "due_date",
    "target_close_date",
    "close_date",
    "date"
  ]);
  const primaryDate = normalizeDateInput(dateValue);
  const emails = [
    ...splitMultiValue(getFirstValue(rawFields, ["email", "primary_email"])),
    ...splitMultiValue(getFirstValue(rawFields, ["secondary_email"]))
  ].map((email) => email.toLowerCase());
  const phones = [
    ...splitMultiValue(getFirstValue(rawFields, ["phone", "mobile", "phone_number"])),
    ...splitMultiValue(getFirstValue(rawFields, ["secondary_phone"]))
  ].map(normalizePhoneNumber);

  const lookupCandidates: LookupCandidate[] = [];

  const registerLookup = (categoryKey: string, rawValue: string, required: boolean) => {
    const {candidate, issue} = createLookupCandidate(
      categoryKey,
      rawValue,
      lookups,
      required,
      nextReviewDecision.lookupOverrides[categoryKey] ?? null
    );

    if (candidate) {
      lookupCandidates.push(candidate);
    }

    if (issue) {
      issues.push(issue);
    }
  };

  if (entityType === "company") {
    if (!companyName) {
      issues.push({
        severity: "error",
        issueCode: "missing_company_name",
        rawValue: null,
        message: "Company rows require a company name.",
        resolutionStatus: "open"
      });
    }

    registerLookup("lead_source", getFirstValue(rawFields, ["source", "lead_source"]), false);
    registerLookup("company_type", getFirstValue(rawFields, ["company_type", "type"]), false);
    registerLookup("company_stage", getFirstValue(rawFields, ["stage", "company_stage"]), false);
    registerLookup("segment", getFirstValue(rawFields, ["segment"]), false);
  }

  if (entityType === "contact") {
    if (!resolvedFirstName || !resolvedLastName) {
      issues.push({
        severity: "error",
        issueCode: "missing_contact_name_parts",
        rawValue: null,
        message: "Contact rows require a first name and last name.",
        resolutionStatus: "open"
      });
    }

    if (!companyName) {
      issues.push({
        severity: "error",
        issueCode: "missing_contact_company",
        rawValue: null,
        message: "Contact rows require a company reference.",
        resolutionStatus: "open"
      });
    }

    if (emails.length === 0 && phones.length === 0) {
      issues.push({
        severity: "error",
        issueCode: "missing_contact_method",
        rawValue: null,
        message: "Contact rows require an email address or phone number.",
        resolutionStatus: "open"
      });
    }

    registerLookup("contact_label", getFirstValue(rawFields, ["label", "contact_label"]), false);
    registerLookup("phone_label", getFirstValue(rawFields, ["phone_label"]), false);
  }

  if (entityType === "interaction") {
    if (!primaryDate) {
      issues.push({
        severity: "error",
        issueCode: "invalid_interaction_date",
        rawValue: dateValue || null,
        message: "Interaction rows require a valid interaction date.",
        resolutionStatus: "open"
      });
    }

    if (!companyName && !fullName) {
      issues.push({
        severity: "error",
        issueCode: "missing_interaction_reference",
        rawValue: null,
        message: "Interaction rows must reference a company or a contact.",
        resolutionStatus: "open"
      });
    }

    registerLookup(
      "interaction_type",
      getFirstValue(rawFields, ["interaction_type", "type"]),
      true
    );
    registerLookup(
      "interaction_outcome_status",
      getFirstValue(rawFields, ["outcome", "status", "outcome_status"]),
      false
    );
  }

  if (entityType === "task") {
    if (!primaryDate) {
      issues.push({
        severity: "error",
        issueCode: "invalid_due_date",
        rawValue: dateValue || null,
        message: "Task rows require a valid due date.",
        resolutionStatus: "open"
      });
    }

    if (!companyName && !fullName) {
      issues.push({
        severity: "error",
        issueCode: "missing_task_reference",
        rawValue: null,
        message: "Task rows must reference a company or a contact.",
        resolutionStatus: "open"
      });
    }

    registerLookup("task_type", getFirstValue(rawFields, ["task_type", "type"]), true);
    registerLookup("task_priority", getFirstValue(rawFields, ["priority"]), true);
    registerLookup("task_status", getFirstValue(rawFields, ["status"]), true);
  }

  if (entityType === "opportunity") {
    if (!companyName) {
      issues.push({
        severity: "error",
        issueCode: "missing_opportunity_company",
        rawValue: null,
        message: "Opportunity rows require a company reference.",
        resolutionStatus: "open"
      });
    }

    if (!getFirstValue(rawFields, ["opportunity_name", "deal_name", "name"])) {
      issues.push({
        severity: "error",
        issueCode: "missing_opportunity_name",
        rawValue: null,
        message: "Opportunity rows require an opportunity name.",
        resolutionStatus: "open"
      });
    }

    registerLookup("opportunity_stage", getFirstValue(rawFields, ["stage"]), true);
    registerLookup("opportunity_type", getFirstValue(rawFields, ["type"]), true);
    registerLookup("opportunity_status", getFirstValue(rawFields, ["status"]), true);
  }

  const duplicateFingerprints: string[] = [];

  if (entityType === "company" && companyNameNormalized) {
    duplicateFingerprints.push(`company:name:${companyNameNormalized}`);
  }

  if (entityType === "company" && websiteDomain) {
    duplicateFingerprints.push(`company:domain:${websiteDomain}`);
  }

  if (entityType === "contact") {
    if (normalizedContactName && companyNameNormalized) {
      duplicateFingerprints.push(`contact:name_company:${normalizedContactName}:${companyNameNormalized}`);
    }

    emails.forEach((email) => duplicateFingerprints.push(`contact:email:${email}`));
    phones.filter(Boolean).forEach((phone) => duplicateFingerprints.push(`contact:phone:${phone}`));
  }

  if (entityType === "interaction") {
    const subject = normalizeLookupValue(getFirstValue(rawFields, ["subject", "title"]));
    const reference = companyNameNormalized || normalizedContactName;

    if (primaryDate && subject && reference) {
      const interactionType =
        lookupCandidates.find((candidate) => candidate.categoryKey === "interaction_type")
          ?.normalizedValue ?? "unknown";
      duplicateFingerprints.push(
        `interaction:${primaryDate.slice(0, 10)}:${interactionType}:${reference}:${subject}`
      );
    }
  }

  if (entityType === "task") {
    const taskNote = normalizeLookupValue(notes);
    const reference = companyNameNormalized || normalizedContactName;

    if (primaryDate && taskNote && reference) {
      duplicateFingerprints.push(`task:${primaryDate.slice(0, 10)}:${reference}:${taskNote}`);
    }
  }

  const normalizedFields: Record<string, unknown> = {
    companyName,
    fullName,
    firstName: resolvedFirstName,
    lastName: resolvedLastName,
    emails,
    phones,
    website,
    websiteDomain,
    notes,
    primaryDate,
    title: getFirstValue(rawFields, ["role", "role_title", "title"]),
    subject: getFirstValue(rawFields, ["subject", "title"]),
    taskOrOpportunityName: getFirstValue(rawFields, [
      "task_name",
      "opportunity_name",
      "deal_name",
      "name"
    ]),
    lookupCandidates
  };
  const intakePayload: InboundLeadPayload = {
    companyName: companyName || null,
    contactFullName: fullName || null,
    contactFirstName: resolvedFirstName || null,
    contactLastName: resolvedLastName || null,
    emails,
    phones,
    website: website || null,
    notes: notes || null,
    leadSourceRaw: getFirstValue(rawFields, ["lead_source", "source"]) || null
  };

  const hasBlockingIssue = issues.some((issue) => issue.severity === "error");

  return {
    row: {
      sourceRowKey,
      entityType,
      status: hasBlockingIssue ? "flagged" : nextReviewDecision.reviewState === "ready" ? "ready" : "needs_review",
      displayLabel:
        companyName || fullName || getFirstValue(rawFields, ["subject", "opportunity_name", "name"]) || sourceRowKey,
      companyName: companyName || null,
      contactName: fullName || null,
      websiteDomain,
      primaryDate,
      rawFields,
      normalizedFields,
      intakeEnvelope,
      intakePayload,
      lookupCandidates,
      duplicateFingerprints,
      reviewDecision: nextReviewDecision
    },
    issues
  };
}

function issueKey(issue: ImportIssueRecord) {
  return [
    issue.sheetName,
    issue.rowNumber ?? "",
    issue.entityType,
    issue.issueCode,
    issue.message,
    issue.rawValue ?? ""
  ].join("|");
}

export function validateBatchRows(input: {
  rows: StageableImportRow[];
  lookups: LookupDirectory;
  existing: ExistingDirectory;
  reviewDecisions?: ReviewDecisionDirectory;
}) {
  const normalizedRows = input.rows.map((row) =>
    normalizeRow(row, input.lookups, input.reviewDecisions?.[`${row.sheetName}:${row.rowNumber}`])
  );
  const issues: ImportIssueRecord[] = normalizedRows.flatMap(({row, issues: rowIssues}) =>
    rowIssues.map((issue) => ({
      ...issue,
      entityType: row.entityType,
      sheetName: row.sourceRowKey.split(":")[0],
      rowNumber: Number(row.sourceRowKey.split(":")[1])
    }))
  );

  const companyNames = new Set(input.existing.companyNames);
  const companyDomains = new Set(input.existing.websiteDomains);
  const availableCompanyNames = new Set(input.existing.companyNames);
  const contactFingerprints = new Set(input.existing.contactFingerprints);
  const emailFingerprints = new Set(input.existing.emails);
  const phoneFingerprints = new Set(input.existing.phones);

  const fingerprintMap = new Map<string, NormalizedImportRow[]>();

  function shouldSuppressDuplicate(row: NormalizedImportRow, issueCode: DuplicateDecision) {
    const decision = row.reviewDecision.duplicateDecision;

    if (decision === "skip") {
      return true;
    }

    if (issueCode === "attach_existing") {
      return decision === "attach_existing" && Boolean(row.reviewDecision.existingTargetId);
    }

    return decision === "keep_new";
  }

  for (const {row} of normalizedRows) {
    if (
      row.entityType === "company" &&
      row.companyName &&
      row.reviewDecision.reviewState !== "skipped" &&
      row.reviewDecision.duplicateDecision !== "skip"
    ) {
      availableCompanyNames.add(normalizeCompanyName(row.companyName));
    }
  }

  for (const {row} of normalizedRows) {
    if (row.reviewDecision.reviewState === "skipped" || row.reviewDecision.duplicateDecision === "skip") {
      continue;
    }

    row.duplicateFingerprints.forEach((fingerprint) => {
      const bucket = fingerprintMap.get(fingerprint) ?? [];
      bucket.push(row);
      fingerprintMap.set(fingerprint, bucket);
    });

    if (row.entityType === "company" && row.companyName) {
      const normalizedName = normalizeCompanyName(row.companyName);

      if (companyNames.has(normalizedName) && !shouldSuppressDuplicate(row, "keep_new")) {
        issues.push({
          entityType: row.entityType,
          sheetName: row.sourceRowKey.split(":")[0],
          rowNumber: Number(row.sourceRowKey.split(":")[1]),
          severity: "warning",
          issueCode: "duplicate_candidate",
          rawValue: row.companyName,
          message: "Company name already exists in CRM records or this batch.",
          resolutionStatus: "open"
        });
      }

      companyNames.add(normalizedName);
    }

    if (row.entityType === "company" && row.websiteDomain) {
      if (companyDomains.has(row.websiteDomain) && !shouldSuppressDuplicate(row, "keep_new")) {
        issues.push({
          entityType: row.entityType,
          sheetName: row.sourceRowKey.split(":")[0],
          rowNumber: Number(row.sourceRowKey.split(":")[1]),
          severity: "warning",
          issueCode: "duplicate_candidate",
          rawValue: row.websiteDomain,
          message: "Website domain already exists in CRM records or this batch.",
          resolutionStatus: "open"
        });
      }

      companyDomains.add(row.websiteDomain);
    }

    if (row.entityType === "contact") {
      const emailList = ((row.normalizedFields.emails as string[] | undefined) ?? []).filter(Boolean);
      const phoneList = ((row.normalizedFields.phones as string[] | undefined) ?? []).filter(Boolean);

      if (row.contactName && row.companyName) {
        const fingerprint = `${normalizePersonName(row.contactName)}:${normalizeCompanyName(row.companyName)}`;

        if (contactFingerprints.has(fingerprint) && !shouldSuppressDuplicate(row, "keep_new")) {
          issues.push({
            entityType: row.entityType,
            sheetName: row.sourceRowKey.split(":")[0],
            rowNumber: Number(row.sourceRowKey.split(":")[1]),
            severity: "warning",
            issueCode: "duplicate_candidate",
            rawValue: row.contactName,
            message: "Contact name and company combination already exists in CRM records or this batch.",
            resolutionStatus: "open"
          });
        }

        contactFingerprints.add(fingerprint);
      }

      for (const email of emailList) {
        if (emailFingerprints.has(email) && !shouldSuppressDuplicate(row, "keep_new")) {
          issues.push({
            entityType: row.entityType,
            sheetName: row.sourceRowKey.split(":")[0],
            rowNumber: Number(row.sourceRowKey.split(":")[1]),
            severity: "warning",
            issueCode: "duplicate_candidate",
            rawValue: email,
            message: "Email already exists in CRM records or this batch.",
            resolutionStatus: "open"
          });
        }

        emailFingerprints.add(email);
      }

      for (const phone of phoneList) {
        if (phoneFingerprints.has(phone) && !shouldSuppressDuplicate(row, "keep_new")) {
          issues.push({
            entityType: row.entityType,
            sheetName: row.sourceRowKey.split(":")[0],
            rowNumber: Number(row.sourceRowKey.split(":")[1]),
            severity: "warning",
            issueCode: "duplicate_candidate",
            rawValue: phone,
            message: "Phone number already exists in CRM records or this batch.",
            resolutionStatus: "open"
          });
        }

        phoneFingerprints.add(phone);
      }

      if (
        row.companyName &&
        !availableCompanyNames.has(normalizeCompanyName(row.companyName)) &&
        !(
          row.reviewDecision.duplicateDecision === "attach_existing" &&
          Boolean(row.reviewDecision.existingTargetId)
        )
      ) {
        issues.push({
          entityType: row.entityType,
          sheetName: row.sourceRowKey.split(":")[0],
          rowNumber: Number(row.sourceRowKey.split(":")[1]),
          severity: "error",
          issueCode: "orphan_company_reference",
          rawValue: row.companyName,
          message: "Referenced company was not found in existing records or this batch.",
          resolutionStatus: "open"
        });
      }
    }
  }

  for (const [fingerprint, rows] of fingerprintMap.entries()) {
    if (rows.length < 2) {
      continue;
    }

    for (const row of rows) {
      if (shouldSuppressDuplicate(row, "keep_new") || shouldSuppressDuplicate(row, "attach_existing")) {
        continue;
      }

      issues.push({
        entityType: row.entityType,
        sheetName: row.sourceRowKey.split(":")[0],
        rowNumber: Number(row.sourceRowKey.split(":")[1]),
        severity: "warning",
        issueCode: "duplicate_candidate",
        rawValue: fingerprint,
        message: "Potential duplicate candidate detected in the same batch.",
        resolutionStatus: "open"
      });
    }
  }

  const dedupedIssues = Array.from(new Map(issues.map((issue) => [issueKey(issue), issue])).values());

  const rowsWithFinalStatus = normalizedRows.map(({row}) => {
    if (row.reviewDecision.reviewState === "skipped" || row.reviewDecision.duplicateDecision === "skip") {
      return {
        ...row,
        status: "skipped"
      } satisfies NormalizedImportRow;
    }

    const hasError = dedupedIssues.some(
      (issue) =>
        issue.sheetName === row.sourceRowKey.split(":")[0] &&
        issue.rowNumber === Number(row.sourceRowKey.split(":")[1]) &&
        issue.severity === "error"
    );

    const hasWarning = dedupedIssues.some(
      (issue) =>
        issue.sheetName === row.sourceRowKey.split(":")[0] &&
        issue.rowNumber === Number(row.sourceRowKey.split(":")[1]) &&
        issue.severity === "warning"
    );

    return {
      ...row,
      status:
        hasError
          ? "flagged"
          : hasWarning && row.reviewDecision.reviewState !== "ready"
            ? "needs_review"
            : "ready"
    } satisfies NormalizedImportRow;
  });

  return {
    rows: rowsWithFinalStatus,
    issues: dedupedIssues
  };
}
