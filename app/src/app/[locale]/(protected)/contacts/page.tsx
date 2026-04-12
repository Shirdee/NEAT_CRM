import {getTranslations} from "next-intl/server";

import {Link} from "@/i18n/navigation";
import {canEditRecords, getCurrentSession} from "@/lib/auth/session";
import {getContactFormOptions, listContacts} from "@/lib/data/crm";
import {FilterShell} from "@/components/ui/filter-shell";
import {InfoPair} from "@/components/ui/info-pair";
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.3em] text-coral">{t("columns.contact")}</p>
          <h2 className="font-display text-3xl font-semibold tracking-tight text-ink">{t("title")}</h2>
          <p className="max-w-3xl text-sm leading-7 text-slate-600">{t("subtitle")}</p>
        </div>
        {session && canEditRecords(session.role) ? (
          <Link
            className="inline-flex w-full items-center justify-center rounded-full bg-ink px-5 py-3 text-sm font-medium text-white sm:w-auto"
            href="/contacts/new"
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
        <form className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_auto]">
          <input
            className="rounded-[22px] bg-[rgba(244,229,225,0.82)] px-4 py-3 text-slate-700"
            defaultValue={query.q ?? ""}
            name="q"
            placeholder={t("filters.query")}
          />
          <select
            className="rounded-[22px] bg-[rgba(244,229,225,0.82)] px-4 py-3 text-slate-700"
            defaultValue={query.companyId ?? ""}
            name="companyId"
          >
            <option value="">{t("filters.allCompanies")}</option>
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.companyName}
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

      {contacts.length === 0 ? (
        <SurfaceCard className="bg-[linear-gradient(180deg,rgba(255,255,255,0.9),rgba(249,235,231,0.92))] p-8 text-sm text-slate-600">
          {t("empty")}
        </SurfaceCard>
      ) : (
        <div className="space-y-4">
          <div className="hidden grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)] gap-4 rounded-[24px] bg-mist px-5 py-4 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 lg:grid">
            <span>{t("columns.contact")}</span>
            <span>{t("columns.company")}</span>
            <span>{t("columns.email")}</span>
            <span>{t("columns.phone")}</span>
          </div>
          {contacts.map((contact) => (
            <Link
              className="block rounded-[28px] bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(249,235,231,0.84))] p-4 shadow-[0_12px_32px_rgba(58,48,45,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_36px_rgba(58,48,45,0.1)] sm:p-5"
              href={`/contacts/${contact.id}`}
              key={contact.id}
              locale={locale}
            >
              <div className="space-y-4 lg:grid lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)] lg:items-center lg:gap-4 lg:space-y-0">
                <div className="space-y-3">
                  <p className="text-lg font-semibold text-ink">{contact.fullName}</p>
                  <p className="mt-2 text-sm text-slate-600">{contact.roleTitle || t("labels.noRole")}</p>
                  <div className="grid gap-3 sm:grid-cols-3 lg:hidden">
                    <InfoPair label={t("columns.company")} value={contact.companyName || t("labels.noCompany")} />
                    <InfoPair label={t("columns.email")} value={contact.primaryEmail || "—"} />
                    <InfoPair label={t("columns.phone")} value={contact.primaryPhone || "—"} />
                  </div>
                </div>
                <div className="hidden text-sm text-slate-600 lg:block">{contact.companyName || t("labels.noCompany")}</div>
                <div className="hidden text-sm text-slate-600 lg:block">{contact.primaryEmail || "—"}</div>
                <div className="hidden text-sm text-slate-600 lg:block">{contact.primaryPhone || "—"}</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
