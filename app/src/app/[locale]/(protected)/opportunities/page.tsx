import {getTranslations} from "next-intl/server";

import {Link} from "@/i18n/navigation";
import {canEditRecords, getCurrentSession} from "@/lib/auth/session";
import {getOpportunityFormOptions, listOpportunities} from "@/lib/data/crm";
import {listSavedViews, resolveSavedViewFilters} from "@/lib/data/saved-views";
import {SavedViewBar} from "@/components/ui/saved-view-bar";
import {FilterShell} from "@/components/ui/filter-shell";
import {InfoPair} from "@/components/ui/info-pair";
import {StatusChip} from "@/components/ui/status-chip";
import {SurfaceCard} from "@/components/ui/surface-card";

type OpportunitiesPageProps = {
  params: Promise<{locale: "en" | "he"}>;
  searchParams: Promise<{
    q?: string;
    companyId?: string;
    contactId?: string;
    stage?: string;
    type?: string;
    status?: string;
    view?: string;
    error?: string;
  }>;
};

function displayLabel(locale: "en" | "he", values: {en?: string | null; he?: string | null}) {
  return locale === "he" ? values.he || values.en || "—" : values.en || values.he || "—";
}

function formatMoney(value: unknown) {
  const numeric = Number(String(value ?? "").trim());
  if (!Number.isFinite(numeric)) return "—";
  return new Intl.NumberFormat(undefined, {maximumFractionDigits: 0}).format(numeric);
}

