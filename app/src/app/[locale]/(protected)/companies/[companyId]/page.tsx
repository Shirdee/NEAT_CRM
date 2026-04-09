import {getTranslations} from "next-intl/server";
import {notFound} from "next/navigation";

import {Link} from "@/i18n/navigation";
import {canEditRecords, getCurrentSession} from "@/lib/auth/session";
import {getCompanyById} from "@/lib/data/crm";

type CompanyDetailPageProps = {
  params: Promise<{locale: "en" | "he"; companyId: string}>;
  searchParams: Promise<{success?: string}>;
};

function localizedValue(locale: "en" | "he", en?: string | null, he?: string | null) {
  return locale === "he" ? he || en || "—" : en || he || "—";
}

export default async function CompanyDetailPage({
  params,
  searchParams
}: CompanyDetailPageProps) {
  const {locale, companyId} = await params;
  const {success} = await searchParams;
  const t = await getTranslations("CompanyDetail");
  const session = await getCurrentSession();
  const company = await getCompanyById(companyId);

  if (!company) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.3em] text-coral">{t("eyebrow")}</p>
          <h2 className="text-3xl font-semibold text-ink">{company.companyName}</h2>
          <p className="max-w-3xl text-sm leading-7 text-slate-600">{company.notes || t("noNotes")}</p>
        </div>
        {session && canEditRecords(session.role) ? (
          <Link
            className="inline-flex rounded-full border border-slate-300 px-5 py-3 text-sm font-medium text-slate-700"
            href={`/companies/${company.id}/edit`}
            locale={locale}
          >
            {t("edit")}
          </Link>
        ) : null}
      </div>

      {success ? (
        <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {success === "created" ? t("created") : t("updated")}
        </p>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-3">
        <article className="rounded-[24px] border border-slate-200 bg-white p-5">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">{t("website")}</p>
          <p className="mt-3 text-sm text-slate-700">{company.website || "—"}</p>
        </article>
        <article className="rounded-[24px] border border-slate-200 bg-white p-5">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">{t("stage")}</p>
          <p className="mt-3 text-sm text-slate-700">
            {localizedValue(locale, company.stageLabelEn, company.stageLabelHe)}
          </p>
        </article>
        <article className="rounded-[24px] border border-slate-200 bg-white p-5">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">{t("source")}</p>
          <p className="mt-3 text-sm text-slate-700">
            {localizedValue(locale, company.sourceLabelEn, company.sourceLabelHe)}
          </p>
        </article>
        <article className="rounded-[24px] border border-slate-200 bg-white p-5">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">{t("activity")}</p>
          <p className="mt-3 text-sm text-slate-700">
            {company.lastInteractionDate
              ? new Intl.DateTimeFormat(locale === "he" ? "he-IL" : "en-US", {
                  dateStyle: "medium"
                }).format(new Date(company.lastInteractionDate))
              : t("noActivity")}
          </p>
          <p className="mt-2 text-sm text-slate-600">
            {company.inactivityLabel === "stale" ? t("inactive") : t("active")}
          </p>
        </article>
      </div>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-[24px] border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-semibold text-ink">{t("interactionsTitle")}</h3>
            <Link className="text-sm font-medium text-coral" href={`/interactions?companyId=${company.id}`} locale={locale}>
              {t("viewInteractions")}
            </Link>
          </div>
          {session && canEditRecords(session.role) ? (
            <Link className="mt-4 inline-flex text-sm font-medium text-slate-700" href={`/interactions/new?companyId=${company.id}`} locale={locale}>
              {t("addInteraction")}
            </Link>
          ) : null}
        </article>
        <article className="rounded-[24px] border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-semibold text-ink">{t("tasksTitle")}</h3>
            <Link className="text-sm font-medium text-coral" href={`/tasks?companyId=${company.id}`} locale={locale}>
              {t("viewTasks")}
            </Link>
          </div>
          <p className="mt-4 text-sm text-slate-600">
            {t("openTasksCount", {count: company.openTasksCount ?? 0})}
          </p>
          <p className="mt-2 text-sm text-slate-600">
            {t("overdueTasksCount", {count: company.overdueTasksCount ?? 0})}
          </p>
          {session && canEditRecords(session.role) ? (
            <Link className="mt-4 inline-flex text-sm font-medium text-slate-700" href={`/tasks/new?companyId=${company.id}`} locale={locale}>
              {t("addTask")}
            </Link>
          ) : null}
        </article>
      </section>

      <section className="rounded-[24px] border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-ink">{t("contactsTitle")}</h3>
          {session && canEditRecords(session.role) ? (
            <Link
              className="text-sm font-medium text-coral"
              href={`/contacts/new?companyId=${company.id}`}
              locale={locale}
            >
              {t("addContact")}
            </Link>
          ) : null}
        </div>
        {company.contacts.length === 0 ? (
          <p className="mt-4 text-sm text-slate-600">{t("contactsEmpty")}</p>
        ) : (
          <div className="mt-4 space-y-3">
            {company.contacts.map((contact) => (
              <Link
                className="block rounded-[20px] bg-mist p-4 transition hover:bg-sand"
                href={`/contacts/${contact.id}`}
                key={contact.id}
                locale={locale}
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-medium text-ink">{contact.fullName}</p>
                    <p className="text-sm text-slate-600">{contact.roleTitle || t("noRole")}</p>
                  </div>
                  <div className="text-sm text-slate-600">
                    <p>{contact.primaryEmail || "—"}</p>
                    <p>{contact.primaryPhone || "—"}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
