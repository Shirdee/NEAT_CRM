import {getTranslations} from "next-intl/server";
import {notFound} from "next/navigation";

import {Link} from "@/i18n/navigation";
import {canEditRecords, getCurrentSession} from "@/lib/auth/session";
import {getContactById} from "@/lib/data/crm";
import {InfoPair} from "@/components/ui/info-pair";
import {StatusChip} from "@/components/ui/status-chip";
import {SurfaceCard} from "@/components/ui/surface-card";

type ContactDetailPageProps = {
  params: Promise<{locale: "en" | "he"; contactId: string}>;
  searchParams: Promise<{success?: string}>;
};

function localizedDate(locale: "en" | "he", value?: Date | string | null) {
  if (!value) {
    return null;
  }

  return new Intl.DateTimeFormat(locale === "he" ? "he-IL" : "en-US", {
    dateStyle: "medium"
  }).format(new Date(value));
}

function normalizePhoneHref(phone: string) {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

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

  const canEdit = session && canEditRecords(session.role);
  const primaryEmail = contact.emails.find((email) => email.isPrimary)?.email ?? contact.emails[0]?.email ?? null;
  const primaryPhone = contact.phones.find((phone) => phone.isPrimary)?.phoneNumber ?? contact.phones[0]?.phoneNumber ?? null;
  const lastActivity = localizedDate(locale, contact.lastInteractionDate);
  const openTasksLabel = t("openTasksCount", {count: 0}).replace(/^0\s*/, "");
  const overdueTasksLabel = t("overdueTasksCount", {count: 0}).replace(/^0\s*/, "");
  return (
    <div className="space-y-6">
      <SurfaceCard className="space-y-6 bg-white/95">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-4">
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.3em] text-coral">{t("eyebrow")}</p>
              <h2 className="font-display text-3xl font-semibold tracking-tight text-ink">{contact.fullName}</h2>
              <p className="max-w-3xl text-sm leading-7 text-ink/75">{contact.notes || t("noNotes")}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <StatusChip tone="teal">{contact.companyName || t("noCompany")}</StatusChip>
              <StatusChip tone="default">{contact.roleTitle || t("role")}</StatusChip>
              <StatusChip tone={contact.inactivityLabel === "stale" ? "amber" : "ink"}>
                {contact.inactivityLabel === "stale" ? t("inactive") : t("active")}
              </StatusChip>
            </div>
          </div>
          {canEdit ? (
            <div className="flex flex-wrap gap-3">
              <Link
                className="inline-flex items-center justify-center rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-ink/90"
                href={`/contacts/${contact.id}/edit`}
                locale={locale}
              >
                {t("edit")}
              </Link>
            </div>
          ) : null}
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {primaryEmail ? (
            <a
              className="inline-flex items-center justify-center rounded-full bg-mist px-5 py-3 text-sm font-medium text-ink/80 transition hover:bg-sand"
              href={`mailto:${primaryEmail}`}
            >
              <span className="truncate">{primaryEmail}</span>
            </a>
          ) : null}
          {primaryPhone ? (
            <a
              className="inline-flex items-center justify-center rounded-full bg-mist px-5 py-3 text-sm font-medium text-ink/80 transition hover:bg-sand"
              href={normalizePhoneHref(primaryPhone)}
            >
              <span className="truncate">{primaryPhone}</span>
            </a>
          ) : null}
          <Link
            className="inline-flex items-center justify-center rounded-full bg-mist px-5 py-3 text-sm font-medium text-ink/80 transition hover:bg-sand"
            href={`/interactions?contactId=${contact.id}`}
            locale={locale}
          >
            {t("viewInteractions")}
          </Link>
          <Link
            className="inline-flex items-center justify-center rounded-full bg-mist px-5 py-3 text-sm font-medium text-ink/80 transition hover:bg-sand"
            href={`/tasks?contactId=${contact.id}`}
            locale={locale}
          >
            {t("viewTasks")}
          </Link>
          {canEdit ? (
            <Link
              className="inline-flex items-center justify-center rounded-full bg-coral px-5 py-3 text-sm font-medium text-white transition hover:opacity-95"
              href={`/contacts/${contact.id}/edit`}
              locale={locale}
            >
              {t("edit")}
            </Link>
          ) : null}
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <InfoPair label={t("role")} value={contact.roleTitle || "—"} />
          <InfoPair label={t("company")} value={contact.companyName || t("noCompany")} accent="teal" />
          <InfoPair
            label={t("nameParts")}
            value={[contact.firstName, contact.lastName].filter(Boolean).join(" ") || contact.fullName}
            accent="coral"
          />
          <InfoPair
            label={t("activity")}
            value={lastActivity || t("noActivity")}
            accent={contact.inactivityLabel === "stale" ? "coral" : "default"}
          />
        </div>
      </SurfaceCard>

      {success ? (
        <p className="rounded-2xl bg-teal/10 px-4 py-3 text-sm font-medium text-teal">
          {success === "created" ? t("created") : t("updated")}
        </p>
      ) : null}

      <section className="grid gap-4 lg:grid-cols-2">
        <SurfaceCard className="space-y-4 bg-white/95">
          <div className="flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-ink">{t("interactionsTitle")}</h3>
            <Link className="text-sm font-medium text-coral" href={`/interactions?contactId=${contact.id}`} locale={locale}>
              {t("viewInteractions")}
            </Link>
          </div>
          <InfoPair label={t("activity")} value={lastActivity || t("noActivity")} />
          <p className="text-sm leading-7 text-ink/75">
            {contact.inactivityLabel === "stale" ? t("inactive") : t("active")}
          </p>
          {canEdit ? (
            <Link
              className="inline-flex w-full items-center justify-center rounded-full bg-mist px-5 py-3 text-sm font-medium text-ink/80 sm:w-auto"
              href={`/interactions/new?compact=1&contactId=${contact.id}`}
              locale={locale}
            >
              {t("addInteraction")}
            </Link>
          ) : null}
        </SurfaceCard>
        <SurfaceCard className="space-y-4 bg-white/95">
          <div className="flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-ink">{t("tasksTitle")}</h3>
            <Link className="text-sm font-medium text-coral" href={`/tasks?contactId=${contact.id}`} locale={locale}>
              {t("viewTasks")}
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <InfoPair
              label={openTasksLabel}
              value={t("openTasksCount", {count: contact.openTasksCount ?? 0})}
              accent="teal"
            />
            <InfoPair
              label={overdueTasksLabel}
              value={t("overdueTasksCount", {count: contact.overdueTasksCount ?? 0})}
              accent="coral"
            />
          </div>
          {canEdit ? (
            <Link
              className="inline-flex w-full items-center justify-center rounded-full bg-mist px-5 py-3 text-sm font-medium text-ink/80 sm:w-auto"
              href={`/tasks/new?compact=1&contactId=${contact.id}`}
              locale={locale}
            >
              {t("addTask")}
            </Link>
          ) : null}
        </SurfaceCard>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <SurfaceCard className="space-y-4 bg-white/95">
          <h3 className="text-lg font-semibold text-ink">{t("emails")}</h3>
          <div className="space-y-3">
            {contact.emails.length === 0 ? (
              <p className="text-sm text-ink/70">{t("noEmails")}</p>
            ) : (
              contact.emails.map((email) => (
                <a
                  className="flex flex-col gap-2 rounded-[20px] bg-mist/80 px-4 py-3.5 text-sm text-ink/75 transition hover:bg-sand sm:flex-row sm:items-center sm:justify-between"
                  href={`mailto:${email.email}`}
                  key={email.id}
                >
                  <span className="min-w-0 truncate font-medium text-ink" dir="ltr">
                    {email.email}
                  </span>
                  {email.isPrimary ? <StatusChip tone="coral">{t("primary")}</StatusChip> : null}
                </a>
              ))
            )}
          </div>
        </SurfaceCard>
        <SurfaceCard className="space-y-4 bg-white/95">
          <h3 className="text-lg font-semibold text-ink">{t("phones")}</h3>
          <div className="space-y-3">
            {contact.phones.length === 0 ? (
              <p className="text-sm text-ink/70">{t("noPhones")}</p>
            ) : (
              contact.phones.map((phone) => (
                <a
                  className="flex flex-col gap-2 rounded-[20px] bg-mist/80 px-4 py-3.5 text-sm text-ink/75 transition hover:bg-sand sm:flex-row sm:items-center sm:justify-between"
                  href={normalizePhoneHref(phone.phoneNumber)}
                  key={phone.id}
                >
                  <span className="min-w-0 truncate font-medium text-ink" dir="ltr">
                    {phone.phoneNumber}
                  </span>
                  {phone.isPrimary ? <StatusChip tone="coral">{t("primary")}</StatusChip> : null}
                </a>
              ))
            )}
          </div>
        </SurfaceCard>
      </section>
    </div>
  );
}
