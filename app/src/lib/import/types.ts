export const importEntityTypes = [
  "company",
  "contact",
  "interaction",
  "task",
  "opportunity",
  "unknown"
] as const;

export type ImportEntityType = (typeof importEntityTypes)[number];

export const importIssueSeverities = ["info", "warning", "error"] as const;

export type ImportIssueSeverity = (typeof importIssueSeverities)[number];

export type WorkbookSheetPayload = {
  name: string;
  rows: string[][];
};

export type WorkbookProfileSheet = {
  name: string;
  guessedEntityType: ImportEntityType;
  headers: string[];
  rowCount: number;
  columnCount: number;
  mixedLanguageCells: number;
  multiValueCells: number;
};

export type WorkbookProfile = {
  sheetCount: number;
  totalDataRows: number;
  sheets: WorkbookProfileSheet[];
  risks: string[];
};

export type StageableImportRow = {
  sheetName: string;
  rowNumber: number;
  headers: string[];
  cells: string[];
};

export type LookupCandidate = {
  categoryKey: string;
  rawValue: string;
  normalizedValue: string;
  resolvedValueId: string | null;
};

export const importRowReviewStates = ["review", "ready", "skipped"] as const;

export type ImportRowReviewState = (typeof importRowReviewStates)[number];

export const duplicateDecisions = ["auto", "keep_new", "attach_existing", "skip"] as const;

export type DuplicateDecision = (typeof duplicateDecisions)[number];

export type ImportRowReviewDecision = {
  reviewState: ImportRowReviewState;
  entityOverride: ImportEntityType | null;
  duplicateDecision: DuplicateDecision;
  existingTargetId: string | null;
  existingTargetLabel: string | null;
  lookupOverrides: Record<string, string | null>;
};

export type NormalizedImportRow = {
  sourceRowKey: string;
  entityType: ImportEntityType;
  status: "ready" | "flagged" | "skipped" | "committed" | "needs_review";
  displayLabel: string;
  companyName: string | null;
  contactName: string | null;
  websiteDomain: string | null;
  primaryDate: string | null;
  rawFields: Record<string, string>;
  normalizedFields: Record<string, unknown>;
  lookupCandidates: LookupCandidate[];
  duplicateFingerprints: string[];
  reviewDecision: ImportRowReviewDecision;
};

export type ImportIssueRecord = {
  entityType: ImportEntityType;
  sheetName: string;
  rowNumber: number | null;
  severity: ImportIssueSeverity;
  issueCode: string;
  rawValue: string | null;
  message: string;
  resolutionStatus: string;
};

export type BatchCounts = {
  totalRows: number;
  readyRows: number;
  flaggedRows: number;
  skippedRows: number;
  created: number;
  updated: number;
  skipped: number;
  flagged: number;
};

export type BatchSummary = {
  profile: WorkbookProfile;
  counts: BatchCounts;
  issueCounts: Record<string, number>;
  entityCounts: Record<string, number>;
  lastStagedAt: string | null;
  lastCommittedAt: string | null;
};

export type ImportBatchListItem = {
  id: string;
  sourceFilename: string;
  status: string;
  startedAt: string;
  completedAt: string | null;
  summary: BatchSummary | null;
};

export type ImportBatchReview = ImportBatchListItem & {
  options: {
    companies: Array<{id: string; label: string}>;
    contacts: Array<{id: string; label: string}>;
    lookups: Record<
      string,
      Array<{
        id: string;
        key: string;
        label: string;
      }>
    >;
  };
  issues: ImportIssueRecord[];
  rows: {
    id: string;
    sheetName: string;
    rowNumber: number;
    entityType: ImportEntityType;
    status: string;
    displayLabel: string;
    rawFields: Record<string, string>;
    normalizedFields: Record<string, unknown>;
    reviewDecision: ImportRowReviewDecision;
  }[];
};
