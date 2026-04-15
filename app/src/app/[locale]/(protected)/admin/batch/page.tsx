import {getTranslations} from "next-intl/server";
import {redirect} from "next/navigation";

import {Link} from "@/i18n/navigation";
import {StatusChip} from "@/components/ui/status-chip";
import {SurfaceCard} from "@/components/ui/surface-card";
import {canManageAdminLists, getCurrentSession} from "@/lib/auth/session";
import {listCompanies, listLookupOptions, listOpportunities, listTasks} from "@/lib/data/crm";
import {BATCH_EDIT_FIELDS, type BatchEditEntity} from "@/lib/data/maintenance";

import {applyBatchEditAction} from "./actions";

type AdminBatchPageProps = {
  params: Promise<{locale: string}>;
  searchParams: Promise<{entity?: string; q?: string; error?: string; success?: string}>;
};

function isBatchEntity(value: string | undefined): value is BatchEditEntity {
  return value === "companies" || value === "tasks" || value === "opportunities";
}

export default async function AdminBatchPage({params, searchParams}: AdminBatchPageProps) {
  const {locale} = await params;
  const {entity: entityParam, q: query = "", error, success} = await searchParams;
  const t = await getTranslations("AdminBatch");
  const session = await getCurrentSession();

  if (!session || !canManageAdminLists(session.role)) {
    redirect(`/${locale}/access-denied`);
  }

  const entity = isBatchEntity(entityParam) ? entityParam : "companies";
  const fieldConfigs = BATCH_EDIT_FIELDS[entity];

  const [companyRecords, taskRecords, opportunityRecords, lookupGroups] = await Promise.all([
    listCompanies({query: entity === "companies" ? query || undefined : undefined}),
    listTasks({query: entity === "tasks" ? query || undefined : undefined}),
    listOpportunities({query: entity === "opportunities" ? query || undefined : undefined}),
    Promise.all(
      fieldConfigs.map(async (config) => ({
        ...config,
        options: await listLookupOptions(config.categoryKey)
      }))
    )
  ]);

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <p className="text-xs uppercase tracking-[0.3em] text-coral">{t("eyebrow")}</p>
        <h2 className="font-display text-3xl font-semibold tracking-tight text-ink">{t("title")}</h2>
        <p className="max-w-3xl text-sm leading-7 text-ink/70">{t("subtitle")}</p>
      </div>

      {error ? (
        <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{decodeURIComponent(error)}</p>
      ) : null}
      {success ? (
        <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {t("messages.updated", {
            count:
              Number(success) ||
              (entity === "companies"
                ? companyRecords.length
                : entity === "tasks"
                  ? taskRecords.length
                  : opportunityRecords.length)
          })}
        </p>
      ) : null}

      <SurfaceCard className="space-y-5">
        <form className="grid gap-4 md:grid-cols-[minmax(0,220px)_minmax(0,1fr)_auto]" method="get">
          <input name="entity" type="hidden" value={entity} />
          <label className="space-y-2">
            <span className="text-xs uppercase tracking-[0.2em] text-ink/40">{t("filters.entity")}</span>
            <select
              className="w-full rounded-2xl border border-mist bg-white px-4 py-3 text-sm"
              defaultValue={entity}
              name="entity"
            >
              {(["companies", "tasks", "opportunities"] as const).map((option) => (
                <option key={option} value={option}>
                  {t(`entities.${option}`)}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-2">
            <span className="text-xs uppercase tracking-[0.2em] text-ink/40">{t("filters.query")}</span>
            <input
              className="w-full rounded-2xl border border-mist bg-white px-4 py-3 text-sm"
              defaultValue={query}
              name="q"
              placeholder={t("filters.queryPlaceholder")}
            />
          </label>
          <button
            className="h-fit rounded-full bg-ink px-4 py-3 text-sm font-medium text-white"
            type="submit"
          >
            {t("filters.apply")}
          </button>
        </form>
      </SurfaceCard>

      <form action={applyBatchEditAction} className="space-y-6">
        <input name="locale" type="hidden" value={locale} />
        <input name="q" type="hidden" value={query} />

        <SurfaceCard className="space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-coral">{t("records.eyebrow")}</p>
              <h3 className="mt-2 text-lg font-semibold text-ink">{t("records.title")}</h3>
              <p className="mt-2 text-sm text-ink/70">{t("records.body")}</p>
            </div>
            <StatusChip
              tone="ink"
            >
              {t("records.count", {
                count:
                  entity === "companies"
                    ? companyRecords.length
                    : entity === "tasks"
                      ? taskRecords.length
                      : opportunityRecords.length
              })}
            </StatusChip>
          </div>
          {entity === "companies" ? (
            companyRecords.length === 0 ? (
              <p className="rounded-[24px] bg-mist px-4 py-4 text-sm text-ink/70">
                {t("records.empty")}
              </p>
            ) : (
              <div className="grid gap-4 lg:grid-cols-2">
                {companyRecords.map((record) => (
                  <label
                    className="flex cursor-pointer gap-3 rounded-[24px] border border-mist bg-mist/70 p-4"
                    key={record.id}
                  >
                    <input className="mt-1 h-4 w-4" name="ids" type="checkbox" value={record.id} />
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold text-ink">{record.companyName}</p>
                          <p className="text-xs text-ink/40">
                            {record.website ?? t("records.noWebsite")}
                          </p>
                        </div>
                        <StatusChip tone="teal">{record.contactsCount} contacts</StatusChip>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {record.sourceLabelEn ? <StatusChip tone="coral">{record.sourceLabelEn}</StatusChip> : null}
                        {record.stageLabelEn ? <StatusChip tone="amber">{record.stageLabelEn}</StatusChip> : null}
                      </div>
                      <p className="text-sm text-ink/70">{record.notes ?? t("records.noNotes")}</p>
                    </div>
                  </label>
                ))}
              </div>
            )
          ) : entity === "tasks" ? (
            taskRecords.length === 0 ? (
              <p className="rounded-[24px] bg-mist px-4 py-4 text-sm text-ink/70">
                {t("records.empty")}
              </p>
            ) : (
              <div className="grid gap-4 lg:grid-cols-2">
                {taskRecords.map((record) => (
                  <label
                    className="flex cursor-pointer gap-3 rounded-[24px] border border-mist bg-mist/70 p-4"
                    key={record.id}
                  >
                    <input className="mt-1 h-4 w-4" name="ids" type="checkbox" value={record.id} />
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold text-ink">{record.notes ?? t("records.noNotes")}</p>
                          <p className="text-xs text-ink/40">
                            {record.companyName ?? t("records.noCompany")}
                            {record.contactName ? ` · ${record.contactName}` : ""}
                          </p>
                        </div>
                        <StatusChip tone={record.statusValueId ? "ink" : "default"}>
                          {record.statusLabelEn ?? record.statusValueId}
                        </StatusChip>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {record.taskTypeLabelEn ? <StatusChip tone="coral">{record.taskTypeLabelEn}</StatusChip> : null}
                        {record.priorityLabelEn ? <StatusChip tone="amber">{record.priorityLabelEn}</StatusChip> : null}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            )
          ) : opportunityRecords.length === 0 ? (
            <p className="rounded-[24px] bg-mist px-4 py-4 text-sm text-ink/70">
              {t("records.empty")}
            </p>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {opportunityRecords.map((record) => (
                <label
                  className="flex cursor-pointer gap-3 rounded-[24px] border border-mist bg-mist/70 p-4"
                  key={record.id}
                >
                  <input className="mt-1 h-4 w-4" name="ids" type="checkbox" value={record.id} />
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-ink">{record.opportunityName}</p>
                        <p className="text-xs text-ink/40">
                          {record.companyName}
                          {record.contactName ? ` · ${record.contactName}` : ""}
                        </p>
                      </div>
                      <StatusChip tone="ink">{record.statusLabelEn ?? record.statusValueId}</StatusChip>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {record.stageLabelEn ? <StatusChip tone="coral">{record.stageLabelEn}</StatusChip> : null}
                      {record.typeLabelEn ? <StatusChip tone="amber">{record.typeLabelEn}</StatusChip> : null}
                    </div>
                    <p className="text-sm text-ink/70">{record.notes ?? t("records.noNotes")}</p>
                  </div>
                </label>
              ))}
            </div>
          )}
        </SurfaceCard>

        <SurfaceCard className="space-y-5">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-coral">{t("action.eyebrow")}</p>
            <h3 className="mt-2 text-lg font-semibold text-ink">{t("action.title")}</h3>
            <p className="mt-2 text-sm text-ink/70">{t("action.body")}</p>
          </div>

          <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
            <label className="space-y-2">
              <span className="text-xs uppercase tracking-[0.2em] text-ink/40">{t("action.field")}</span>
              <select
                className="w-full rounded-2xl border border-mist bg-white px-4 py-3 text-sm"
                defaultValue={fieldConfigs[0]?.field}
                name="field"
              >
                {fieldConfigs.map((config) => (
                  <option key={config.field} value={config.field}>
                    {t(`fields.${config.field}`)}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-2">
              <span className="text-xs uppercase tracking-[0.2em] text-ink/40">{t("action.value")}</span>
              <select
                className="w-full rounded-2xl border border-mist bg-white px-4 py-3 text-sm"
                name="valueId"
                defaultValue=""
              >
                <option value="">{t("action.valuePlaceholder")}</option>
                {lookupGroups.map((group) => (
                  <optgroup key={group.field} label={t(`fields.${group.field}`)}>
                    {group.options.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.labelEn}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </label>
          </div>

          <label className="flex items-center gap-3 rounded-[24px] bg-mist px-4 py-4 text-sm text-ink/70">
            <input name="confirm" type="checkbox" value="1" />
            {t("action.confirm")}
          </label>

          <button className="rounded-full bg-ink px-5 py-3 text-sm font-medium text-white" type="submit">
            {t("action.submit")}
          </button>
        </SurfaceCard>
      </form>

      <div className="flex flex-wrap gap-3">
        <Link className="rounded-full border border-ink/10 px-4 py-2 text-sm font-medium text-ink/70" href="/admin/lists" locale={locale}>
          {t("backToAdmin")}
        </Link>
        <Link className="rounded-full border border-ink/10 px-4 py-2 text-sm font-medium text-ink/70" href="/dashboard" locale={locale}>
          {t("backToDashboard")}
        </Link>
      </div>
    </div>
  );
}
