import {getTranslations} from "next-intl/server";

import {Link} from "@/i18n/navigation";
import {canEditRecords, getCurrentSession} from "@/lib/auth/session";
import {getCompanyFormOptions, listCompanies} from "@/lib/data/crm";

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
          <h2 className="text-3xl font-semibold text-ink">{t("title")}</h2>
          <p className="max-w-3xl text-sm leading-7 text-slate-600">{t("subtitle")}</p>
        </div>
        {session && canEditRecords(session.role) ? (
          <Link
            className="inline-flex rounded-full bg-ink px-5 py-3 text-sm font-medium text-white"
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

      <form className="grid gap-4 rounded-[24px] border border-slate-200 bg-white p-5 lg:grid-cols-[minmax(0,1.3fr)_repeat(2,minmax(0,0.8fr))_auto]">
        <input
          className="rounded-2xl border border-slate-200 px-4 py-3"
          defaultValue={query.q ?? ""}
          name="q"
          placeholder={t("filters.query")}
        />
        <select
          className="rounded-2xl border border-slate-200 px-4 py-3"
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
          className="rounded-2xl border border-slate-200 px-4 py-3"
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
          className="rounded-full bg-coral px-5 py-3 text-sm font-medium text-white"
          type="submit"
        >
          {t("filters.apply")}
        </button>
      </form>

      {companies.length === 0 ? (
        <section className="rounded-[24px] border border-dashed border-slate-300 bg-white p-8 text-sm text-slate-600">
          {t("empty")}
        </section>
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
              className="block rounded-[24px] border border-slate-200 bg-white p-5 transition hover:border-coral/50 hover:shadow-soft"
              href={`/companies/${company.id}`}
              key={company.id}
              locale={locale}
            >
              <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)_120px_120px] lg:items-center">
                <div>
                  <p className="text-lg font-semibold text-ink">{company.companyName}</p>
                  <p className="mt-2 text-sm text-slate-600 line-clamp-2">{company.notes || t("labels.noNotes")}</p>
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
