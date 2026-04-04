import {randomUUID} from "node:crypto";

import type {Prisma} from "@prisma/client";

import {listAdminListCategories} from "@/lib/data/repository";

import {
  normalizeCompanyName,
  normalizeLookupValue,
  normalizePersonName
} from "./normalize";
import type {
  BatchSummary,
  ImportEntityType,
  ImportBatchListItem,
  ImportBatchReview,
  ImportIssueRecord,
  ImportRowReviewDecision,
  StageableImportRow,
  WorkbookProfile
} from "./types";
import {validateBatchRows} from "./workbook";

type PersistedImportBatch = {
  id: string;
  uploadedById: string;
  sourceFilename: string;
  status: string;
  startedAt: string;
  completedAt: string | null;
  summaryJson: BatchSummary | null;
};

type PersistedImportRow = {
  id: string;
  batchId: string;
  entityType: string;
  sheetName: string;
  rowNumber: number;
  sourceRowKey: string;
  status: string;
  rawJson: Record<string, string>;
  normalizedJson: Record<string, unknown>;
  reviewJson: ImportRowReviewDecision | null;
  fingerprint: string | null;
  committedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

type PersistedImportIssue = ImportIssueRecord & {
  id: string;
  batchId: string;
};

type FallbackCompany = {
  id: string;
  companyName: string;
  website: string | null;
  notes: string | null;
};

type FallbackContact = {
  id: string;
  fullName: string;
  firstName: string | null;
  lastName: string | null;
  companyId: string | null;
  roleTitle: string | null;
  notes: string | null;
  emails: string[];
  phones: string[];
};

type FallbackInteraction = {
  id: string;
  companyId: string | null;
  contactId: string | null;
  interactionDate: string;
  interactionTypeValueId: string;
  subject: string;
  summary: string;
};

type FallbackTask = {
  id: string;
  companyId: string | null;
  contactId: string | null;
  dueDate: string;
  taskTypeValueId: string;
  priorityValueId: string;
  statusValueId: string;
  notes: string | null;
};

type FallbackOpportunity = {
  id: string;
  companyId: string;
  contactId: string | null;
  opportunityName: string;
  opportunityStageValueId: string;
  opportunityTypeValueId: string;
  statusValueId: string;
  targetCloseDate: string | null;
  notes: string | null;
};

type ImportFallbackState = {
  batches: PersistedImportBatch[];
  rows: PersistedImportRow[];
  issues: PersistedImportIssue[];
  companies: FallbackCompany[];
  contacts: FallbackContact[];
  interactions: FallbackInteraction[];
  tasks: FallbackTask[];
  opportunities: FallbackOpportunity[];
};

const globalImportState = globalThis as typeof globalThis & {
  crmImportFallbackState?: ImportFallbackState;
};

function getFallbackState(): ImportFallbackState {
  if (!globalImportState.crmImportFallbackState) {
    globalImportState.crmImportFallbackState = {
      batches: [],
      rows: [],
      issues: [],
      companies: [],
      contacts: [],
      interactions: [],
      tasks: [],
      opportunities: []
    };
  }

  return globalImportState.crmImportFallbackState;
}

export function resetImportFallbackStore() {
  globalImportState.crmImportFallbackState = {
    batches: [],
    rows: [],
    issues: [],
    companies: [],
    contacts: [],
    interactions: [],
    tasks: [],
    opportunities: []
  };
}

function hasDatabaseUrl() {
  return Boolean(process.env.DATABASE_URL?.trim());
}

async function getPrisma() {
  const {prisma} = await import("@/lib/prisma/client");

  return prisma;
}

function buildEmptySummary(profile: WorkbookProfile): BatchSummary {
  return {
    profile,
    counts: {
      totalRows: 0,
      readyRows: 0,
      flaggedRows: 0,
      skippedRows: 0,
      created: 0,
      updated: 0,
      skipped: 0,
      flagged: 0
    },
    issueCounts: {},
    entityCounts: {},
    lastStagedAt: null,
    lastCommittedAt: null
  };
}

function serializeRow(row: StageableImportRow) {
  return row.headers.reduce<Record<string, string>>((accumulator, header, index) => {
    accumulator[header] = String(row.cells[index] ?? "");
    return accumulator;
  }, {});
}

function toJsonValue<T>(value: T): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value, (_key, currentValue) => currentValue ?? null)) as Prisma.InputJsonValue;
}

function getDefaultReviewDecision(): ImportRowReviewDecision {
  return {
    reviewState: "review",
    entityOverride: null,
    duplicateDecision: "auto",
    existingTargetId: null,
    existingTargetLabel: null,
    lookupOverrides: {}
  };
}

function deserializeRow(row: PersistedImportRow): StageableImportRow {
  const headers = Object.keys(row.rawJson);
  const cells = headers.map((header) => String(row.rawJson[header] ?? ""));

  return {
    sheetName: row.sheetName,
    rowNumber: row.rowNumber,
    headers,
    cells
  };
}

