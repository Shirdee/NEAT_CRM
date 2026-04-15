import {getTranslations} from "next-intl/server";
import {redirect} from "next/navigation";

import {Link} from "@/i18n/navigation";
import {StatusChip} from "@/components/ui/status-chip";
import {SurfaceCard} from "@/components/ui/surface-card";
import {canManageAdminLists, getCurrentSession} from "@/lib/auth/session";
import {getImportBatchReview, listImportBatches} from "@/lib/import/repository";
import type {ImportBatchListItem} from "@/lib/import/types";

import {commitImportBatchAction, updateImportRowAction} from "./actions";
import {RowReviewForm} from "./row-review-form";
import {ImportUploadPanel} from "./upload-panel";

type AdminImportsPageProps = {
  params: Promise<{locale: string}>;
  searchParams: Promise<{batch?: string; error?: string; success?: string}>;
};

function toneForSeverity(severity: "info" | "warning" | "error") {
  if (severity === "error") return "coral" as const;
  if (severity === "warning") return "amber" as const;
  return "teal" as const;
}

function toneForRowStatus(status: string) {
  if (status === "ready" || status === "committed") return "teal" as const;
  if (status === "flagged" || status === "needs_review") return "amber" as const;
  if (status === "skipped") return "default" as const;
  return "ink" as const;
}

function toneForReviewDecision(reviewState: string) {
  if (reviewState === "ready") return "teal" as const;
  if (reviewState === "skipped") return "default" as const;
  return "amber" as const;
}

function toneForDuplicateDecision(duplicateDecision: string) {
  if (duplicateDecision === "attach_existing") return "ink" as const;
  if (duplicateDecision === "keep_new") return "teal" as const;
  if (duplicateDecision === "skip") return "default" as const;
  return "amber" as const;
}

function getBatchSourceLabel(sourceFilename: string, locale: string) {
  const normalized = sourceFilename.toLowerCase();

  if (
    normalized.includes("website") ||
    normalized.includes("web-form") ||
    normalized.includes("webform") ||
    normalized.includes("lead-form")
  ) {
    return locale === "he" ? "טופס אתר" : "Website form";
  }

  return locale === "he" ? "ייבוא מובנה" : "Structured import";
}

