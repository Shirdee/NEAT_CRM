import {getTranslations} from "next-intl/server";
import {notFound} from "next/navigation";

import {Link} from "@/i18n/navigation";
import {canEditRecords, getCurrentSession} from "@/lib/auth/session";
import {getContactById} from "@/lib/data/crm";

type ContactDetailPageProps = {
  params: Promise<{locale: "en" | "he"; contactId: string}>;
  searchParams: Promise<{success?: string}>;
};

export default async function ContactDetailPage({
  params,
  searchParams
}: ContactDetailPageProps) {
  const {locale, contactId} = await params;
  const {success} = await searchParams;
  const t = await getTranslations("ContactDetail");
  const session = await getCurrentSession();
  const contact = await getContactById(contactId);

  if (!contact) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.3em] text-coral">{t("eyebrow")}</p>
          <h2 className="text-3xl font-semibold text-ink">{contact.fullName}</h2>
          <p className="max-w-3xl text-sm leading-7 text-slate-600">{contact.notes || t("noNotes")}</p>
        </div>
        {session && canEditRecords(session.role) ? (
          <Link
            className="inline-flex rounded-full border border-slate-300 px-5 py-3 text-sm font-medium text-slate-700"
            href={`/contacts/${contact.id}/edit`}
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
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">{t("role")}</p>
          <p className="mt-3 text-sm text-slate-700">{contact.roleTitle || "—"}</p>
        </article>
        <article className="rounded-[24px] border border-slate-200 bg-white p-5">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">{t("company")}</p>
          <p className="mt-3 text-sm text-slate-700">{contact.companyName || t("noCompany")}</p>
        </article>
        <article className="rounded-[24px] border border-slate-200 bg-white p-5">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">{t("nameParts")}</p>
          <p className="mt-3 text-sm text-slate-700">
            {[contact.firstName, contact.lastName].filter(Boolean).join(" ") || contact.fullName}
          </p>
        </article>
        <article className="rounded-[24px] border border-slate-200 bg-white p-5">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">{t("activity")}</p>
          <p className="mt-3 text-sm text-slate-700">
            {contact.lastInteractionDate
              ? new Intl.DateTimeFormat(locale === "he" ? "he-IL" : "en-US", {
                  dateStyle: "medium"
                }).format(new Date(contact.lastInteractionDate))
              : t("noActivity")}
          </p>
          <p className="mt-2 text-sm text-slate-600">
            {contact.inactivityLabel === "stale" ? t("inactive") : t("active")}
          </p>
        </article>
      </div>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-[24px] border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-semibold text-ink">{t("interactionsTitle")}</h3>
            <Link className="text-sm font-medium text-coral" href={`/interactions?contactId=${contact.id}`} locale={locale}>
              {t("viewInteractions")}
            </Link>
          </div>
          {session && canEditRecords(session.role) ? (
            <Link className="mt-4 inline-flex text-sm font-medium text-slate-700" href={`/interactions/new?compact=1&contactId=${contact.id}`} locale={locale}>
              {t("addInteraction")}
            </Link>
          ) : null}
        </article>
        <article className="rounded-[24px] border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-semibold text-ink">{t("tasksTitle")}</h3>
            <Link className="text-sm font-medium text-coral" href={`/tasks?contactId=${contact.id}`} locale={locale}>
              {t("viewTasks")}
            </Link>
          </div>
          <p className="mt-4 text-sm text-slate-600">
            {t("openTasksCount", {count: contact.openTasksCount ?? 0})}
          </p>
          <p className="mt-2 text-sm text-slate-600">
            {t("overdueTasksCount", {count: contact.overdueTasksCount ?? 0})}
          </p>
          {session && canEditRecords(session.role) ? (
            <Link className="mt-4 inline-flex text-sm font-medium text-slate-700" href={`/tasks/new?compact=1&contactId=${contact.id}`} locale={locale}>
              {t("addTask")}
            </Link>
          ) : null}
        </article>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-[24px] border border-slate-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-ink">{t("emails")}</h3>
          <div className="mt-4 space-y-3">
            {contact.emails.length === 0 ? (
              <p className="text-sm text-slate-600">{t("noEmails")}</p>
            ) : (
              contact.emails.map((email) => (
                <div className="rounded-[18px] bg-mist px-4 py-3 text-sm text-slate-700" key={email.id}>
                  <span className="font-medium text-ink">{email.email}</span>
                  {email.isPrimary ? <span className="ms-2 text-coral">{t("primary")}</span> : null}
                </div>
              ))
            )}
          </div>
        </article>
        <article className="rounded-[24px] border border-slate-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-ink">{t("phones")}</h3>
          <div className="mt-4 space-y-3">
            {contact.phones.length === 0 ? (
              <p className="text-sm text-slate-600">{t("noPhones")}</p>
            ) : (
              contact.phones.map((phone) => (
                <div className="rounded-[18px] bg-mist px-4 py-3 text-sm text-slate-700" key={phone.id}>
                  <span className="font-medium text-ink">{phone.phoneNumber}</span>
                  {phone.isPrimary ? <span className="ms-2 text-coral">{t("primary")}</span> : null}
                </div>
              ))
            )}
          </div>
        </article>
      </section>
    </div>
  );
}
