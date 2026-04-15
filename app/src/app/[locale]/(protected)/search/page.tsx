import {getTranslations} from "next-intl/server";

import {Link} from "@/i18n/navigation";
import {searchCrm} from "@/lib/data/crm";

type SearchPageProps = {
  params: Promise<{locale: "en" | "he"}>;
  searchParams: Promise<{q?: string}>;
};

export default async function SearchPage({params, searchParams}: SearchPageProps) {
  const {locale} = await params;
  const {q = ""} = await searchParams;
  const t = await getTranslations("Search");
  const results = await searchCrm(q);

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h2 className="text-3xl font-semibold text-ink">{t("title")}</h2>
        <p className="max-w-3xl text-sm leading-7 text-ink/70">{t("subtitle")}</p>
      </div>

      <form action={`/${locale}/search`} className="rounded-[24px] border border-mist bg-white p-5">
        <input
          className="w-full rounded-2xl border border-mist px-4 py-3"
          defaultValue={q}
          name="q"
          placeholder={t("placeholder")}
        />
      </form>

      {!q.trim() ? (
        <section className="rounded-[24px] border border-dashed border-ink/10 bg-white p-8 text-sm text-ink/70">
          {t("empty")}
        </section>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <section className="rounded-[24px] border border-mist bg-white p-5">
            <h3 className="text-lg font-semibold text-ink">{t("companiesTitle")}</h3>
            <div className="mt-4 space-y-3">
              {results.companies.length === 0 ? (
                <p className="text-sm text-ink/70">{t("noCompanies")}</p>
              ) : (
                results.companies.map((company) => (
                  <Link
                    className="block rounded-[18px] bg-mist p-4"
                    href={`/companies/${company.id}`}
                    key={company.id}
                    locale={locale}
                  >
                    <p className="font-medium text-ink">{company.companyName}</p>
                    <p className="mt-2 text-sm text-ink/70">{company.website || company.notes || "—"}</p>
                  </Link>
                ))
              )}
            </div>
          </section>
          <section className="rounded-[24px] border border-mist bg-white p-5">
            <h3 className="text-lg font-semibold text-ink">{t("contactsTitle")}</h3>
            <div className="mt-4 space-y-3">
              {results.contacts.length === 0 ? (
                <p className="text-sm text-ink/70">{t("noContacts")}</p>
              ) : (
                results.contacts.map((contact) => (
                  <Link
                    className="block rounded-[18px] bg-mist p-4"
                    href={`/contacts/${contact.id}`}
                    key={contact.id}
                    locale={locale}
                  >
                    <p className="font-medium text-ink">{contact.fullName}</p>
                    <p className="mt-2 text-sm text-ink/70">
                      {[contact.companyName, contact.primaryEmail, contact.primaryPhone]
                        .filter(Boolean)
                        .join(" • ") || "—"}
                    </p>
                  </Link>
                ))
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