export default async function AdminImportsPage({
  params,
  searchParams
}: AdminImportsPageProps) {
  const {locale} = await params;
  const {batch, error, success} = await searchParams;
  const t = await getTranslations("AdminImports");
  const session = await getCurrentSession();

  if (!session || !canManageAdminLists(session.role)) {
    redirect(`/${locale}/access-denied`);
  }

  const batches = await listImportBatches();
  const selectedBatchId = batch ?? batches[0]?.id ?? null;
  const selectedBatch = selectedBatchId ? await getImportBatchReview(selectedBatchId) : null;
  const localeTag = locale === "he" ? "he-IL" : "en-US";
  const dateTimeFormatter = new Intl.DateTimeFormat(localeTag, {
    dateStyle: "medium",
    timeStyle: "short"
  });

  const warningCount =
    selectedBatch?.issues.filter((issue) => issue.severity === "warning").length ?? 0;
  const errorCount =
    selectedBatch?.issues.filter((issue) => issue.severity === "error").length ?? 0;
  const infoCount =
    selectedBatch?.issues.filter((issue) => issue.severity === "info").length ?? 0;
  const reviewStateCounts = selectedBatch
    ? selectedBatch.rows.reduce(
        (accumulator, row) => {
          if (row.status === "committed") {
            accumulator.committed += 1;
          } else if (row.reviewDecision.reviewState === "ready") {
            accumulator.ready += 1;
          } else if (row.reviewDecision.reviewState === "skipped") {
            accumulator.skipped += 1;
          } else {
            accumulator.review += 1;
          }

          return accumulator;
        },
        {review: 0, ready: 0, skipped: 0, committed: 0}
      )
    : {review: 0, ready: 0, skipped: 0, committed: 0};
  const duplicateDecisionCounts = selectedBatch
    ? selectedBatch.rows.reduce(
        (accumulator, row) => {
          accumulator[row.reviewDecision.duplicateDecision] += 1;
          return accumulator;
        },
        {
          auto: 0,
          keep_new: 0,
          attach_existing: 0,
          skip: 0
        }
      )
    : {auto: 0, keep_new: 0, attach_existing: 0, skip: 0};
  const commitBlocked =
    errorCount > 0 || selectedBatch?.rows.some((row) => row.status === "needs_review") || false;
  const commitConfirmToken = selectedBatch ? `COMMIT ${selectedBatch.id.slice(0, 8)}` : "";
  const errorMessage =
    error === "commit-confirmation-required"
      ? t("messages.commitConfirmationRequired")
      : error
        ? decodeURIComponent(error)
        : null;

  const issueGroups = selectedBatch
    ? {
        error: selectedBatch.issues.filter((issue) => issue.severity === "error"),
        warning: selectedBatch.issues.filter((issue) => issue.severity === "warning"),
        info: selectedBatch.issues.filter((issue) => issue.severity === "info")
      }
    : null;

  const summaryCards = selectedBatch
    ? [
        {
          key: "total",
          label: t("review.counts.total", {
            count: selectedBatch.summary?.counts.totalRows ?? selectedBatch.rows.length
          }),
          value: String(selectedBatch.summary?.counts.totalRows ?? selectedBatch.rows.length)
        },
        {
          key: "errors",
          label: t("review.counts.errors", {count: errorCount}),
          value: String(errorCount)
        },
        {
          key: "warnings",
          label: t("review.counts.warnings", {count: warningCount}),
          value: String(warningCount)
        },
        {
          key: "ready",
          label: locale === "he" ? "שורות מוכנות" : "Ready rows",
          value: String(selectedBatch.summary?.counts.readyRows ?? 0)
        }
      ]
    : [];

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <p className="text-xs uppercase tracking-[0.3em] text-coral">
          {locale === "he" ? "סקירת ניהול" : "Admin review"}
        </p>
        <h2 className="font-display text-3xl font-semibold tracking-tight text-ink">{t("title")}</h2>
        <p className="max-w-3xl text-sm leading-7 text-slate-600">{t("subtitle")}</p>
      </div>

      {errorMessage ? (
        <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {errorMessage}
        </p>
      ) : null}
      {success ? (
        <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {success === "updated" ? t("messages.updated") : t("messages.committed")}
        </p>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
        <div className="space-y-6">
          <ImportUploadPanel
            body={t("upload.body")}
            errorLabel={t("upload.error")}
            locale={locale}
            sampleLabel={t("upload.sample")}
            selectFileLabel={t("upload.selectFile")}
            stagingLabel={t("upload.staging")}
            startImportLabel={t("upload.submit")}
            successLabel={t("upload.success")}
            title={t("upload.title")}
          />

          <SurfaceCard className="space-y-4 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(249,235,231,0.88))]">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">{t("history.title")}</p>
              <h3 className="text-lg font-semibold text-ink">{t("history.count", {count: batches.length})}</h3>
            </div>
            {batches.length === 0 ? (
              <p className="text-sm text-slate-600">{t("history.empty")}</p>
            ) : (
              <div className="space-y-3">
                {batches.map((item: ImportBatchListItem) => {
                  const isActive = item.id === selectedBatchId;

                  return (
                    <Link
                      className={`block rounded-[24px] px-4 py-4 transition ${
                        isActive
                          ? "bg-ink text-white shadow-[0_12px_32px_rgba(16,36,63,0.18)]"
                          : "bg-[rgba(244,229,225,0.72)] text-slate-700 hover:bg-[rgba(244,229,225,0.95)]"
                      }`}
                      href={`/admin/imports?batch=${item.id}`}
                      key={item.id}
                      locale={locale}
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-3">
                          <p className="line-clamp-2 text-sm font-semibold">{item.sourceFilename}</p>
                          <StatusChip tone={isActive ? "default" : "ink"}>{item.status}</StatusChip>
                        </div>
                        <p className={`text-xs ${isActive ? "text-white/70" : "text-slate-500"}`}>
                          {dateTimeFormatter.format(new Date(item.startedAt))}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </SurfaceCard>
        </div>

        <div className="space-y-6">
          {selectedBatch ? (
            <>
              <SurfaceCard className="space-y-6 bg-[linear-gradient(180deg,rgba(255,255,255,0.97),rgba(249,235,231,0.9))]">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-coral">
                      {locale === "he" ? "אצווה פעילה" : "Active batch"}
                    </p>
                    <h3 className="mt-2 text-xl font-semibold text-ink">{selectedBatch.sourceFilename}</h3>
                    <p className="mt-2 text-sm text-slate-600">
                      {t("review.statusLabel", {status: selectedBatch.status})}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <StatusChip tone="ink">{getBatchSourceLabel(selectedBatch.sourceFilename, locale)}</StatusChip>
                      <StatusChip>{locale === "he" ? "סקירה נדרשת לפני commit" : "Review-gated commit"}</StatusChip>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <StatusChip tone="ink">{selectedBatch.status}</StatusChip>
                    <StatusChip tone="coral">{t("review.counts.errors", {count: errorCount})}</StatusChip>
                    <StatusChip tone="amber">{t("review.counts.warnings", {count: warningCount})}</StatusChip>
                    <StatusChip tone="teal">
                      {locale === "he" ? `${infoCount} מידע` : `${infoCount} info`}
                    </StatusChip>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  {summaryCards.map((card) => (
                    <div className="rounded-[24px] bg-[rgba(244,229,225,0.78)] px-4 py-4" key={card.key}>
                      <p className="text-xs uppercase tracking-[0.24em] text-slate-500">{card.label}</p>
                      <p className="mt-3 text-2xl font-semibold text-ink">{card.value}</p>
                    </div>
                  ))}
                </div>

                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-[24px] bg-[rgba(255,255,255,0.72)] p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{t("review.states.review")}</p>
                    <p className="mt-2 text-2xl font-semibold text-ink">{reviewStateCounts.review}</p>
                  </div>
                  <div className="rounded-[24px] bg-[rgba(255,255,255,0.72)] p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{t("review.states.ready")}</p>
                    <p className="mt-2 text-2xl font-semibold text-ink">{reviewStateCounts.ready}</p>
                  </div>
                  <div className="rounded-[24px] bg-[rgba(255,255,255,0.72)] p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{t("review.states.skipped")}</p>
                    <p className="mt-2 text-2xl font-semibold text-ink">{reviewStateCounts.skipped}</p>
                  </div>
                  <div className="rounded-[24px] bg-[rgba(255,255,255,0.72)] p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{t("review.states.committed")}</p>
                    <p className="mt-2 text-2xl font-semibold text-ink">{reviewStateCounts.committed}</p>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  {selectedBatch.summary?.profile.sheets.map((sheet) => (
                    <div className="rounded-[24px] bg-[rgba(255,255,255,0.72)] p-4" key={sheet.name}>
                      <p className="text-sm font-semibold text-ink">{sheet.name}</p>
                      <p className="mt-2 text-xs uppercase tracking-[0.2em] text-slate-500">
                        {sheet.guessedEntityType}
                      </p>
                      <p className="mt-2 text-sm text-slate-600">
                        {t("review.sheetRows", {count: sheet.rowCount})}
                      </p>
                      <p className="text-sm text-slate-600">
                        {t("review.sheetColumns", {count: sheet.columnCount})}
                      </p>
                    </div>
                  ))}
                </div>
              </SurfaceCard>

              <SurfaceCard className="space-y-5 bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(254,241,237,0.92))]">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-ink">{t("review.commitTitle")}</h3>
                    <p className="mt-2 text-sm text-slate-600">{t("review.commitBody")}</p>
                    <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                      <div className="rounded-[20px] bg-white/80 px-4 py-3">
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{t("review.sourceLabel")}</p>
                        <p className="mt-2 text-sm font-medium text-ink">
                          {getBatchSourceLabel(selectedBatch.sourceFilename, locale)}
                        </p>
                      </div>
                      <div className="rounded-[20px] bg-white/80 px-4 py-3">
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{t("review.states.review")}</p>
                        <p className="mt-2 text-sm font-medium text-ink">{reviewStateCounts.review}</p>
                      </div>
                      <div className="rounded-[20px] bg-white/80 px-4 py-3">
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{t("review.decisions.attachExisting")}</p>
                        <p className="mt-2 text-sm font-medium text-ink">{duplicateDecisionCounts.attach_existing}</p>
                      </div>
                      <div className="rounded-[20px] bg-white/80 px-4 py-3">
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{t("review.commitReadyLabel")}</p>
                        <p className="mt-2 text-sm font-medium text-ink">
                          {commitBlocked ? t("review.commitBlocked") : t("review.commitReady")}
                        </p>
                      </div>
                    </div>
                    <p className="mt-4 text-xs text-slate-500">
                      {t("review.commitConfirmHint", {token: commitConfirmToken})}
                    </p>
                  </div>
                  <form
                    action={commitImportBatchAction}
                    className="space-y-3 rounded-[24px] bg-[rgba(244,229,225,0.78)] p-4"
                  >
                    <input name="locale" type="hidden" value={locale} />
                    <input name="batchId" type="hidden" value={selectedBatch.id} />
                    <input name="confirmToken" type="hidden" value={commitConfirmToken} />
                    <label className="flex items-center gap-2 text-sm text-slate-700">
                      <input name="allowWarnings" type="checkbox" value="1" />
                      {t("review.allowWarnings")}
                    </label>
                    <label className="space-y-2">
                      <span className="block text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
                        {t("review.commitConfirmLabel")}
                      </span>
                      <input
                        className="w-full rounded-[20px] bg-white/90 px-3 py-2 text-sm"
                        name="commitConfirmation"
                        placeholder={commitConfirmToken}
                      />
                    </label>
                    <button
                      className="inline-flex rounded-full bg-ink px-4 py-2 text-sm font-medium text-white"
                      type="submit"
                    >
                      {t("review.commit")}
                    </button>
                  </form>
                </div>
              </SurfaceCard>

              <SurfaceCard className="space-y-5">
                <div>
                  <h3 className="text-lg font-semibold text-ink">{t("review.issuesTitle")}</h3>
                  <p className="mt-2 text-sm text-slate-600">
                    {locale === "he"
                      ? "פתרו קודם שגיאות חוסמות, אחר כך עברו על אזהרות וקלט הקשר."
                      : "Resolve blocking errors first, then work through warnings and context issues."}
                  </p>
                </div>
                {selectedBatch.issues.length === 0 ? (
                  <p className="text-sm text-emerald-700">{t("review.noIssues")}</p>
                ) : (
                  <div className="grid gap-4 xl:grid-cols-3">
                    {(["error", "warning", "info"] as const).map((severity) => (
                      <div
                        className="space-y-3 rounded-[24px] bg-[rgba(244,229,225,0.55)] p-4"
                        key={severity}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-semibold text-ink">{severity}</p>
                          <StatusChip tone={toneForSeverity(severity)}>
                            {issueGroups?.[severity].length ?? 0}
                          </StatusChip>
                        </div>
                        {issueGroups?.[severity].length ? (
                          issueGroups[severity].map((issue, index) => (
                            <div
                              className="rounded-[20px] bg-white/80 px-3 py-3"
                              key={`${severity}-${issue.issueCode}-${index}`}
                            >
                              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                                {issue.sheetName} #{issue.rowNumber ?? "-"}
                              </p>
                              <p className="mt-2 text-sm font-medium text-ink">{issue.message}</p>
                              {issue.rawValue ? (
                                <p className="mt-2 break-all text-xs text-slate-500">{issue.rawValue}</p>
                              ) : null}
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-slate-500">
                            {locale === "he" ? "אין פריטים בקטגוריה זו." : "No items in this severity."}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </SurfaceCard>

              <SurfaceCard className="space-y-5">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-ink">{t("review.rowsTitle")}</h3>
                    <p className="mt-2 text-sm text-slate-600">
                      {locale === "he"
                        ? "עברו על שורות עם בעיות, השוו ערכים גולמיים מול ערכים מנורמלים, ועדכנו החלטת סקירה."
                        : "Review staged rows, compare raw values with normalized output, and update the review decision."}
                    </p>
                  </div>
                  <StatusChip tone="ink">
                    {locale === "he"
                      ? `מציג ${Math.min(selectedBatch.rows.length, 25)} מתוך ${selectedBatch.rows.length}`
                      : `Showing ${Math.min(selectedBatch.rows.length, 25)} of ${selectedBatch.rows.length}`}
                  </StatusChip>
                </div>
                <div className="space-y-4">
                  {selectedBatch.rows.slice(0, 25).map((row) => (
                    <div
                      className="rounded-[26px] bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(249,235,231,0.82))] p-4 shadow-[0_12px_32px_rgba(58,48,45,0.06)] sm:p-5"
                      key={row.id}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="space-y-2">
                          <p className="text-base font-semibold text-ink">{row.displayLabel}</p>
                          <div className="flex flex-wrap gap-2">
                            <StatusChip tone={toneForRowStatus(row.status)}>{row.status}</StatusChip>
                            <StatusChip>{row.entityType}</StatusChip>
                            <StatusChip>{`${row.sheetName} #${row.rowNumber}`}</StatusChip>
                            <StatusChip tone={toneForReviewDecision(row.reviewDecision.reviewState)}>
                              {row.reviewDecision.reviewState}
                            </StatusChip>
                            <StatusChip tone={toneForDuplicateDecision(row.reviewDecision.duplicateDecision)}>
                              {row.reviewDecision.duplicateDecision}
                            </StatusChip>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {selectedBatch.issues
                            .filter(
                              (issue) =>
                                issue.sheetName === row.sheetName && issue.rowNumber === row.rowNumber
                            )
                            .slice(0, 3)
                            .map((issue, index) => (
                              <StatusChip key={`${row.id}-chip-${index}`} tone={toneForSeverity(issue.severity)}>
                                {issue.severity}
                              </StatusChip>
                            ))}
                        </div>
                      </div>
                      <RowReviewForm
                        action={updateImportRowAction}
                        batchId={selectedBatch.id}
                        issues={selectedBatch.issues}
                        labels={{
                          stagedSource: t("review.sourceLabel"),
                          reviewDecision: t("review.reviewDecisionLabel"),
                          duplicatePath: t("review.duplicatePathLabel"),
                          duplicateTarget: t("review.duplicateTargetLabel"),
                          createNew: t("review.createNew"),
                          rowReference: t("review.rowReference"),
                          rowState: t("review.controls.rowState"),
                          entityOverride: t("review.controls.entityOverride"),
                          duplicateDecision: t("review.controls.duplicateDecision"),
                          attachExisting: t("review.controls.attachExisting"),
                          auto: t("review.controls.auto"),
                          none: t("review.controls.none"),
                          review: t("review.states.review"),
                          ready: t("review.states.ready"),
                          skipped: t("review.states.skipped"),
                          autoDecision: t("review.decisions.auto"),
                          keepNew: t("review.decisions.keepNew"),
                          attachExistingDecision: t("review.decisions.attachExisting"),
                          skipDecision: t("review.decisions.skip"),
                          save: t("review.updateRow"),
                          unsaved: t("review.unsaved")
                        }}
                        locale={locale}
                        options={selectedBatch.options}
                        row={row}
                      />
                    </div>
                  ))}
                </div>
              </SurfaceCard>
            </>
          ) : (
            <SurfaceCard className="text-sm text-slate-600">{t("review.empty")}</SurfaceCard>
          )}
        </div>
      </section>

      <div className="flex flex-wrap gap-3">
        <Link
          className="inline-flex rounded-full bg-[rgba(244,229,225,0.9)] px-4 py-2 text-sm font-medium text-slate-700"
          href="/admin/lists"
          locale={locale}
        >
          {t("backToAdminLists")}
        </Link>
        <Link
          className="inline-flex rounded-full bg-[rgba(244,229,225,0.9)] px-4 py-2 text-sm font-medium text-slate-700"
          href="/dashboard"
          locale={locale}
        >
          {t("backToDashboard")}
        </Link>
      </div>
    </div>
  );
}
