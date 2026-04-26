import * as XLSX from "xlsx";

import {
  listCompanies,
  listContacts,
  listInteractions,
  listOpportunities,
  listTasks
} from "@/lib/data/crm";

export const crmExportModules = [
  "companies",
  "contacts",
  "interactions",
  "tasks",
  "opportunities"
] as const;

export type CrmExportModule = (typeof crmExportModules)[number];

export const crmExportFormats = ["csv", "xlsx"] as const;

export type CrmExportFormat = (typeof crmExportFormats)[number];

export const crmExportLocales = ["en", "he"] as const;

export type CrmExportLocale = (typeof crmExportLocales)[number];

type ExportFiltersByModule = {
  companies: {
    query?: string;
    sourceValueId?: string;
    stageValueId?: string;
  };
  contacts: {
    query?: string;
    companyId?: string;
  };
  interactions: {
    query?: string;
    companyId?: string;
    contactId?: string;
    interactionTypeValueId?: string;
  };
  tasks: {
    query?: string;
    companyId?: string;
    contactId?: string;
    statusValueId?: string;
  };
  opportunities: {
    query?: string;
    companyId?: string;
    contactId?: string;
    opportunityStageValueId?: string;
    opportunityTypeValueId?: string;
    statusValueId?: string;
  };
};

export type CrmExportFilters<M extends CrmExportModule = CrmExportModule> = ExportFiltersByModule[M];

type ExportRow = {
  id: string;
};

type CompanyExportRow = {
  id: string;
  companyName: string;
  website: string | null;
  sourceLabelEn: string | null;
  sourceLabelHe: string | null;
  stageLabelEn: string | null;
  stageLabelHe: string | null;
  contactsCount: number;
};

type ContactExportRow = {
  id: string;
  fullName: string;
  companyName: string | null;
  roleTitle: string | null;
  primaryEmail: string | null;
  primaryPhone: string | null;
};

type InteractionExportRow = {
  id: string;
  interactionDate: Date | string;
  companyName: string | null;
  contactName: string | null;
  interactionTypeLabelEn: string | null;
  interactionTypeLabelHe: string | null;
  outcomeLabelEn: string | null;
  outcomeLabelHe: string | null;
  subject: string;
  summary: string;
};

type TaskExportRow = {
  id: string;
  dueDate: Date | string;
  companyName: string | null;
  contactName: string | null;
  taskTypeLabelEn: string | null;
  taskTypeLabelHe: string | null;
  priorityLabelEn: string | null;
  priorityLabelHe: string | null;
  statusLabelEn: string | null;
  statusLabelHe: string | null;
  notes: string | null;
  followUpEmail: string | null;
};

type OpportunityExportRow = {
  id: string;
  companyName: string | null;
  contactName: string | null;
  opportunityName: string;
  stageLabelEn: string | null;
  stageLabelHe: string | null;
  typeLabelEn: string | null;
  typeLabelHe: string | null;
  statusLabelEn: string | null;
  statusLabelHe: string | null;
  estimatedValue: string | null;
  targetCloseDate: Date | string | null;
};

type ExportColumn<Row> = {
  headerEn: string;
  headerHe: string;
  value: (row: Row, locale: CrmExportLocale) => string;
};

type ExportDefinition<Row extends ExportRow, Filters> = {
  sheetNameEn: string;
  sheetNameHe: string;
  filenameStem: string;
  fetchRows: (filters: Filters) => Promise<Row[]>;
  columns: Array<ExportColumn<Row>>;
};

type ExportDefinitionMap = {
  companies: ExportDefinition<CompanyExportRow, CrmExportFilters<"companies">>;
  contacts: ExportDefinition<ContactExportRow, CrmExportFilters<"contacts">>;
  interactions: ExportDefinition<
    InteractionExportRow,
    CrmExportFilters<"interactions">
  >;
  tasks: ExportDefinition<TaskExportRow, CrmExportFilters<"tasks">>;
  opportunities: ExportDefinition<
    OpportunityExportRow,
    CrmExportFilters<"opportunities">
  >;
};

function pickLabel(locale: CrmExportLocale, en?: string | null, he?: string | null) {
  return locale === "he" ? he || en || "—" : en || he || "—";
}

function formatDate(
  locale: CrmExportLocale,
  value: Date | string | null | undefined,
  options: Intl.DateTimeFormatOptions
) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat(locale === "he" ? "he-IL" : "en-US", options).format(date);
}

