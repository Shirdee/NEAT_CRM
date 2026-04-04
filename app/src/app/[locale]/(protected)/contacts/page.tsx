import {getTranslations} from "next-intl/server";

import {Link} from "@/i18n/navigation";
import {canEditRecords, getCurrentSession} from "@/lib/auth/session";
import {getContactFormOptions, listContacts} from "@/lib/data/crm";

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
          <h2 className="text-3xl font-semibold text-ink">{t("title")}</h2>
          <p className="max-w-3xl text-sm leading-7 text-slate-600">{t("subtitle")}</p>
        </div>
        {session && canEditRecords(session.role) ? (
          <Link
            className="inline-flex rounded-full bg-ink px-5 py-3 text-sm font-medium text-white"
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

      <form className="grid gap-4 rounded-[24px] border border-slate-200 bg-white p-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_auto]">
        <input
          className="rounded-2xl border border-slate-200 px-4 py-3"
          defaultValue={query.q ?? ""}
          name="q"
          placeholder={t("filters.query")}
        />
        <select
          className="rounded-2xl border border-slate-200 px-4 py-3"
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
          className="rounded-full bg-coral px-5 py-3 text-sm font-medium text-white"
          type="submit"
        >
          {t("filters.apply")}
        </button>
      </form>

      {contacts.length === 0 ? (
        <section className="rounded-[24px] border border-dashed border-slate-300 bg-white p-8 text-sm text-slate-600">
          {t("empty")}
        </section>
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
              className="block rounded-[24px] border border-slate-200 bg-white p-5 transition hover:border-coral/50 hover:shadow-soft"
              href={`/contacts/${contact.id}`}
              key={contact.id}
              locale={locale}
            >
              <div className="grid gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)] lg:items-center">
                <div>
                  <p className="text-lg font-semibold text-ink">{contact.fullName}</p>
                  <p className="mt-2 text-sm text-slate-600">{contact.roleTitle || t("labels.noRole")}</p>
                </div>
                <div className="text-sm text-slate-600">{contact.companyName || t("labels.noCompany")}</div>
                <div className="text-sm text-slate-600">{contact.primaryEmail || "—"}</div>
                <div className="text-sm text-slate-600">{contact.primaryPhone || "—"}</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
