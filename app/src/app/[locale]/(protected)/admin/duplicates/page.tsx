import {getTranslations} from "next-intl/server";
import {redirect} from "next/navigation";

import {Link} from "@/i18n/navigation";
import {canManageAdminLists, getCurrentSession} from "@/lib/auth/session";
import {listCompanies, listContacts} from "@/lib/data/crm";
import {SurfaceCard} from "@/components/ui/surface-card";
import {StatusChip} from "@/components/ui/status-chip";

type PageProps = {
  params: Promise<{locale: "en" | "he"}>;
};

function normalize(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

export default async function AdminDuplicatesPage({params}: PageProps) {
  const {locale} = await params;
  const t = await getTranslations("AdminDuplicates");
  const session = await getCurrentSession();

  if (!session || !canManageAdminLists(session.role)) {
    redirect(`/${locale}/access-denied`);
  }

  const [companies, contacts] = await Promise.all([listCompanies(), listContacts()]);

  const companyRows: Array<{id: string; companyName: string}> = companies.map((company) => ({
    id: company.id,
    companyName: company.companyName
  }));

  const contactRows: Array<{id: string; fullName: string; primaryEmail: string | null}> = contacts.map(
    (contact) => ({
      id: contact.id,
      fullName: contact.fullName,
      primaryEmail: contact.primaryEmail ?? null
    })
  );

  const companiesByName = new Map<string, Array<{id: string; companyName: string}>>();
  for (const company of companyRows) {
    const key = normalize(company.companyName || "");
    if (key.length < 3) continue;
    const list = companiesByName.get(key) ?? [];
    list.push(company);
    companiesByName.set(key, list);
  }

  const companyDupes = Array.from(companiesByName.entries())
    .filter(([, items]) => items.length > 1)
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 50);

  const contactsByEmail = new Map<string, Array<{id: string; fullName: string; primaryEmail: string | null}>>();
  for (const contact of contactRows) {
    const email = contact.primaryEmail ? normalize(contact.primaryEmail) : "";
    if (!email) continue;
    const list = contactsByEmail.get(email) ?? [];
    list.push(contact);
    contactsByEmail.set(email, list);
  }

  const contactDupes = Array.from(contactsByEmail.entries())
    .filter(([, items]) => items.length > 1)
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 50);

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h2 className="text-3xl font-semibold text-ink">{t("title")}</h2>
        <p className="max-w-2xl text-sm leading-7 text-slate-600">{t("subtitle")}</p>
      </div>

      <SurfaceCard className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-ink">{t("companiesTitle")}</h3>
          <StatusChip tone="ink">{t("groupCount", {count: companyDupes.length})}</StatusChip>
        </div>
        {companyDupes.length === 0 ? (
          <p className="text-sm text-slate-600">{t("none")}</p>
        ) : (
          <div className="space-y-4">
            {companyDupes.map(([key, items]) => (
              <div className="rounded-[24px] border border-slate-200 bg-slate-50/60 p-4" key={key}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-ink">{items[0]?.companyName}</p>
                  <StatusChip>{t("recordCount", {count: items.length})}</StatusChip>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {items.map((company) => (
                    <Link
                      className="rounded-full bg-white px-3 py-1 text-sm font-medium text-slate-700"
                      href={`/companies/${company.id}`}
                      key={company.id}
                      locale={locale}
                    >
                      {company.id.slice(0, 8)}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </SurfaceCard>

      <SurfaceCard className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-ink">{t("contactsTitle")}</h3>
          <StatusChip tone="ink">{t("groupCount", {count: contactDupes.length})}</StatusChip>
        </div>
        {contactDupes.length === 0 ? (
          <p className="text-sm text-slate-600">{t("none")}</p>
        ) : (
          <div className="space-y-4">
            {contactDupes.map(([email, items]) => (
              <div className="rounded-[24px] border border-slate-200 bg-slate-50/60 p-4" key={email}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-ink">{email}</p>
                  <StatusChip>{t("recordCount", {count: items.length})}</StatusChip>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {items.map((contact) => (
                    <Link
                      className="rounded-full bg-white px-3 py-1 text-sm font-medium text-slate-700"
                      href={`/contacts/${contact.id}`}
                      key={contact.id}
                      locale={locale}
                    >
                      {contact.fullName}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </SurfaceCard>

      <div className="flex flex-wrap gap-3">
        <Link
          className="inline-flex rounded-full bg-[rgba(244,229,225,0.9)] px-4 py-2 text-sm font-medium text-slate-700"
          href="/admin/lists"
          locale={locale}
        >
          {t("backToAdmin")}
        </Link>
        <Link
          className="inline-flex rounded-full bg-[rgba(244,229,225,0.9)] px-4 py-2 text-sm font-medium text-slate-700"
          href="/dashboard"
          locale={locale}
        >
          {t("backToDashboard")}
        </Link>
      </div>
    </div>
  );
}
