import {getTranslations} from "next-intl/server";

import {Link} from "@/i18n/navigation";
import {canEditRecords, getCurrentSession} from "@/lib/auth/session";
import {getCompanyFormOptions, listCompanies} from "@/lib/data/crm";
import {listSavedViews, resolveSavedViewFilters} from "@/lib/data/saved-views";
import {SavedViewBar} from "@/components/ui/saved-view-bar";
import {LiveFilterForm} from "@/components/ui/live-filter-form";
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
    <div className="flex flex-col gap-5 px-4 py-4 lg:px-8 lg:py-7">
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
          <select
            className="rounded-[12px] bg-mist px-4 py-3 text-[13px] text-ink/70 focus:outline-none focus:ring-2 focus:ring-teal/20"
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
            className="rounded-[12px] bg-mist px-4 py-3 text-[13px] text-ink/70 focus:outline-none focus:ring-2 focus:ring-teal/20"
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
          <table className="w-full border-separate border-spacing-0">
            <thead>
              <tr className="bg-mist">
                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.07em] text-ink/50">
                  {t("columns.company")}
                </th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.07em] text-ink/50">
                  {t("columns.website")}
                </th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.07em] text-ink/50">
                  {t("columns.stage")}
                </th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.07em] text-ink/50">
                  {t("columns.source")}
                </th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.07em] text-ink/50">
                  {t("columns.contacts")}
                </th>
              </tr>
            </thead>
            <tbody>
              {companies.map((company) => (
                <tr
                  className="group transition-colors hover:bg-sand/70 [&:not(:last-child)]:shadow-[inset_0_-1px_0_rgba(16,36,63,0.04)]"
                  key={company.id}
                >
                  <td className="px-5 py-0 align-middle">
                    <Link
                      className="flex min-h-[52px] items-center gap-2.5 py-3 text-[13.5px] font-semibold text-ink transition group-hover:text-coral"
                      href={`/companies/${company.id}`}
                      locale={locale}
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal/12 font-display text-[13px] font-bold text-teal">
                        {company.companyName[0]?.toUpperCase() || "C"}
                      </span>
                      <span className="truncate">{company.companyName}</span>
                    </Link>
                  </td>
                  <td className="px-5 py-0 align-middle text-sm text-ink/60">
                    <div className="min-h-[52px] py-3">{company.website || "—"}</div>
                  </td>
                  <td className="px-5 py-0 align-middle text-sm text-ink/60">
                    <div className="min-h-[52px] py-3">
                      <StatusChip tone="teal">
                        {displayLabel(locale, {
                          en: company.stageLabelEn,
                          he: company.stageLabelHe
                        })}
                      </StatusChip>
                    </div>
                  </td>
                  <td className="px-5 py-0 align-middle text-sm text-ink/60">
                    <div className="min-h-[52px] py-3">
                      {displayLabel(locale, {
                        en: company.sourceLabelEn,
                        he: company.sourceLabelHe
                      })}
                    </div>
                  </td>
                  <td className="px-5 py-0 align-middle text-sm text-ink/60">
                    <div className="min-h-[52px] py-3 font-medium text-ink">
                      {company.contactsCount}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </SurfaceCard>
    </div>
  );
}
