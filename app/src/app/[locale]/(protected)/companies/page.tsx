import {getTranslations} from "next-intl/server";

import {Link} from "@/i18n/navigation";
import {canEditRecords, getCurrentSession} from "@/lib/auth/session";
import {getCompanyFormOptions, listCompanies} from "@/lib/data/crm";
import {listSavedViews, resolveSavedViewFilters} from "@/lib/data/saved-views";
import {SavedViewBar} from "@/components/ui/saved-view-bar";
import {FilterShell} from "@/components/ui/filter-shell";
import {InfoPair} from "@/components/ui/info-pair";
import {StatusChip} from "@/components/ui/status-chip";
import {SurfaceCard} from "@/components/ui/surface-card";

type CompaniesPageProps = {
  params: Promise<{locale: "en" | "he"}>;
  searchParams: Promise<{q?: string; source?: string; stage?: string; view?: string; error?: string}>;
};

function displayLabel(
  locale: "en" | "he",
  values: {en?: string | null; he?: string | null}
) {
  return locale === "he" ? values.he || values.en || "—" : values.en || values.he || "—";
}

export default async function CompaniesPage({params, searchParams}: CompaniesPageProps) {
  const {locale} = await params;
  const query = await searchParams;
  const t = await getTranslations("Companies");
  const session = await getCurrentSession();
  const {sourceOptions, stageOptions} = await getCompanyFormOptions();
  const savedViews = session
    ? await listSavedViews({userId: session.id, module: "companies"})
    : [];
  const savedViewState = await resolveSavedViewFilters({
    module: "companies",
    userId: session?.id,
    searchParams: query
  });
  const filters = savedViewState.filters;
  const companies = await listCompanies({
    query: filters.q,
    sourceValueId: filters.source,
    stageValueId: filters.stage
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.3em] text-coral">{t("columns.company")}</p>
          <h2 className="font-display text-3xl font-semibold tracking-tight text-ink">{t("title")}</h2>
          <p className="max-w-3xl text-sm leading-7 text-slate-600">{t("subtitle")}</p>
        </div>
        {session && canEditRecords(session.role) ? (
          <Link
            className="inline-flex w-full items-center justify-center rounded-full bg-ink px-5 py-3 text-sm font-medium text-white sm:w-auto"
            href="/companies/new"
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
          module="companies"
          selectedViewId={savedViewState.selectedViewId}
          selectedViewName={savedViewState.selectedView?.name ?? null}
          views={savedViews.map((view) => ({id: view.id, name: view.name}))}
        />
      ) : null}

      <FilterShell>
        <form className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(0,1.3fr)_repeat(2,minmax(0,0.8fr))_auto]">
          <input name="view" type="hidden" value={savedViewState.selectedViewId ?? ""} />
          <input
            className="rounded-[22px] bg-[rgba(244,229,225,0.82)] px-4 py-3 text-slate-700"
            defaultValue={filters.q ?? ""}
            name="q"
            placeholder={t("filters.query")}
          />
          <select
            className="rounded-[22px] bg-[rgba(244,229,225,0.82)] px-4 py-3 text-slate-700"
            defaultValue={filters.source ?? ""}
            name="source"
          >
            <option value="">{t("filters.allSources")}</option>
            {sourceOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {locale === "he" ? option.labelHe : option.labelEn}
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
          <button
            className="rounded-full bg-coral px-5 py-3 text-sm font-medium text-white sm:col-span-2 xl:col-span-1"
            type="submit"
          >
            {t("filters.apply")}
          </button>
        </form>
      </FilterShell>

      {companies.length === 0 ? (
        <SurfaceCard className="bg-[linear-gradient(180deg,rgba(255,255,255,0.9),rgba(249,235,231,0.92))] p-8 text-sm text-slate-600">
          {t("empty")}
        </SurfaceCard>
      ) : (
        <div className="space-y-4">
          <div className="hidden grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)_120px_120px] gap-4 rounded-[24px] bg-mist px-5 py-4 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 lg:grid">
            <span>{t("columns.company")}</span>
            <span>{t("columns.website")}</span>
            <span>{t("columns.stage")}</span>
            <span>{t("columns.source")}</span>
            <span>{t("columns.contacts")}</span>
          </div>
          {companies.map((company) => (
            <Link
              className="block rounded-[28px] bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(249,235,231,0.84))] p-4 shadow-[0_12px_32px_rgba(58,48,45,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_36px_rgba(58,48,45,0.1)] sm:p-5"
              href={`/companies/${company.id}`}
              key={company.id}
              locale={locale}
            >
              <div className="space-y-4 lg:grid lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)_120px_120px] lg:items-center lg:gap-4 lg:space-y-0">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-lg font-semibold text-ink">{company.companyName}</p>
                      <p className="mt-2 line-clamp-2 text-sm text-slate-600">
                        {company.notes || t("labels.noNotes")}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <StatusChip tone="teal">
                        {displayLabel(locale, {
                          en: company.stageLabelEn,
                          he: company.stageLabelHe
                        })}
                      </StatusChip>
                      <StatusChip>{`${t("columns.contacts")}: ${company.contactsCount}`}</StatusChip>
                    </div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3 lg:hidden">
                    <InfoPair
                      label={t("columns.website")}
                      value={company.website || "—"}
                    />
                    <InfoPair
                      label={t("columns.source")}
                      value={displayLabel(locale, {
                        en: company.sourceLabelEn,
                        he: company.sourceLabelHe
                      })}
                    />
                    <InfoPair
                      label={t("columns.contacts")}
                      value={<span className="font-semibold text-ink">{company.contactsCount}</span>}
                    />
                  </div>
                </div>
                <div className="text-sm text-slate-600">{company.website || "—"}</div>
                <div className="hidden text-sm text-slate-600 lg:block">
                  {displayLabel(locale, {
                    en: company.stageLabelEn,
                    he: company.stageLabelHe
                  })}
                </div>
                <div className="hidden text-sm text-slate-600 lg:block">
                  {displayLabel(locale, {
                    en: company.sourceLabelEn,
                    he: company.sourceLabelHe
                  })}
                </div>
                <div className="hidden text-sm font-medium text-ink lg:block">{company.contactsCount}</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