function formatMoney(locale: CrmExportLocale, value: unknown) {
  const numeric = Number(String(value ?? "").trim());
  if (!Number.isFinite(numeric)) {
    return "—";
  }

  return new Intl.NumberFormat(locale === "he" ? "he-IL" : "en-US", {
    maximumFractionDigits: 0
  }).format(numeric);
}

function safeText(value: string | null | undefined) {
  return value?.trim() || "—";
}

export function escapeSpreadsheetFormula(value: string) {
  return /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
}

function sanitizeSheetName(name: string) {
  return name.replace(/[:\\/?*\[\]]/g, " ").trim().slice(0, 31) || "Export";
}

function exportDateStamp() {
  return new Date().toISOString().slice(0, 10);
}

function normalizeSelectedIds(selectedIds?: string[]) {
  return Array.from(
    new Set(
      (selectedIds ?? [])
        .map((value) => value.trim())
        .filter((value) => value.length > 0)
    )
  );
}

const exportDefinitions: ExportDefinitionMap = {
  companies: {
    sheetNameEn: "Companies",
    sheetNameHe: "חברות",
    filenameStem: "crm-companies",
    fetchRows: async (filters) =>
      (await listCompanies(filters)).map((row) => ({
        id: row.id,
        companyName: row.companyName,
        website: row.website,
        sourceLabelEn: row.sourceLabelEn ?? null,
        sourceLabelHe: row.sourceLabelHe ?? null,
        stageLabelEn: row.stageLabelEn ?? null,
        stageLabelHe: row.stageLabelHe ?? null,
        contactsCount: row.contactsCount
      })),
    columns: [
      {
        headerEn: "Company",
        headerHe: "חברה",
        value: (row) => safeText(row.companyName)
      },
      {
        headerEn: "Website",
        headerHe: "אתר",
        value: (row) => safeText(row.website)
      },
      {
        headerEn: "Stage",
        headerHe: "שלב",
        value: (row, locale) => pickLabel(locale, row.stageLabelEn, row.stageLabelHe)
      },
      {
        headerEn: "Source",
        headerHe: "מקור",
        value: (row, locale) => pickLabel(locale, row.sourceLabelEn, row.sourceLabelHe)
      },
      {
        headerEn: "Contacts",
        headerHe: "אנשי קשר",
        value: (row) => String(row.contactsCount)
      }
    ]
  },
  contacts: {
    sheetNameEn: "Contacts",
    sheetNameHe: "אנשי קשר",
    filenameStem: "crm-contacts",
    fetchRows: async (filters) =>
      (await listContacts(filters)).map((row) => ({
        id: row.id,
        fullName: row.fullName,
        companyName: row.companyName,
        roleTitle: row.roleTitle,
        primaryEmail: row.primaryEmail,
        primaryPhone: row.primaryPhone
      })),
    columns: [
      {
        headerEn: "Full Name",
        headerHe: "שם מלא",
        value: (row) => safeText(row.fullName)
      },
      {
        headerEn: "Company",
        headerHe: "חברה",
        value: (row) => safeText(row.companyName)
      },
      {
        headerEn: "Role",
        headerHe: "תפקיד",
        value: (row) => safeText(row.roleTitle)
      },
      {
        headerEn: "Primary Email",
        headerHe: "אימייל ראשי",
        value: (row) => safeText(row.primaryEmail)
      },
      {
        headerEn: "Primary Phone",
        headerHe: "טלפון ראשי",
        value: (row) => safeText(row.primaryPhone)
      }
    ]
  },
  interactions: {
    sheetNameEn: "Interactions",
    sheetNameHe: "אינטראקציות",
    filenameStem: "crm-interactions",
    fetchRows: async (filters) =>
      (await listInteractions(filters)).map((row) => ({
        id: row.id,
        interactionDate: row.interactionDate,
        companyName: row.companyName,
        contactName: row.contactName,
        interactionTypeLabelEn: row.interactionTypeLabelEn ?? null,
        interactionTypeLabelHe: row.interactionTypeLabelHe ?? null,
        outcomeLabelEn: row.outcomeLabelEn ?? null,
        outcomeLabelHe: row.outcomeLabelHe ?? null,
        subject: row.subject,
        summary: row.summary
      })),
    columns: [
      {
        headerEn: "Date",
        headerHe: "תאריך",
        value: (row, locale) =>
          formatDate(locale, row.interactionDate, {
            dateStyle: "medium",
            timeStyle: "short"
          })
      },
      {
        headerEn: "Company",
        headerHe: "חברה",
        value: (row) => safeText(row.companyName)
      },
      {
        headerEn: "Contact",
        headerHe: "איש קשר",
        value: (row) => safeText(row.contactName)
      },
      {
        headerEn: "Type",
        headerHe: "סוג",
        value: (row, locale) => pickLabel(locale, row.interactionTypeLabelEn, row.interactionTypeLabelHe)
      },
      {
        headerEn: "Outcome",
        headerHe: "תוצאה",
        value: (row, locale) => pickLabel(locale, row.outcomeLabelEn, row.outcomeLabelHe)
      },
      {
        headerEn: "Subject",
        headerHe: "נושא",
        value: (row) => safeText(row.subject)
      },
      {
        headerEn: "Summary",
        headerHe: "תקציר",
        value: (row) => safeText(row.summary)
      }
    ]
  },
  tasks: {
    sheetNameEn: "Tasks",
    sheetNameHe: "משימות",
    filenameStem: "crm-tasks",
    fetchRows: async (filters) =>
      (await listTasks(filters)).map((row) => ({
        id: row.id,
        dueDate: row.dueDate,
        companyName: row.companyName,
        contactName: row.contactName,
        taskTypeLabelEn: row.taskTypeLabelEn ?? null,
        taskTypeLabelHe: row.taskTypeLabelHe ?? null,
        priorityLabelEn: row.priorityLabelEn ?? null,
        priorityLabelHe: row.priorityLabelHe ?? null,
        statusLabelEn: row.statusLabelEn ?? null,
        statusLabelHe: row.statusLabelHe ?? null,
        notes: row.notes,
        followUpEmail: row.followUpEmail ?? null
      })),
    columns: [
      {
        headerEn: "Due Date",
        headerHe: "תאריך יעד",
        value: (row, locale) => formatDate(locale, row.dueDate, {dateStyle: "medium"})
      },
      {
        headerEn: "Company",
        headerHe: "חברה",
        value: (row) => safeText(row.companyName)
      },
      {
        headerEn: "Contact",
        headerHe: "איש קשר",
        value: (row) => safeText(row.contactName)
      },
      {
        headerEn: "Task Type",
        headerHe: "סוג משימה",
        value: (row, locale) => pickLabel(locale, row.taskTypeLabelEn, row.taskTypeLabelHe)
      },
      {
        headerEn: "Priority",
        headerHe: "עדיפות",
        value: (row, locale) => pickLabel(locale, row.priorityLabelEn, row.priorityLabelHe)
      },
      {
        headerEn: "Status",
        headerHe: "סטטוס",
        value: (row, locale) => pickLabel(locale, row.statusLabelEn, row.statusLabelHe)
      },
      {
        headerEn: "Follow-up Email",
        headerHe: "אימייל למעקב",
        value: (row) => safeText(row.followUpEmail)
      },
      {
        headerEn: "Notes",
        headerHe: "הערות",
        value: (row) => safeText(row.notes)
      }
    ]
  },
  opportunities: {
    sheetNameEn: "Opportunities",
    sheetNameHe: "הזדמנויות",
    filenameStem: "crm-opportunities",
    fetchRows: async (filters) =>
      (await listOpportunities(filters)).map((row) => ({
        id: row.id,
        companyName: row.companyName,
        contactName: row.contactName,
        opportunityName: row.opportunityName,
        stageLabelEn: row.stageLabelEn ?? null,
        stageLabelHe: row.stageLabelHe ?? null,
        typeLabelEn: row.typeLabelEn ?? null,
        typeLabelHe: row.typeLabelHe ?? null,
        statusLabelEn: row.statusLabelEn ?? null,
        statusLabelHe: row.statusLabelHe ?? null,
        estimatedValue: row.estimatedValue == null ? null : String(row.estimatedValue),
        targetCloseDate: row.targetCloseDate
      })),
    columns: [
      {
        headerEn: "Company",
        headerHe: "חברה",
        value: (row) => safeText(row.companyName)
      },
      {
        headerEn: "Contact",
        headerHe: "איש קשר",
        value: (row) => safeText(row.contactName)
      },
      {
        headerEn: "Opportunity",
        headerHe: "הזדמנות",
        value: (row) => safeText(row.opportunityName)
      },
      {
        headerEn: "Stage",
        headerHe: "שלב",
        value: (row, locale) => pickLabel(locale, row.stageLabelEn, row.stageLabelHe)
      },
      {
        headerEn: "Type",
        headerHe: "סוג",
        value: (row, locale) => pickLabel(locale, row.typeLabelEn, row.typeLabelHe)
      },
      {
        headerEn: "Status",
        headerHe: "סטטוס",
        value: (row, locale) => pickLabel(locale, row.statusLabelEn, row.statusLabelHe)
      },
      {
        headerEn: "Estimated Value",
        headerHe: "שווי משוער",
        value: (row, locale) => formatMoney(locale, row.estimatedValue)
      },
      {
        headerEn: "Target Close Date",
        headerHe: "תאריך סגירה יעד",
        value: (row, locale) => formatDate(locale, row.targetCloseDate, {dateStyle: "medium"})
      }
    ]
  }
};

