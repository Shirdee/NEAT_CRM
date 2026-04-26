import {getTranslations} from "next-intl/server";

import {Link} from "@/i18n/navigation";
import {canEditRecords, getCurrentSession} from "@/lib/auth/session";
import {getContactFormOptions, listContacts} from "@/lib/data/crm";
import {buildCrmExportHref} from "@/lib/export/crm-export";
import {LiveFilterForm} from "@/components/ui/live-filter-form";
import {LiveSearchSelect} from "@/components/ui/live-search-select";
import {SurfaceCard} from "@/components/ui/surface-card";

type ContactsPageProps = {
  params: Promise<{locale: "en" | "he"}>;
  searchParams: Promise<{q?: string; companyId?: string; error?: string}>;
};

export default async function ContactsPage({params, searchParams}: ContactsPageProps) {
  const {locale} = await params;
  const query = await searchParams;
  const t = await getTranslations("Contacts");
  const session = await getCurrentSession();
  const [{companies}, contacts] = await Promise.all([
    getContactFormOptions(),
    listContacts({query: query.q, companyId: query.companyId})
  ]);
  const exportFilters = {q: query.q, companyId: query.companyId};
  const exportCsvHref = buildCrmExportHref({
    module: "contacts",
    format: "csv",
    locale,
    filters: exportFilters
  });
  const exportXlsxHref = buildCrmExportHref({
    module: "contacts",
    format: "xlsx",
    locale,
    filters: exportFilters
  });

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="font-display text-2xl font-bold text-ink">{t("title")}</h1>
          <span className="rounded-full bg-mist px-3 py-0.5 text-[13px] font-medium text-ink/50">
            {contacts.length}
          </span>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
          <div className="flex flex-wrap gap-2">
            <a
              className="inline-flex items-center justify-center rounded-full border border-ink/10 bg-white px-4 py-2 text-[13px] font-semibold text-ink transition hover:bg-sand"
              href={exportCsvHref}
            >
              {t("actions.exportCsv")}
            </a>
            <a
              className="inline-flex items-center justify-center rounded-full border border-ink/10 bg-white px-4 py-2 text-[13px] font-semibold text-ink transition hover:bg-sand"
              href={exportXlsxHref}
            >
              {t("actions.exportXlsx")}
            </a>
          </div>
          {session && canEditRecords(session.role) ? (
            <Link
              className="inline-flex items-center justify-center rounded-full bg-coral px-5 py-2.5 text-[13.5px] font-semibold text-white transition hover:bg-coral/90"
              href="/contacts/new"
              locale={locale}
            >
              {t("create")}
            </Link>
          ) : null}
        </div>
      </div>

      {query.error ? (
        <p className="rounded-2xl bg-amber/10 px-4 py-3 text-sm text-ink">{t("errors.generic")}</p>
      ) : null}

      <SurfaceCard className="space-y-4">
        <LiveFilterForm className="flex flex-col gap-3 xl:flex-row xl:flex-wrap xl:items-center">
          <input
            className="min-w-[220px] flex-1 rounded-[12px] bg-mist px-4 py-3 text-[13.5px] text-ink/70 placeholder:text-ink/30 focus:outline-none focus:ring-2 focus:ring-teal/20"
            defaultValue={query.q ?? ""}
            name="q"
            placeholder={t("filters.query")}
          />
          <LiveSearchSelect
            allLabel={t("filters.allCompanies")}
            name="companyId"
            options={companies.map((company) => ({id: company.id, label: company.companyName}))}
            placeholder={t("filters.allCompanies")}
            value={query.companyId ?? ""}
          />
          <button
            className="rounded-full bg-coral px-5 py-2.5 text-[13.5px] font-semibold text-white transition hover:bg-coral/90 xl:ml-auto"
            type="submit"
          >
            {t("filters.apply")}
          </button>
        </LiveFilterForm>
      </SurfaceCard>

      {contacts.length === 0 ? (
        <SurfaceCard className="bg-white p-5 text-sm text-ink/70">{t("empty")}</SurfaceCard>
      ) : (
        <SurfaceCard className="overflow-hidden p-0">
          <div className="space-y-3">
            {contacts.map((contact) => (
              <Link
                className="block px-4 py-4 transition hover:bg-sand/70 sm:px-5 sm:py-5 [&:not(:last-child)]:shadow-[inset_0_-1px_0_rgba(16,36,63,0.04)]"
                href={`/contacts/${contact.id}`}
                key={contact.id}
                locale={locale}
              >
                <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-[13.5px] font-semibold text-ink">{contact.fullName}</p>
                    <p className="text-sm text-ink/60">{contact.roleTitle || t("labels.noRole")}</p>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-ink/60">
                    <span>{contact.companyName || t("labels.noCompany")}</span>
                    <span>{contact.primaryEmail || "—"}</span>
                    <span>{contact.primaryPhone || "—"}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </SurfaceCard>
      )}
    </div>
  );
}