function mapBatchListItem(batch: PersistedImportBatch): ImportBatchListItem {
  return {
    id: batch.id,
    sourceFilename: batch.sourceFilename,
    status: batch.status,
    startedAt: batch.startedAt,
    completedAt: batch.completedAt,
    summary: batch.summaryJson
  };
}

async function buildLookupDirectory() {
  const categories = await listAdminListCategories();

  return Object.fromEntries(
    categories.map((category) => [
      category.key,
      new Map<string, string>(
        category.values
          .filter((value) => value.isActive)
          .flatMap<[string, string]>((value) => {
            const entries: Array<[string, string]> = [[normalizeLookupValue(value.labelEn), value.id]];

            if (value.labelHe) {
              entries.push([normalizeLookupValue(value.labelHe), value.id]);
            }

            if (value.key) {
              entries.push([normalizeLookupValue(value.key), value.id]);
            }

            return entries;
          })
      )
    ])
  ) as Record<string, Map<string, string>>;
}

async function getExistingDirectory() {
  if (!hasDatabaseUrl()) {
    const state = getFallbackState();

    return {
      companyNames: new Set(state.companies.map((company) => normalizeCompanyName(company.companyName))),
      websiteDomains: new Set(
        state.companies
          .map((company) => company.website?.replace(/^https?:\/\//, "").replace(/^www\./, "").toLowerCase())
          .filter(Boolean) as string[]
      ),
      contactFingerprints: new Set(
        state.contacts
          .filter((contact) => contact.companyId)
          .map((contact) => {
            const company = state.companies.find((candidate) => candidate.id === contact.companyId);
            return company
              ? `${normalizePersonName(contact.fullName)}:${normalizeCompanyName(company.companyName)}`
              : "";
          })
          .filter(Boolean)
      ),
      emails: new Set(state.contacts.flatMap((contact) => contact.emails.map((email) => email.toLowerCase()))),
      phones: new Set(state.contacts.flatMap((contact) => contact.phones))
    };
  }

  const prisma = (await getPrisma()) as any;
  const [companies, contacts] = await Promise.all([
    prisma.company.findMany({
      select: {
        companyName: true,
        website: true
      }
    }),
    prisma.contact.findMany({
      select: {
        fullName: true,
        company: {select: {companyName: true}},
        emails: {select: {email: true}},
        phones: {select: {phoneNumber: true}}
      }
    })
  ]);

  return {
    companyNames: new Set<string>(
      companies.map((company: {companyName: string}) => normalizeCompanyName(company.companyName))
    ),
    websiteDomains: new Set(
      companies
        .map((company: {website?: string | null}) =>
          company.website?.replace(/^https?:\/\//, "").replace(/^www\./, "").toLowerCase()
        )
        .filter(Boolean) as string[]
    ),
    contactFingerprints: new Set<string>(
      contacts
        .filter((contact: {company?: {companyName?: string | null} | null}) => contact.company?.companyName)
        .map(
          (contact: {fullName: string; company: {companyName: string}}) =>
            `${normalizePersonName(contact.fullName)}:${normalizeCompanyName(contact.company!.companyName)}`
        )
    ),
    emails: new Set<string>(
      contacts.flatMap((contact: {emails: Array<{email: string}>}) =>
        contact.emails.map((email: {email: string}) => email.email.toLowerCase())
      )
    ),
    phones: new Set<string>(
      contacts.flatMap((contact: {phones: Array<{phoneNumber: string}>}) =>
        contact.phones.map((phone: {phoneNumber: string}) => phone.phoneNumber)
      )
    )
  };
}

async function readPersistedBatch(batchId: string) {
  if (!hasDatabaseUrl()) {
    const state = getFallbackState();
    const batch = state.batches.find((candidate) => candidate.id === batchId);

    if (!batch) {
      throw new Error("Import batch not found.");
    }

    return {
      batch,
      rows: state.rows.filter((row) => row.batchId === batchId),
      issues: state.issues.filter((issue) => issue.batchId === batchId)
    };
  }

  const prisma = (await getPrisma()) as any;
  const batch = await prisma.importBatch.findUnique({
    where: {id: batchId},
    include: {
      rows: true,
      issues: true
    }
  });

  if (!batch) {
    throw new Error("Import batch not found.");
  }

  return {
    batch: {
      id: batch.id,
      uploadedById: batch.uploadedById,
      sourceFilename: batch.sourceFilename,
      status: batch.status,
      startedAt: batch.startedAt.toISOString(),
      completedAt: batch.completedAt?.toISOString() ?? null,
      summaryJson: (batch.summaryJson as BatchSummary | null) ?? null
    },
    rows: batch.rows.map((row: any) => ({
      id: row.id,
      batchId: row.batchId,
      entityType: row.entityType,
      sheetName: row.sheetName,
      rowNumber: row.rowNumber,
      sourceRowKey: row.sourceRowKey,
      status: row.status,
      rawJson: row.rawJson as Record<string, string>,
      normalizedJson: row.normalizedJson as Record<string, unknown>,
      reviewJson: (row.reviewJson as ImportRowReviewDecision | null) ?? null,
      fingerprint: row.fingerprint,
      committedAt: row.committedAt?.toISOString() ?? null,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString()
    })),
    issues: batch.issues.map((issue: any) => ({
      id: issue.id,
      batchId: issue.batchId,
      entityType: issue.entityType as ImportIssueRecord["entityType"],
      sheetName: issue.sheetName,
      rowNumber: issue.rowNumber,
      severity: issue.severity as ImportIssueRecord["severity"],
      issueCode: issue.issueCode,
      rawValue: issue.rawValue,
      message: issue.message,
      resolutionStatus: issue.resolutionStatus
    }))
  };
}

async function writeValidationState(batchId: string, input: {
  rows: ReturnType<typeof validateBatchRows>["rows"];
  issues: ImportIssueRecord[];
  profile: WorkbookProfile;
  currentSummary: BatchSummary | null;
}) {
  const now = new Date().toISOString();
  const issueCounts = input.issues.reduce<Record<string, number>>((accumulator, issue) => {
    accumulator[issue.issueCode] = (accumulator[issue.issueCode] ?? 0) + 1;
    return accumulator;
  }, {});
  const entityCounts = input.rows.reduce<Record<string, number>>((accumulator, row) => {
    accumulator[row.entityType] = (accumulator[row.entityType] ?? 0) + 1;
    return accumulator;
  }, {});
  const summary: BatchSummary = {
    profile: input.profile,
    counts: {
      totalRows: input.rows.length,
      readyRows: input.rows.filter((row) => row.status === "ready").length,
      flaggedRows: input.rows.filter((row) => row.status === "flagged").length,
      skippedRows: input.rows.filter((row) => row.status === "skipped").length,
      created: input.currentSummary?.counts.created ?? 0,
      updated: input.currentSummary?.counts.updated ?? 0,
      skipped: input.rows.filter((row) => row.status === "skipped").length,
      flagged: input.rows.filter((row) => row.status === "flagged").length
    },
    issueCounts,
    entityCounts,
    lastStagedAt: now,
    lastCommittedAt: input.currentSummary?.lastCommittedAt ?? null
  };

  const hasErrors = input.issues.some((issue) => issue.severity === "error");
  const hasWarnings = input.issues.some((issue) => issue.severity === "warning");
  const hasNeedsReview = input.rows.some((row) => row.status === "needs_review");
  const status =
    input.rows.length === 0
      ? "profiling"
      : hasErrors || hasNeedsReview
        ? "review_required"
        : hasWarnings
          ? "ready_with_warnings"
          : "ready";

  if (!hasDatabaseUrl()) {
    const state = getFallbackState();
    state.rows = state.rows.map((row) => {
      if (row.batchId !== batchId) {
        return row;
      }

      const next = input.rows.find((candidate) => candidate.sourceRowKey === row.sourceRowKey);

      if (!next) {
        return row;
      }

      return {
        ...row,
        entityType: next.entityType,
        status: next.status,
        normalizedJson: next.normalizedFields,
        reviewJson: next.reviewDecision,
        fingerprint: next.duplicateFingerprints[0] ?? null,
        updatedAt: now
      };
    });
    state.issues = [
      ...state.issues.filter((issue) => issue.batchId !== batchId),
      ...input.issues.map((issue) => ({
        id: randomUUID(),
        batchId,
        ...issue
      }))
    ];
    state.batches = state.batches.map((batch) =>
      batch.id === batchId
        ? {
            ...batch,
            status,
            summaryJson: summary
          }
        : batch
    );

    return summary;
  }

  const prisma = (await getPrisma()) as any;

  await prisma.$transaction([
    ...input.rows.map((row) =>
      prisma.importRow.update({
        where: {
          batchId_sourceRowKey: {
            batchId,
            sourceRowKey: row.sourceRowKey
          }
        },
        data: {
          entityType: row.entityType,
          status: row.status,
          normalizedJson: toJsonValue(row.normalizedFields),
          reviewJson: toJsonValue(row.reviewDecision),
          fingerprint: row.duplicateFingerprints[0] ?? null
        }
      })
    ),
    prisma.importIssue.deleteMany({
      where: {batchId}
    }),
    prisma.importBatch.update({
      where: {id: batchId},
      data: {
        status,
        summaryJson: toJsonValue(summary)
      }
    }),
    ...input.issues.map((issue) =>
      prisma.importIssue.create({
        data: {
          batchId,
          entityType: issue.entityType,
          sheetName: issue.sheetName,
          rowNumber: issue.rowNumber,
          severity: issue.severity,
          issueCode: issue.issueCode,
          rawValue: issue.rawValue,
          message: issue.message,
          resolutionStatus: issue.resolutionStatus
        }
      })
    )
  ]);

  return summary;
}

function normalizedLookupId(row: PersistedImportRow, categoryKey: string) {
  const lookupCandidates = ((row.normalizedJson.lookupCandidates ?? []) as Array<{
    categoryKey: string;
    resolvedValueId?: string | null;
  }>);

  return lookupCandidates.find((candidate) => candidate.categoryKey === categoryKey)?.resolvedValueId ?? null;
}

function importCommitPriority(entityType: string) {
  switch (entityType) {
    case "company":
      return 0;
    case "contact":
      return 1;
    case "interaction":
      return 2;
    case "task":
      return 3;
    case "opportunity":
      return 4;
    default:
      return 5;
  }
}

export async function createImportBatch(input: {
  uploadedById: string;
  sourceFilename: string;
  profile: WorkbookProfile;
}) {
  const summary = buildEmptySummary(input.profile);

  if (!hasDatabaseUrl()) {
    const batch: PersistedImportBatch = {
      id: randomUUID(),
      uploadedById: input.uploadedById,
      sourceFilename: input.sourceFilename,
      status: "profiling",
      startedAt: new Date().toISOString(),
      completedAt: null,
      summaryJson: summary
    };

    getFallbackState().batches.unshift(batch);
    return mapBatchListItem(batch);
  }

  const prisma = (await getPrisma()) as any;
  const batch = await prisma.importBatch.create({
    data: {
      uploadedById: input.uploadedById,
      sourceFilename: input.sourceFilename,
      status: "profiling",
      summaryJson: toJsonValue(summary)
    }
  });

  return mapBatchListItem({
    id: batch.id,
    uploadedById: batch.uploadedById,
    sourceFilename: batch.sourceFilename,
    status: batch.status,
    startedAt: batch.startedAt.toISOString(),
    completedAt: batch.completedAt?.toISOString() ?? null,
    summaryJson: summary
  });
}

export async function stageImportRows(input: {
  batchId: string;
  rows: StageableImportRow[];
}) {
  const now = new Date().toISOString();

  if (!hasDatabaseUrl()) {
    const state = getFallbackState();

    for (const row of input.rows) {
      const sourceRowKey = `${row.sheetName}:${row.rowNumber}`;
      const existingIndex = state.rows.findIndex(
        (candidate) => candidate.batchId === input.batchId && candidate.sourceRowKey === sourceRowKey
      );
      const nextRow: PersistedImportRow = {
        id: existingIndex >= 0 ? state.rows[existingIndex].id : randomUUID(),
        batchId: input.batchId,
        entityType: "unknown",
        sheetName: row.sheetName,
        rowNumber: row.rowNumber,
        sourceRowKey,
        status: "staged",
        rawJson: serializeRow(row),
        normalizedJson: {},
        reviewJson:
          existingIndex >= 0
            ? state.rows[existingIndex].reviewJson ?? getDefaultReviewDecision()
            : getDefaultReviewDecision(),
        fingerprint: null,
        committedAt: null,
        createdAt: existingIndex >= 0 ? state.rows[existingIndex].createdAt : now,
        updatedAt: now
      };

      if (existingIndex >= 0) {
        state.rows[existingIndex] = nextRow;
      } else {
        state.rows.push(nextRow);
      }
    }
  } else {
    const prisma = (await getPrisma()) as any;

    await prisma.$transaction(
      input.rows.map((row) =>
        prisma.importRow.upsert({
          where: {
            batchId_sourceRowKey: {
              batchId: input.batchId,
              sourceRowKey: `${row.sheetName}:${row.rowNumber}`
            }
          },
          update: {
            rawJson: toJsonValue(serializeRow(row)),
            sheetName: row.sheetName,
            rowNumber: row.rowNumber,
            status: "staged"
          },
          create: {
            batchId: input.batchId,
            entityType: "unknown",
            sheetName: row.sheetName,
            rowNumber: row.rowNumber,
            sourceRowKey: `${row.sheetName}:${row.rowNumber}`,
            status: "staged",
            rawJson: toJsonValue(serializeRow(row)),
            normalizedJson: toJsonValue({}),
            reviewJson: toJsonValue(getDefaultReviewDecision())
          }
        })
      )
    );
  }

  const persisted = await readPersistedBatch(input.batchId);
  const lookups = await buildLookupDirectory();
  const existing = (await getExistingDirectory()) as {
    companyNames: Set<string>;
    websiteDomains: Set<string>;
    contactFingerprints: Set<string>;
    emails: Set<string>;
    phones: Set<string>;
  };
  const validation = validateBatchRows({
    rows: persisted.rows.map(deserializeRow),
    lookups,
    existing,
    reviewDecisions: Object.fromEntries(
      persisted.rows.map((row: PersistedImportRow) => [
        row.sourceRowKey,
        row.reviewJson ?? getDefaultReviewDecision()
      ])
    )
  });

  const summary = await writeValidationState(input.batchId, {
    rows: validation.rows,
    issues: validation.issues,
    profile: persisted.batch.summaryJson?.profile ?? buildEmptySummary({sheetCount: 0, totalDataRows: 0, sheets: [], risks: []}).profile,
    currentSummary: persisted.batch.summaryJson
  });

  return {
    id: persisted.batch.id,
    status: validation.issues.some((issue) => issue.severity === "error") ? "review_required" : "ready",
    summary
  };
}

export async function listImportBatches() {
  if (!hasDatabaseUrl()) {
    return getFallbackState().batches
      .slice()
      .sort((left, right) => right.startedAt.localeCompare(left.startedAt))
      .map(mapBatchListItem);
  }

  const prisma = (await getPrisma()) as any;
  const batches = await prisma.importBatch.findMany({
    orderBy: {
      startedAt: "desc"
    }
  });

  return batches.map((batch: any) =>
    mapBatchListItem({
      id: batch.id,
      uploadedById: batch.uploadedById,
      sourceFilename: batch.sourceFilename,
      status: batch.status,
      startedAt: batch.startedAt.toISOString(),
      completedAt: batch.completedAt?.toISOString() ?? null,
      summaryJson: (batch.summaryJson as BatchSummary | null) ?? null
    })
  );
}

export async function getImportBatchReview(batchId: string): Promise<ImportBatchReview | null> {
  try {
    const persisted = await readPersistedBatch(batchId);
    const options = await listImportReviewOptions();

    return {
      ...mapBatchListItem(persisted.batch),
      options,
      issues: persisted.issues
        .slice()
        .sort(
          (left: PersistedImportIssue, right: PersistedImportIssue) =>
            (right.severity === "error" ? 1 : 0) -
              (left.severity === "error" ? 1 : 0) ||
            (left.rowNumber ?? 0) - (right.rowNumber ?? 0)
        ),
      rows: persisted.rows
        .slice()
        .sort(
          (left: PersistedImportRow, right: PersistedImportRow) =>
            left.sheetName.localeCompare(right.sheetName) || left.rowNumber - right.rowNumber
        )
        .map((row: PersistedImportRow) => ({
          id: row.id,
          sheetName: row.sheetName,
          rowNumber: row.rowNumber,
          entityType: row.entityType as ImportBatchReview["rows"][number]["entityType"],
          status: row.status,
          displayLabel:
            (row.normalizedJson.displayLabel as string | undefined) ??
            (row.normalizedJson.companyName as string | undefined) ??
            (row.normalizedJson.fullName as string | undefined) ??
            row.sourceRowKey,
          rawFields: row.rawJson,
          normalizedFields: row.normalizedJson,
          reviewDecision: row.reviewJson ?? getDefaultReviewDecision()
        }))
    };
  } catch {
    return null;
  }
}

export async function updateImportRow(input: {
  batchId: string;
  rowId: string;
  rawFields: Record<string, string>;
  reviewDecision?: Partial<ImportRowReviewDecision>;
}) {
  const persisted = await readPersistedBatch(input.batchId);
  const targetRow = persisted.rows.find((row: PersistedImportRow) => row.id === input.rowId);

  if (!targetRow) {
    throw new Error("Import row not found.");
  }

  const nextReviewDecision: ImportRowReviewDecision = {
    ...(targetRow.reviewJson ?? getDefaultReviewDecision()),
    ...(input.reviewDecision ?? {})
  };

  if (!hasDatabaseUrl()) {
    const state = getFallbackState();
    state.rows = state.rows.map((row) =>
      row.id === input.rowId
        ? {
            ...row,
            rawJson: input.rawFields,
            status: "staged",
            reviewJson: nextReviewDecision,
            updatedAt: new Date().toISOString()
          }
        : row
    );
  } else {
    const prisma = (await getPrisma()) as any;
    await prisma.importRow.update({
      where: {
        id: input.rowId
      },
      data: {
        rawJson: toJsonValue(input.rawFields),
        status: "staged",
        reviewJson: toJsonValue(nextReviewDecision)
      }
    });
  }

  const refreshed = await readPersistedBatch(input.batchId);
  const lookups = await buildLookupDirectory();
  const existing = (await getExistingDirectory()) as {
    companyNames: Set<string>;
    websiteDomains: Set<string>;
    contactFingerprints: Set<string>;
    emails: Set<string>;
    phones: Set<string>;
  };
  const validation = validateBatchRows({
    rows: refreshed.rows.map(deserializeRow),
    lookups,
    existing,
    reviewDecisions: Object.fromEntries(
      refreshed.rows.map((row: PersistedImportRow) => [
        row.sourceRowKey,
        row.reviewJson ?? getDefaultReviewDecision()
      ])
    )
  });

  const summary = await writeValidationState(input.batchId, {
    rows: validation.rows,
    issues: validation.issues,
    profile: refreshed.batch.summaryJson?.profile ?? buildEmptySummary({
      sheetCount: 0,
      totalDataRows: 0,
      sheets: [],
      risks: []
    }).profile,
    currentSummary: refreshed.batch.summaryJson
  });

  return {
    summary,
    rowStatus:
      validation.rows.find((row) => row.sourceRowKey === targetRow.sourceRowKey)?.status ?? "staged"
  };
}

export async function listImportReviewOptions() {
  const categories = await listAdminListCategories();

  if (!hasDatabaseUrl()) {
    const state = getFallbackState();

    return {
      companies: state.companies.map((company) => ({
        id: company.id,
        label: company.companyName
      })),
      contacts: state.contacts.map((contact) => ({
        id: contact.id,
        label: contact.fullName
      })),
      lookups: Object.fromEntries(
        categories.map((category) => [
          category.key,
          category.values
            .filter((value) => value.isActive)
            .map((value) => ({
              id: value.id,
              key: value.key,
              label: `${value.labelEn} / ${value.labelHe}`
            }))
        ])
      )
    };
  }

  const prisma = (await getPrisma()) as any;
  const [companies, contacts] = await Promise.all([
    prisma.company.findMany({
      orderBy: {companyName: "asc"},
      select: {id: true, companyName: true}
    }),
    prisma.contact.findMany({
      orderBy: {fullName: "asc"},
      select: {id: true, fullName: true}
    })
  ]);

  return {
    companies: companies.map((company: {id: string; companyName: string}) => ({
      id: company.id,
      label: company.companyName
    })),
    contacts: contacts.map((contact: {id: string; fullName: string}) => ({
      id: contact.id,
      label: contact.fullName
    })),
    lookups: Object.fromEntries(
      categories.map((category) => [
        category.key,
        category.values
          .filter((value) => value.isActive)
          .map((value) => ({
            id: value.id,
            key: value.key,
            label: `${value.labelEn} / ${value.labelHe}`
          }))
      ])
    )
  };
}

async function fetchCommitContext() {
  if (!hasDatabaseUrl()) {
    const state = getFallbackState();

    return {
      companies: state.companies,
      contacts: state.contacts
    };
  }

  const prisma = await getPrisma();
  const [companies, contacts] = await Promise.all([
    prisma.company.findMany({select: {id: true, companyName: true, website: true}}),
    prisma.contact.findMany({select: {id: true, fullName: true, companyId: true}})
  ]);

  return {companies, contacts};
}

export async function commitImportBatch(input: {
  batchId: string;
  userId: string;
  allowWarnings: boolean;
}) {
  const persisted = await readPersistedBatch(input.batchId);
  const blockingIssues = persisted.issues.filter(
    (issue: PersistedImportIssue) => issue.severity === "error"
  );
  const unresolvedRows = persisted.rows.filter(
    (row: PersistedImportRow) => row.status === "needs_review"
  );
  const warningIssues = persisted.issues.filter(
    (issue: PersistedImportIssue) => issue.severity === "warning"
  );

  if (blockingIssues.length > 0 || unresolvedRows.length > 0) {
    throw new Error("Resolve blocking import issues before commit.");
  }

  if (warningIssues.length > 0 && !input.allowWarnings) {
    throw new Error("Review warnings before commit and confirm the commit.");
  }

  const context = await fetchCommitContext();
  const companyMap = new Map(
    context.companies.map((company) => [normalizeCompanyName(company.companyName), company.id])
  );
  const contactMap = new Map(
    context.contacts.map((contact) => [normalizePersonName(contact.fullName), contact.id])
  );
  let created = 0;
  let updated = 0;
  let skipped = 0;
  const committedAt = new Date().toISOString();
  const readyRows = persisted.rows
    .filter((candidate: PersistedImportRow) => candidate.status === "ready")
    .slice()
    .sort(
      (left: PersistedImportRow, right: PersistedImportRow) =>
        importCommitPriority(left.entityType) - importCommitPriority(right.entityType) ||
        left.sheetName.localeCompare(right.sheetName) ||
        left.rowNumber - right.rowNumber
    );

  for (const row of readyRows) {
    const normalized = row.normalizedJson;
    const reviewDecision = row.reviewJson ?? getDefaultReviewDecision();
    const companyName = typeof normalized.companyName === "string" ? normalized.companyName : "";
    const fullName = typeof normalized.fullName === "string" ? normalized.fullName : "";

    if (!hasDatabaseUrl()) {
      const state = getFallbackState();

      if (reviewDecision.reviewState === "skipped" || reviewDecision.duplicateDecision === "skip") {
        skipped += 1;
        continue;
      }

      if (row.entityType === "company" && companyName) {
        const normalizedName = normalizeCompanyName(companyName);

        if (
          reviewDecision.duplicateDecision === "attach_existing" &&
          reviewDecision.existingTargetId
        ) {
          updated += 1;
          continue;
        }

        if (companyMap.has(normalizedName)) {
          skipped += 1;
          continue;
        }

        const company: FallbackCompany = {
          id: randomUUID(),
          companyName,
          website: (normalized.website as string | undefined) ?? null,
          notes: (normalized.notes as string | undefined) ?? null
        };
        state.companies.push(company);
        companyMap.set(normalizedName, company.id);
        created += 1;
      } else if (row.entityType === "contact" && fullName) {
        if (
          reviewDecision.duplicateDecision === "attach_existing" &&
          reviewDecision.existingTargetId
        ) {
          updated += 1;
          continue;
        }

        const companyId = companyName ? companyMap.get(normalizeCompanyName(companyName)) ?? null : null;
        const contact: FallbackContact = {
          id: randomUUID(),
          fullName,
          firstName: (normalized.firstName as string | undefined) ?? null,
          lastName: (normalized.lastName as string | undefined) ?? null,
          companyId,
          roleTitle: (normalized.title as string | undefined) ?? null,
          notes: (normalized.notes as string | undefined) ?? null,
          emails: ((normalized.emails as string[] | undefined) ?? []).filter(Boolean),
          phones: ((normalized.phones as string[] | undefined) ?? []).filter(Boolean)
        };
        state.contacts.push(contact);
        contactMap.set(normalizePersonName(fullName), contact.id);
        created += 1;
      } else if (row.entityType === "interaction") {
        const interactionTypeValueId = normalizedLookupId(row, "interaction_type");
        const companyId = companyName ? companyMap.get(normalizeCompanyName(companyName)) ?? null : null;
        const contactId = fullName ? contactMap.get(normalizePersonName(fullName)) ?? null : null;

        if (!interactionTypeValueId || (!companyId && !contactId)) {
          skipped += 1;
          continue;
        }

        state.interactions.push({
          id: randomUUID(),
          companyId,
          contactId,
          interactionDate: String(normalized.primaryDate),
          interactionTypeValueId,
          subject: String(normalized.subject ?? fullName ?? companyName),
          summary: String(normalized.notes ?? "")
        });
        created += 1;
      } else if (row.entityType === "task") {
        const taskTypeValueId = normalizedLookupId(row, "task_type");
        const priorityValueId = normalizedLookupId(row, "task_priority");
        const statusValueId = normalizedLookupId(row, "task_status");
        const companyId = companyName ? companyMap.get(normalizeCompanyName(companyName)) ?? null : null;
        const contactId = fullName ? contactMap.get(normalizePersonName(fullName)) ?? null : null;

        if (!taskTypeValueId || !priorityValueId || !statusValueId || (!companyId && !contactId)) {
          skipped += 1;
          continue;
        }

        state.tasks.push({
          id: randomUUID(),
          companyId,
          contactId,
          dueDate: String(normalized.primaryDate),
          taskTypeValueId,
          priorityValueId,
          statusValueId,
          notes: (normalized.notes as string | undefined) ?? null
        });
        created += 1;
      } else if (row.entityType === "opportunity") {
        const opportunityStageValueId = normalizedLookupId(row, "opportunity_stage");
        const opportunityTypeValueId = normalizedLookupId(row, "opportunity_type");
        const statusValueId = normalizedLookupId(row, "opportunity_status");
        const companyId = companyName ? companyMap.get(normalizeCompanyName(companyName)) ?? null : null;

        if (!companyId || !opportunityStageValueId || !opportunityTypeValueId || !statusValueId) {
          skipped += 1;
          continue;
        }

        state.opportunities.push({
          id: randomUUID(),
          companyId,
          contactId: fullName ? contactMap.get(normalizePersonName(fullName)) ?? null : null,
          opportunityName: String(normalized.taskOrOpportunityName ?? "Imported opportunity"),
          opportunityStageValueId,
          opportunityTypeValueId,
          statusValueId,
          targetCloseDate: (normalized.primaryDate as string | undefined) ?? null,
          notes: (normalized.notes as string | undefined) ?? null
        });
        created += 1;
      } else {
        skipped += 1;
        continue;
      }
    } else {
      const prisma = (await getPrisma()) as any;

      if (reviewDecision.reviewState === "skipped" || reviewDecision.duplicateDecision === "skip") {
        skipped += 1;
        continue;
      }

      if (row.entityType === "company" && companyName) {
        const normalizedName = normalizeCompanyName(companyName);

        if (
          reviewDecision.duplicateDecision === "attach_existing" &&
          reviewDecision.existingTargetId
        ) {
          updated += 1;
          continue;
        }

        if (companyMap.has(normalizedName)) {
          skipped += 1;
          continue;
        }

        const company = await prisma.company.create({
          data: {
            companyName,
            website: (normalized.website as string | undefined) ?? null,
            notes: (normalized.notes as string | undefined) ?? null,
            createdById: input.userId,
            updatedById: input.userId
          }
        });
        companyMap.set(normalizedName, company.id);
        created += 1;
      } else if (row.entityType === "contact" && fullName) {
        if (
          reviewDecision.duplicateDecision === "attach_existing" &&
          reviewDecision.existingTargetId
        ) {
          updated += 1;
          continue;
        }

        const companyId = companyName ? companyMap.get(normalizeCompanyName(companyName)) ?? null : null;
        const contact = await prisma.contact.create({
          data: {
            fullName,
            firstName: (normalized.firstName as string | undefined) ?? null,
            lastName: (normalized.lastName as string | undefined) ?? null,
            companyId,
            roleTitle: (normalized.title as string | undefined) ?? null,
            notes: (normalized.notes as string | undefined) ?? null,
            createdById: input.userId,
            updatedById: input.userId,
            emails: {
              create: ((normalized.emails as string[] | undefined) ?? []).filter(Boolean).map((email, index) => ({
                email,
                isPrimary: index === 0
              }))
            },
            phones: {
              create: ((normalized.phones as string[] | undefined) ?? []).filter(Boolean).map((phone, index) => ({
                phoneNumber: phone,
                isPrimary: index === 0
              }))
            }
          }
        });
        contactMap.set(normalizePersonName(fullName), contact.id);
        created += 1;
      } else if (row.entityType === "interaction") {
        const interactionTypeValueId = normalizedLookupId(row, "interaction_type");
        const companyId = companyName ? companyMap.get(normalizeCompanyName(companyName)) ?? null : null;
        const contactId = fullName ? contactMap.get(normalizePersonName(fullName)) ?? null : null;

        if (!interactionTypeValueId || (!companyId && !contactId)) {
          skipped += 1;
          continue;
        }

        await prisma.interaction.create({
          data: {
            companyId,
            contactId,
            interactionDate: new Date(String(normalized.primaryDate)),
            interactionTypeValueId,
            subject: String(normalized.subject ?? fullName ?? companyName),
            summary: String(normalized.notes ?? ""),
            createdById: input.userId
          }
        });
        created += 1;
      } else if (row.entityType === "task") {
        const taskTypeValueId = normalizedLookupId(row, "task_type");
        const priorityValueId = normalizedLookupId(row, "task_priority");
        const statusValueId = normalizedLookupId(row, "task_status");
        const companyId = companyName ? companyMap.get(normalizeCompanyName(companyName)) ?? null : null;
        const contactId = fullName ? contactMap.get(normalizePersonName(fullName)) ?? null : null;

        if (!taskTypeValueId || !priorityValueId || !statusValueId || (!companyId && !contactId)) {
          skipped += 1;
          continue;
        }

        await prisma.task.create({
          data: {
            companyId,
            contactId,
            dueDate: new Date(String(normalized.primaryDate)),
            taskTypeValueId,
            priorityValueId,
            statusValueId,
            notes: (normalized.notes as string | undefined) ?? null,
            createdById: input.userId
          }
        });
        created += 1;
      } else if (row.entityType === "opportunity") {
        const opportunityStageValueId = normalizedLookupId(row, "opportunity_stage");
        const opportunityTypeValueId = normalizedLookupId(row, "opportunity_type");
        const statusValueId = normalizedLookupId(row, "opportunity_status");
        const companyId = companyName ? companyMap.get(normalizeCompanyName(companyName)) ?? null : null;

        if (!companyId || !opportunityStageValueId || !opportunityTypeValueId || !statusValueId) {
          skipped += 1;
          continue;
        }

        await prisma.opportunity.create({
          data: {
            companyId,
            contactId: fullName ? contactMap.get(normalizePersonName(fullName)) ?? null : null,
            opportunityName: String(normalized.taskOrOpportunityName ?? "Imported opportunity"),
            opportunityStageValueId,
            opportunityTypeValueId,
            statusValueId,
            targetCloseDate: normalized.primaryDate ? new Date(String(normalized.primaryDate)) : null,
            notes: (normalized.notes as string | undefined) ?? null,
            createdById: input.userId
          }
        });
        created += 1;
      } else {
        skipped += 1;
        continue;
      }
    }
  }

  const nextSummary = persisted.batch.summaryJson
    ? {
        ...persisted.batch.summaryJson,
        counts: {
          ...persisted.batch.summaryJson.counts,
          created,
          updated,
          skipped
        },
        lastCommittedAt: committedAt
      }
    : null;

  if (!hasDatabaseUrl()) {
    const state = getFallbackState();
    state.rows = state.rows.map((row) =>
      row.batchId === input.batchId && row.status === "ready"
        ? {
            ...row,
            status: "committed",
            committedAt,
            updatedAt: committedAt
          }
        : row
    );
    state.batches = state.batches.map((batch) =>
      batch.id === input.batchId
        ? {
            ...batch,
            status: "committed",
            completedAt: committedAt,
            summaryJson: nextSummary
          }
        : batch
    );
  } else {
    const prisma = (await getPrisma()) as any;
    await prisma.$transaction([
      prisma.importRow.updateMany({
        where: {
          batchId: input.batchId,
          status: "ready"
        },
        data: {
          status: "committed",
          committedAt: new Date(committedAt)
        }
      }),
      prisma.importBatch.update({
        where: {id: input.batchId},
        data: {
          status: "committed",
          completedAt: new Date(committedAt),
          summaryJson: toJsonValue(nextSummary)
        }
      })
    ]);
  }

  return {
    created,
    updated,
    skipped
  };
}