export default async function OpportunitiesPage({params, searchParams}: OpportunitiesPageProps) {
  const {locale} = await params;
  const query = await searchParams;
  const t = await getTranslations("Opportunities");
  const session = await getCurrentSession();
  const savedViews = session
    ? await listSavedViews({userId: session.id, module: "opportunities"})
    : [];
  const savedViewState = await resolveSavedViewFilters({
    module: "opportunities",
    userId: session?.id,
    searchParams: query
  });
  const filters = savedViewState.filters;
  const [{companies, contacts, stageOptions, typeOptions, statusOptions}, opportunities] = await Promise.all([
    getOpportunityFormOptions(),
    listOpportunities({
      query: filters.q,
      companyId: filters.companyId,
      contactId: filters.contactId,
      opportunityStageValueId: filters.stage,
      opportunityTypeValueId: filters.type,
      statusValueId: filters.status
    })
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.3em] text-coral">{t("eyebrow")}</p>
          <h2 className="font-display text-3xl font-semibold tracking-tight text-ink">{t("title")}</h2>
          <p className="max-w-3xl text-sm leading-7 text-slate-600">{t("subtitle")}</p>
        </div>
        {session && canEditRecords(session.role) ? (
          <Link
            className="inline-flex w-full items-center justify-center rounded-full bg-ink px-5 py-3 text-sm font-medium text-white sm:w-auto"
            href="/opportunities/new"
            locale={locale}
          >
            {t("create")}
          </Link>
        ) : null}
      </div>

      {query.error ? (
        <p className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800">{t("errors.generic")}</p>
      ) : null}

      {session ? (
        <SavedViewBar
          activeFilters={filters}
          locale={locale}
          module="opportunities"
          selectedViewId={savedViewState.selectedViewId}
          selectedViewName={savedViewState.selectedView?.name ?? null}
          views={savedViews.map((view) => ({id: view.id, name: view.name}))}
        />
      ) : null}

      <FilterShell>
        <form className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(0,1.2fr)_repeat(4,minmax(0,0.8fr))_auto]">
          <input name="view" type="hidden" value={savedViewState.selectedViewId ?? ""} />
          <input
            className="rounded-[22px] bg-[rgba(244,229,225,0.82)] px-4 py-3 text-slate-700"
            defaultValue={filters.q ?? ""}
            name="q"
            placeholder={t("filters.query")}
          />
          <select
            className="rounded-[22px] bg-[rgba(244,229,225,0.82)] px-4 py-3 text-slate-700"
            defaultValue={filters.companyId ?? ""}
            name="companyId"
          >
            <option value="">{t("filters.allCompanies")}</option>
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.companyName}
              </option>
            ))}
          </select>
          <select
            className="rounded-[22px] bg-[rgba(244,229,225,0.82)] px-4 py-3 text-slate-700"
            defaultValue={filters.contactId ?? ""}
            name="contactId"
          >
            <option value="">{t("filters.allContacts")}</option>
            {contacts.map((contact) => (
              <option key={contact.id} value={contact.id}>
                {contact.fullName}
              </option>
            ))}
          </select>
          <select
            className="rounded-[22px] bg-[rgba(244,229,225,0.82)] px-4 py-3 text-slate-700"
            defaultValue={filters.stage ?? ""}
            name="stage"
          >
            <option value="">{t("filters.allStages")}</option>
            {stageOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {locale === "he" ? option.labelHe : option.labelEn}
              </option>
            ))}
          </select>
          <select
            className="rounded-[22px] bg-[rgba(244,229,225,0.82)] px-4 py-3 text-slate-700"
            defaultValue={filters.status ?? ""}
            name="status"
          >
            <option value="">{t("filters.allStatuses")}</option>
            {statusOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {locale === "he" ? option.labelHe : option.labelEn}
              </option>
            ))}
          </select>
          <select
            className="rounded-[22px] bg-[rgba(244,229,225,0.82)] px-4 py-3 text-slate-700"
            defaultValue={filters.type ?? ""}
            name="type"
          >
            <option value="">{t("filters.allTypes")}</option>
            {typeOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {locale === "he" ? option.labelHe : option.labelEn}
              </option>
            ))}
          </select>
          <button
            className="rounded-full bg-coral px-5 py-3 text-sm font-medium text-white sm:col-span-2 xl:col-span-1"
            type="submit"
          >
            {t("filters.apply")}
          </button>
        </form>
      </FilterShell>

      {opportunities.length === 0 ? (
        <SurfaceCard className="bg-[linear-gradient(180deg,rgba(255,255,255,0.9),rgba(249,235,231,0.92))] p-8 text-sm text-slate-600">
          {t("empty")}
        </SurfaceCard>
      ) : (
        <div className="space-y-4">
          <div className="hidden grid-cols-[minmax(0,1.4fr)_minmax(0,0.9fr)_minmax(0,0.9fr)_140px_140px] gap-4 rounded-[24px] bg-mist px-5 py-4 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 lg:grid">
            <span>{t("columns.opportunity")}</span>
            <span>{t("columns.company")}</span>
            <span>{t("columns.stage")}</span>
            <span>{t("columns.status")}</span>
            <span>{t("columns.value")}</span>
          </div>
          {opportunities.map((opportunity) => (
            <Link
              className="block rounded-[28px] bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(249,235,231,0.84))] p-4 shadow-[0_12px_32px_rgba(58,48,45,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_36px_rgba(58,48,45,0.1)] sm:p-5"
              href={`/opportunities/${opportunity.id}`}
              key={opportunity.id}
              locale={locale}
            >
              <div className="space-y-4 lg:grid lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.9fr)_minmax(0,0.9fr)_140px_140px] lg:items-center lg:gap-4 lg:space-y-0">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-lg font-semibold text-ink">{opportunity.opportunityName}</p>
                      <p className="mt-2 line-clamp-2 text-sm text-slate-600">
                        {opportunity.notes || t("labels.noNotes")}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <StatusChip tone="teal">
                        {displayLabel(locale, {en: opportunity.stageLabelEn, he: opportunity.stageLabelHe})}
                      </StatusChip>
                      <StatusChip>
                        {displayLabel(locale, {en: opportunity.statusLabelEn, he: opportunity.statusLabelHe})}
                      </StatusChip>
                    </div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3 lg:hidden">
                    <InfoPair label={t("columns.company")} value={opportunity.companyName ?? "—"} />
                    <InfoPair
                      label={t("columns.status")}
                      value={displayLabel(locale, {en: opportunity.statusLabelEn, he: opportunity.statusLabelHe})}
                    />
                    <InfoPair
                      label={t("columns.value")}
                      value={<span className="font-semibold text-ink">{formatMoney(opportunity.estimatedValue)}</span>}
                    />
                  </div>
                </div>
                <div className="text-sm text-slate-600">{opportunity.companyName ?? "—"}</div>
                <div className="hidden text-sm text-slate-600 lg:block">
                  {displayLabel(locale, {en: opportunity.stageLabelEn, he: opportunity.stageLabelHe})}
                </div>
                <div className="hidden text-sm text-slate-600 lg:block">
                  {displayLabel(locale, {en: opportunity.statusLabelEn, he: opportunity.statusLabelHe})}
                </div>
                <div className="hidden text-sm font-medium text-ink lg:block">{formatMoney(opportunity.estimatedValue)}</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
