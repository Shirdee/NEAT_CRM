"use client";

import {useEffect, useState} from "react";

import {StatusChip} from "@/components/ui/status-chip";
import type {ImportBatchReview} from "@/lib/import/types";

type RowReviewFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  batchId: string;
  locale: string;
  row: ImportBatchReview["rows"][number];
  issues: ImportBatchReview["issues"];
  options: ImportBatchReview["options"];
  labels: {
    stagedSource: string;
    reviewDecision: string;
    duplicatePath: string;
    duplicateTarget: string;
    createNew: string;
    rowReference: string;
    rowState: string;
    entityOverride: string;
    duplicateDecision: string;
    attachExisting: string;
    auto: string;
    none: string;
    review: string;
    ready: string;
    skipped: string;
    autoDecision: string;
    keepNew: string;
    attachExistingDecision: string;
    skipDecision: string;
    save: string;
    unsaved: string;
  };
};

function formatFieldValue(value: unknown) {
  if (value == null || value === "") {
    return "—";
  }

  if (Array.isArray(value)) {
    return value.length ? value.join(", ") : "—";
  }

  if (typeof value === "object") {
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }

  return String(value);
}

export function RowReviewForm({
  action,
  batchId,
  locale,
  row,
  issues,
  options,
  labels
}: RowReviewFormProps) {
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (!isDirty) {
      return;
    }

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isDirty]);

  const attachOptions =
    row.entityType === "company"
      ? options.companies
      : row.entityType === "contact"
        ? options.contacts
        : [];
  const rowIssues = issues.filter(
    (issue) => issue.sheetName === row.sheetName && issue.rowNumber === row.rowNumber
  );
  const normalizedEntries = Object.entries(row.normalizedFields).filter(
    ([key]) => key !== "lookupCandidates"
  );
  const duplicateDecisionLabel =
    row.reviewDecision.duplicateDecision === "keep_new"
      ? labels.keepNew
      : row.reviewDecision.duplicateDecision === "attach_existing"
        ? labels.attachExistingDecision
        : row.reviewDecision.duplicateDecision === "skip"
          ? labels.skipDecision
          : labels.autoDecision;
  const duplicateTargetLabel =
    row.reviewDecision.existingTargetLabel ??
    attachOptions.find((option) => option.id === row.reviewDecision.existingTargetId)?.label ??
    labels.createNew;

  return (
    <form
      action={action}
      className="mt-5 space-y-5"
      onChange={() => setIsDirty(true)}
      onSubmit={() => setIsDirty(false)}
    >
      <input name="locale" type="hidden" value={locale} />
      <input name="batchId" type="hidden" value={batchId} />
      <input name="rowId" type="hidden" value={row.id} />

      {rowIssues.length ? (
        <div className="flex flex-wrap gap-2">
          {rowIssues.map((issue, index) => (
            <StatusChip
              key={`${row.id}-issue-${index}`}
              tone={issue.severity === "error" ? "coral" : issue.severity === "warning" ? "amber" : "teal"}
            >
              {issue.message}
            </StatusChip>
          ))}
        </div>
      ) : null}

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-[20px] bg-[rgba(244,229,225,0.45)] px-4 py-3">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{labels.stagedSource}</p>
          <p className="mt-2 text-sm font-medium text-ink">{row.sheetName}</p>
        </div>
        <div className="rounded-[20px] bg-[rgba(244,229,225,0.45)] px-4 py-3">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{labels.reviewDecision}</p>
          <p className="mt-2 text-sm font-medium text-ink">
            {row.reviewDecision.reviewState === "ready"
              ? labels.ready
              : row.reviewDecision.reviewState === "skipped"
                ? labels.skipped
                : labels.review}
          </p>
        </div>
        <div className="rounded-[20px] bg-[rgba(244,229,225,0.45)] px-4 py-3">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{labels.duplicatePath}</p>
          <p className="mt-2 text-sm font-medium text-ink">{duplicateDecisionLabel}</p>
        </div>
        <div className="rounded-[20px] bg-[rgba(244,229,225,0.45)] px-4 py-3">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{labels.duplicateTarget}</p>
          <p className="mt-2 text-sm font-medium text-ink">{duplicateTargetLabel}</p>
          <p className="mt-1 text-xs text-slate-500">{`${labels.rowReference} ${row.rowNumber}`}</p>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <label className="space-y-2">
          <span className="block text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
            {labels.rowState}
          </span>
          <select
            className="w-full rounded-[20px] bg-[rgba(244,229,225,0.82)] px-3 py-2 text-sm"
            defaultValue={row.reviewDecision.reviewState}
            name="reviewState"
          >
            <option value="review">{labels.review}</option>
            <option value="ready">{labels.ready}</option>
            <option value="skipped">{labels.skipped}</option>
          </select>
        </label>

        <label className="space-y-2">
          <span className="block text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
            {labels.entityOverride}
          </span>
          <select
            className="w-full rounded-[20px] bg-[rgba(244,229,225,0.82)] px-3 py-2 text-sm"
            defaultValue={row.reviewDecision.entityOverride ?? ""}
            name="entityOverride"
          >
            <option value="">{labels.auto}</option>
            <option value="company">company</option>
            <option value="contact">contact</option>
            <option value="interaction">interaction</option>
            <option value="task">task</option>
            <option value="opportunity">opportunity</option>
          </select>
        </label>

        <label className="space-y-2">
          <span className="block text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
            {labels.duplicateDecision}
          </span>
          <select
            className="w-full rounded-[20px] bg-[rgba(244,229,225,0.82)] px-3 py-2 text-sm"
            defaultValue={row.reviewDecision.duplicateDecision}
            name="duplicateDecision"
          >
            <option value="auto">{labels.autoDecision}</option>
            <option value="keep_new">{labels.keepNew}</option>
            <option value="attach_existing">{labels.attachExistingDecision}</option>
            <option value="skip">{labels.skipDecision}</option>
          </select>
        </label>

        <label className="space-y-2">
          <span className="block text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
            {labels.attachExisting}
          </span>
          <select
            className="w-full rounded-[20px] bg-[rgba(244,229,225,0.82)] px-3 py-2 text-sm"
            defaultValue={row.reviewDecision.existingTargetId ?? ""}
            name="existingTargetId"
          >
            <option value="">{labels.none}</option>
            {attachOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
          <input
            name="existingTargetLabel"
            type="hidden"
            value={row.reviewDecision.existingTargetLabel ?? ""}
          />
        </label>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <div className="space-y-3 rounded-[24px] bg-[rgba(244,229,225,0.55)] p-4">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
              {locale === "he" ? "ערכי מקור" : "Raw values"}
            </p>
            <p className="mt-2 text-sm text-slate-600">
              {locale === "he"
                ? "עדכנו ערכים גולמיים כשצריך לפני בדיקה חוזרת."
                : "Edit raw values only when the staged source needs correction."}
            </p>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {Object.entries(row.rawFields).map(([fieldKey, fieldValue]) => (
              <label className="space-y-2" key={`${row.id}-${fieldKey}`}>
                <span className="block text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
                  {fieldKey}
                </span>
                <input
                  className="w-full rounded-[20px] bg-white/90 px-3 py-2 text-sm"
                  defaultValue={String(fieldValue ?? "")}
                  name={`field:${fieldKey}`}
                />
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-3 rounded-[24px] bg-[rgba(223,247,241,0.45)] p-4">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
              {locale === "he" ? "פלט מנורמל" : "Normalized output"}
            </p>
            <p className="mt-2 text-sm text-slate-600">
              {locale === "he"
                ? "כך השורה תתפרש כרגע לפי כללי הנרמול והסקירה."
                : "This is the current interpretation after normalization and review rules."}
            </p>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {normalizedEntries.length ? (
              normalizedEntries.map(([fieldKey, fieldValue]) => (
                <div className="rounded-[20px] bg-white/85 px-3 py-3" key={`${row.id}-${fieldKey}-normalized`}>
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
                    {fieldKey}
                  </p>
                  <p className="mt-2 break-words text-sm text-slate-700">
                    {formatFieldValue(fieldValue)}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">
                {locale === "he" ? "אין ערכים מנורמלים זמינים." : "No normalized values available."}
              </p>
            )}
          </div>
        </div>
      </div>

      {((row.normalizedFields.lookupCandidates as Array<{
        categoryKey: string;
        resolvedValueId: string | null;
      }> | undefined) ?? []).length > 0 ? (
        <div className="space-y-3 rounded-[24px] bg-[rgba(244,229,225,0.55)] p-4">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
              {locale === "he" ? "דריסות רשימות" : "Lookup overrides"}
            </p>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {((row.normalizedFields.lookupCandidates as Array<{
              categoryKey: string;
              resolvedValueId: string | null;
            }> | undefined) ?? []).map((candidate) => (
              <label className="space-y-2" key={`${row.id}-lookup-${candidate.categoryKey}`}>
                <span className="block text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
                  {candidate.categoryKey}
                </span>
                <select
                  className="w-full rounded-[20px] bg-white/90 px-3 py-2 text-sm"
                  defaultValue={
                    row.reviewDecision.lookupOverrides[candidate.categoryKey] ??
                    candidate.resolvedValueId ??
                    ""
                  }
                  name={`lookup:${candidate.categoryKey}`}
                >
                  <option value="">{labels.auto}</option>
                  {(options.lookups[candidate.categoryKey] ?? []).map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>
        </div>
      ) : null}

      {isDirty ? (
        <p className="text-xs font-medium text-amber-800">{labels.unsaved}</p>
      ) : null}

      <button
        className="inline-flex rounded-full bg-ink px-4 py-2 text-sm font-medium text-white"
        type="submit"
      >
        {labels.save}
      </button>
    </form>
  );
}
