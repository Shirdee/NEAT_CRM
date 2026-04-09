import {getTranslations} from "next-intl/server";

import {Link} from "@/i18n/navigation";
import {canEditRecords, getCurrentSession} from "@/lib/auth/session";
import {getCompanyFormOptions, listCompanies} from "@/lib/data/crm";
import {FilterShell} from "@/components/ui/filter-shell";
import {InfoPair} from "@/components/ui/info-pair";
import {StatusChip} from "@/components/ui/status-chip";
import {SurfaceCard} from "@/components/ui/surface-card";

type CompaniesPageProps = {
  params: Promise<{locale: "en" | "he"}>;
  searchParams: Promise<{q?: string; source?: string; stage?: string; error?: string}>;
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
  const companies = await listCompanies({
    query: query.q,
    sourceValueId: query.source,
    stageValueId: query.stage
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

      <FilterShell>
        <form className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(0,1.3fr)_repeat(2,minmax(0,0.8fr))_auto]">
          <input
            className="rounded-[22px] border border-slate-200 bg-slate-50/70 px-4 py-3"
            defaultValue={query.q ?? ""}
            name="q"
            placeholder={t("filters.query")}
          />
          <select
            className="rounded-[22px] border border-slate-200 bg-slate-50/70 px-4 py-3"
            defaultValue={query.source ?? ""}
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
            className="rounded-[22px] border border-slate-200 bg-slate-50/70 px-4 py-3"
            defaultValue={query.stage ?? ""}
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
        <SurfaceCard className="border-dashed border-slate-300 p-8 text-sm text-slate-600">
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
              className="block rounded-[26px] border border-slate-200 bg-white p-4 transition hover:border-coral/50 hover:shadow-soft sm:p-5"
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
                    <div className="flex flex-wrap gap-2 lg:hidden">
                      <StatusChip tone="teal">
                        {displayLabel(locale, {
                          en: company.stageLabelEn,
                          he: company.stageLabelHe
                        })}
                      </StatusChip>
                      <StatusChip>{company.contactsCount}</StatusChip>
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
                <div className="text-sm text-slate-600">
                  {displayLabel(locale, {
                    en: company.stageLabelEn,
                    he: company.stageLabelHe
                  })}
                </div>
                <div className="text-sm text-slate-600">
                  {displayLabel(locale, {
                    en: company.sourceLabelEn,
                    he: company.sourceLabelHe
                  })}
                </div>
                <div className="text-sm font-medium text-ink">{company.contactsCount}</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