export function buildCrmExportHref(input: {
  module: CrmExportModule;
  format: CrmExportFormat;
  locale: CrmExportLocale;
  filters: Record<string, string | undefined>;
  selectedIds?: string[];
}) {
  const params = new URLSearchParams();
  params.set("module", input.module);
  params.set("format", input.format);
  params.set("locale", input.locale);

  for (const [key, value] of Object.entries(input.filters)) {
    const trimmed = value?.trim();
    if (trimmed) {
      params.set(key, trimmed);
    }
  }

  for (const selectedId of normalizeSelectedIds(input.selectedIds)) {
    params.append("selectedIds", selectedId);
  }

  return `/api/exports?${params.toString()}`;
}

export function buildCrmExportCsvBuffer(rows: string[][]) {
  const worksheet = XLSX.utils.aoa_to_sheet(rows);
  const csv = XLSX.utils.sheet_to_csv(worksheet);
  return Buffer.from(`\ufeff${csv}`, "utf8");
}

export function buildCrmExportXlsxBuffer(sheetName: string, rows: string[][]) {
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.aoa_to_sheet(rows);
  XLSX.utils.book_append_sheet(workbook, worksheet, sanitizeSheetName(sheetName));

  return XLSX.write(workbook, {bookType: "xlsx", type: "buffer"}) as Buffer;
}

