import {getTranslations} from "next-intl/server";

import {Link} from "@/i18n/navigation";
import {canEditRecords, getCurrentSession} from "@/lib/auth/session";
import {getCompanyFormOptions, listCompanies} from "@/lib/data/crm";
import {listSavedViews, resolveSavedViewFilters} from "@/lib/data/saved-views";
import {SavedViewBar} from "@/components/ui/saved-view-bar";
import {LiveFilterForm} from "@/components/ui/live-filter-form";
import {LiveSearchSelect} from "@/components/ui/live-search-select";
import {CompanyTable} from "@/components/ui/company-table";
import {SurfaceCard} from "@/components/ui/surface-card";

type CompaniesPageProps = {
  params: Promise<{locale: "en" | "he"}>;
  searchParams: Promise<{q?: string; source?: string; stage?: string; view?: string; error?: string}>;
};

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
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="font-display text-2xl font-bold text-ink">{t("title")}</h1>
          <span className="rounded-full bg-mist px-3 py-0.5 text-[13px] font-medium text-ink/50">
            {companies.length}
          </span>
        </div>
        {session && canEditRecords(session.role) ? (
          <Link
            className="inline-flex items-center justify-center rounded-full bg-coral px-5 py-2.5 text-[13.5px] font-semibold text-white transition hover:bg-coral/90"
            href="/companies/new"
            locale={locale}
          >
            {t("create")}
          </Link>
        ) : null}
      </div>

      {query.error ? (
        <p className="rounded-2xl bg-amber/10 px-4 py-3 text-sm text-ink">{t("errors.generic")}</p>
      ) : null}

      <SurfaceCard className="space-y-4">
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

        <LiveFilterForm className="flex flex-col gap-3 xl:flex-row xl:flex-wrap xl:items-center">
          <input name="view" type="hidden" value={savedViewState.selectedViewId ?? ""} />
          <input
            className="min-w-[220px] flex-1 rounded-[12px] bg-mist px-4 py-3 text-[13.5px] text-ink/70 placeholder:text-ink/30 focus:outline-none focus:ring-2 focus:ring-teal/20"
            defaultValue={filters.q ?? ""}
            name="q"
            placeholder={t("filters.query")}
          />
          <LiveSearchSelect
            allLabel={t("filters.allSources")}
            name="source"
            options={sourceOptions.map((option) => ({
              id: option.id,
              label: locale === "he" ? option.labelHe : option.labelEn
            }))}
            placeholder={t("filters.allSources")}
            value={filters.source ?? ""}
          />
          <LiveSearchSelect
            allLabel={t("filters.allStages")}
            name="stage"
            options={stageOptions.map((option) => ({
              id: option.id,
              label: locale === "he" ? option.labelHe : option.labelEn
            }))}
            placeholder={t("filters.allStages")}
            value={filters.stage ?? ""}
          />
          <button
            className="rounded-full bg-ink px-5 py-3 text-sm font-medium text-white transition hover:bg-ink/95 xl:ml-auto"
            type="submit"
          >
            {t("filters.apply")}
          </button>
        </LiveFilterForm>
      </SurfaceCard>

      <SurfaceCard className="overflow-hidden p-0">
        {companies.length === 0 ? (
          <div className="px-5 py-6 text-sm text-ink/60">{t("empty")}</div>
        ) : (
          <CompanyTable
            companies={companies}
            labels={{
              company: t("columns.company"),
              contacts: t("columns.contacts"),
              copyLink: t("actions.copyLink"),
              edit: t("actions.edit"),
              export: t("actions.export"),
              open: t("actions.open"),
              source: t("columns.source"),
              stage: t("columns.stage"),
              website: t("columns.website"),
              empty: t("empty")
            }}
            locale={locale}
          />
        )}
      </SurfaceCard>
    </div>
  );
}
