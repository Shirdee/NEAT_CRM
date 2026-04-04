"use client";

import {useEffect, useState} from "react";

import type {ImportBatchReview} from "@/lib/import/types";

type RowReviewFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  batchId: string;
  locale: string;
  row: ImportBatchReview["rows"][number];
  issues: ImportBatchReview["issues"];
  options: ImportBatchReview["options"];
  labels: {
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

  return (
    <form
      action={action}
      className="mt-4 space-y-4"
      onChange={() => setIsDirty(true)}
      onSubmit={() => setIsDirty(false)}
    >
      <input name="locale" type="hidden" value={locale} />
      <input name="batchId" type="hidden" value={batchId} />
      <input name="rowId" type="hidden" value={row.id} />
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <label className="space-y-2">
          <span className="block text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
            {labels.rowState}
          </span>
          <select
            className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm"
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
            className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm"
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
            className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm"
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
            className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm"
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
      {((row.normalizedFields.lookupCandidates as Array<{
        categoryKey: string;
        resolvedValueId: string | null;
      }> | undefined) ?? []).length > 0 ? (
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
                className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm"
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
      ) : null}
      <div className="grid gap-3 md:grid-cols-2">
        {Object.entries(row.rawFields).map(([fieldKey, fieldValue]) => (
          <label className="space-y-2" key={`${row.id}-${fieldKey}`}>
            <span className="block text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
              {fieldKey}
            </span>
            <input
              className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm"
              defaultValue={String(fieldValue ?? "")}
              name={`field:${fieldKey}`}
            />
          </label>
        ))}
      </div>
      {isDirty ? (
        <p className="text-xs font-medium text-amber-800">{labels.unsaved}</p>
      ) : null}
      <button
        className="inline-flex rounded-full bg-ink px-4 py-2 text-sm font-medium text-white"
        type="submit"
      >
        {labels.save}
      </button>
      <div className="space-y-2">
        {issues
          .filter((issue) => issue.sheetName === row.sheetName && issue.rowNumber === row.rowNumber)
          .map((issue, index) => (
            <p
              className={`rounded-2xl px-3 py-2 text-xs ${
                issue.severity === "error"
                  ? "bg-rose-100 text-rose-800"
                  : "bg-amber-100 text-amber-900"
              }`}
              key={`${row.id}-issue-${index}`}
            >
              {issue.message}
            </p>
          ))}
      </div>
    </form>
  );
}