function getDefinition(module: CrmExportModule) {
  return exportDefinitions[module];
}

export async function buildCrmExportRows<M extends CrmExportModule>(input: {
  module: M;
  locale: CrmExportLocale;
  filters: CrmExportFilters<M>;
  selectedIds?: string[];
}) {
  const definition = getDefinition(input.module);
  const rows = (await definition.fetchRows(input.filters)) as Array<Record<string, unknown> & {id: string}>;
  const selectedIds = normalizeSelectedIds(input.selectedIds);
  const selectedSet = selectedIds.length > 0 ? new Set(selectedIds) : null;
  const exportRows = selectedSet ? rows.filter((row) => selectedSet.has(row.id)) : rows;
  const headers = definition.columns.map((column) =>
    input.locale === "he" ? column.headerHe : column.headerEn
  );
  const columns = definition.columns as Array<ExportColumn<(typeof exportRows)[number]>>;
  const dataRows = exportRows.map((row) =>
    columns.map((column) => escapeSpreadsheetFormula(column.value(row, input.locale)))
  );

  return {
    module: input.module,
    sheetName: input.locale === "he" ? definition.sheetNameHe : definition.sheetNameEn,
    filenameBase: definition.filenameStem,
    headers,
    rows: [headers, ...dataRows]
  };
}

export async function buildCrmExportArtifact<M extends CrmExportModule>(input: {
  module: M;
  format: CrmExportFormat;
  locale: CrmExportLocale;
  filters: CrmExportFilters<M>;
  selectedIds?: string[];
}) {
  const document = await buildCrmExportRows(input);
  const buffer =
    input.format === "csv"
      ? buildCrmExportCsvBuffer(document.rows)
      : buildCrmExportXlsxBuffer(document.sheetName, document.rows);

  return {
    buffer,
    contentType:
      input.format === "csv"
        ? "text/csv; charset=utf-8"
        : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    filename: `${document.filenameBase}-${input.locale}-${exportDateStamp()}.${input.format}`,
    module: document.module
  };
}
