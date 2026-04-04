import {getTranslations} from "next-intl/server";
import {redirect} from "next/navigation";

import {Link} from "@/i18n/navigation";
import {canManageAdminLists, getCurrentSession} from "@/lib/auth/session";
import {getImportBatchReview, listImportBatches} from "@/lib/import/repository";

import {commitImportBatchAction, updateImportRowAction} from "./actions";
import {RowReviewForm} from "./row-review-form";
import {ImportUploadPanel} from "./upload-panel";

type AdminImportsPageProps = {
  params: Promise<{locale: string}>;
  searchParams: Promise<{batch?: string; error?: string; success?: string}>;
};

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
  const warningCount =
    selectedBatch?.issues.filter((issue) => issue.severity === "warning").length ?? 0;
  const errorCount =
    selectedBatch?.issues.filter((issue) => issue.severity === "error").length ?? 0;

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h2 className="text-3xl font-semibold text-ink">{t("title")}</h2>
        <p className="max-w-3xl text-sm leading-7 text-slate-600">{t("subtitle")}</p>
      </div>
      {error ? (
        <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {decodeURIComponent(error)}
        </p>
      ) : null}
      {success ? (
        <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {success === "updated" ? t("messages.updated") : t("messages.committed")}
        </p>
      ) : null}
      <section className="grid gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
        <div>
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
        </div>
        <div className="space-y-6">
          {selectedBatch ? (
            <>
              <article className="rounded-[24px] border border-slate-200 bg-white p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-ink">{selectedBatch.sourceFilename}</h3>
                    <p className="mt-2 text-sm text-slate-600">{t("review.statusLabel", {status: selectedBatch.status})}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs font-medium">
                    <span className="rounded-full bg-mist px-3 py-1 text-ink">
                      {t("review.counts.total", {
                        count: selectedBatch.summary?.counts.totalRows ?? 0
                      })}
                    </span>
                    <span className="rounded-full bg-amber-100 px-3 py-1 text-amber-900">
                      {t("review.counts.warnings", {count: warningCount})}
                    </span>
                    <span className="rounded-full bg-rose-100 px-3 py-1 text-rose-800">
                      {t("review.counts.errors", {count: errorCount})}
                    </span>
                  </div>
                </div>
                <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  {selectedBatch.summary?.profile.sheets.map((sheet) => (
                    <div className="rounded-[20px] bg-slate-50 p-4" key={sheet.name}>
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
              </article>
              <article className="rounded-[24px] border border-slate-200 bg-white p-5">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-ink">{t("review.commitTitle")}</h3>
                    <p className="mt-2 text-sm text-slate-600">{t("review.commitBody")}</p>
                  </div>
                  <form action={commitImportBatchAction} className="space-y-3 rounded-[20px] bg-mist p-4">
                    <input name="locale" type="hidden" value={locale} />
                    <input name="batchId" type="hidden" value={selectedBatch.id} />
                    <label className="flex items-center gap-2 text-sm text-slate-700">
                      <input name="allowWarnings" type="checkbox" value="1" />
                      {t("review.allowWarnings")}
                    </label>
                    <button
                      className="inline-flex rounded-full bg-ink px-4 py-2 text-sm font-medium text-white"
                      type="submit"
                    >
                      {t("review.commit")}
                    </button>
                  </form>
                </div>
              </article>
              <article className="rounded-[24px] border border-slate-200 bg-white p-5">
                <h3 className="text-lg font-semibold text-ink">{t("review.issuesTitle")}</h3>
                <div className="mt-4 space-y-3">
                  {selectedBatch.issues.length === 0 ? (
                    <p className="text-sm text-emerald-700">{t("review.noIssues")}</p>
                  ) : (
                    selectedBatch.issues.map((issue, index) => (
                      <div className="rounded-[20px] border border-slate-200 bg-slate-50 p-4" key={`${issue.issueCode}-${index}`}>
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-medium ${
                              issue.severity === "error"
                                ? "bg-rose-100 text-rose-800"
                                : issue.severity === "warning"
                                  ? "bg-amber-100 text-amber-900"
                                  : "bg-mist text-ink"
                            }`}
                          >
                            {issue.severity}
                          </span>
                          <span className="text-xs uppercase tracking-[0.2em] text-slate-500">
                            {issue.sheetName} #{issue.rowNumber ?? "-"}
                          </span>
                        </div>
                        <p className="mt-3 text-sm font-medium text-ink">{issue.message}</p>
                        {issue.rawValue ? (
                          <p className="mt-1 break-all text-xs text-slate-500">{issue.rawValue}</p>
                        ) : null}
                      </div>
                    ))
                  )}
                </div>
              </article>
              <article className="rounded-[24px] border border-slate-200 bg-white p-5">
                <h3 className="text-lg font-semibold text-ink">{t("review.rowsTitle")}</h3>
                <div className="mt-4 space-y-3">
                  {selectedBatch.rows.slice(0, 25).map((row) => (
                    <div className="rounded-[20px] border border-slate-200 bg-slate-50 p-4" key={row.id}>
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-ink">{row.displayLabel}</p>
                          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                            {row.entityType} • {row.sheetName} #{row.rowNumber}
                          </p>
                        </div>
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700">
                          {row.status}
                        </span>
                      </div>
                      <div className="mt-4 space-y-2">
                        {selectedBatch.issues
                          .filter(
                            (issue) =>
                              issue.sheetName === row.sheetName && issue.rowNumber === row.rowNumber
                          )
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
                      <RowReviewForm
                        action={updateImportRowAction}
                        batchId={selectedBatch.id}
                        issues={selectedBatch.issues}
                        labels={{
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
              </article>
            </>
          ) : (
            <article className="rounded-[24px] border border-slate-200 bg-white p-5 text-sm text-slate-600">
              {t("review.empty")}
            </article>
          )}
        </div>
      </section>
      <div className="flex flex-wrap gap-3">
        <Link
          className="inline-flex rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700"
          href="/admin/lists"
          locale={locale}
        >
          {t("backToAdminLists")}
        </Link>
        <Link
          className="inline-flex rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700"
          href="/dashboard"
          locale={locale}
        >
          {t("backToDashboard")}
        </Link>
      </div>
    </div>
  );
}
