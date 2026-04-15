import {getTranslations} from "next-intl/server";

import {Link} from "@/i18n/navigation";
import {canEditRecords, getCurrentSession} from "@/lib/auth/session";
import {getContactFormOptions, listContacts} from "@/lib/data/crm";
import {FilterShell} from "@/components/ui/filter-shell";
import {InfoPair} from "@/components/ui/info-pair";
import {LiveFilterForm} from "@/components/ui/live-filter-form";
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
          <p className="max-w-3xl text-sm leading-7 text-ink/70">{t("subtitle")}</p>
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
        <p className="rounded-2xl bg-amber/10 px-4 py-3 text-sm text-ink">{t("errors.generic")}</p>
      ) : null}

      <FilterShell>
        <LiveFilterForm className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_auto]">
          <input
            className="rounded bg-mist px-4 py-3 text-ink/70"
            defaultValue={query.q ?? ""}
            name="q"
            placeholder={t("filters.query")}
          />
          <select
            className="rounded bg-mist px-4 py-3 text-ink/70"
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
        </LiveFilterForm>
      </FilterShell>

      {contacts.length === 0 ? (
        <SurfaceCard className="bg-white/95 p-5 text-sm text-ink/70">
          {t("empty")}
        </SurfaceCard>
      ) : (
        <div className="space-y-4">
          <div className="hidden grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)] gap-4 rounded bg-mist px-3 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-ink/50 lg:grid">
            <span>{t("columns.contact")}</span>
            <span>{t("columns.company")}</span>
            <span>{t("columns.email")}</span>
            <span>{t("columns.phone")}</span>
          </div>
          <div className="space-y-2">
            {contacts.map((contact) => (
              <Link
                className="block rounded-[18px] bg-white px-4 py-3.5 shadow-[0_1px_0_rgba(16,36,63,0.04)] transition hover:bg-mist hover:shadow-soft"
                href={`/contacts/${contact.id}`}
                key={contact.id}
                locale={locale}
              >
                <div className="space-y-4 lg:grid lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)] lg:items-center lg:gap-4 lg:space-y-0">
                  <div className="space-y-3">
                    <p className="text-lg font-semibold text-ink">{contact.fullName}</p>
                    <p className="mt-2 text-sm text-ink/70">{contact.roleTitle || t("labels.noRole")}</p>
                    <div className="grid gap-3 sm:grid-cols-3 lg:hidden">
                      <InfoPair
                        label={t("columns.company")}
                        value={contact.companyName || t("labels.noCompany")}
                      />
                      <InfoPair label={t("columns.email")} value={contact.primaryEmail || "—"} />
                      <InfoPair label={t("columns.phone")} value={contact.primaryPhone || "—"} />
                    </div>
                  </div>
                  <div className="hidden text-sm text-ink/70 lg:block">
                    {contact.companyName || t("labels.noCompany")}
                  </div>
                  <div className="hidden text-sm text-ink/70 lg:block">{contact.primaryEmail || "—"}</div>
                  <div className="hidden text-sm text-ink/70 lg:block">{contact.primaryPhone || "—"}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
