import {getTranslations} from "next-intl/server";
import {notFound} from "next/navigation";

import {Link} from "@/i18n/navigation";
import {canEditRecords, getCurrentSession} from "@/lib/auth/session";
import {getCompanyById} from "@/lib/data/crm";
import {InfoPair} from "@/components/ui/info-pair";
import {StatusChip} from "@/components/ui/status-chip";
import {SurfaceCard} from "@/components/ui/surface-card";
import {deleteCompanyAction} from "../actions";

type CompanyDetailPageProps = {
  params: Promise<{locale: "en" | "he"; companyId: string}>;
  searchParams: Promise<{success?: string; error?: string; blockedBy?: string}>;
};

function localizedValue(locale: "en" | "he", en?: string | null, he?: string | null) {
  return locale === "he" ? he || en || "—" : en || he || "—";
}

export default async function CompanyDetailPage({
  params,
  searchParams
}: CompanyDetailPageProps) {
  const {locale, companyId} = await params;
  const {success, error, blockedBy} = await searchParams;
  const t = await getTranslations("CompanyDetail");
  const session = await getCurrentSession();
  const company = await getCompanyById(companyId);

  if (!company) {
    notFound();
  }

  const blockedItems = String(blockedBy ?? "")
    .split(",")
    .filter(Boolean)
    .join(", ");

  return (
    <div className="space-y-6">
      {error ? (
        <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {error === "confirm"
            ? t("deleteConfirmError")
            : error === "blocked"
              ? t("deleteBlocked", {blockedBy: blockedItems || t("deleteBlockedUnknown")})
              : t("deleteError")}
        </p>
      ) : null}
      {success ? (
        <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {success === "created" ? t("created") : t("updated")}
        </p>
      ) : null}

      <SurfaceCard className="space-y-5 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(249,235,231,0.9))]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.3em] text-coral">{t("eyebrow")}</p>
            <h2 className="font-display text-3xl font-semibold tracking-tight text-ink">
              {company.companyName}
            </h2>
            <p className="max-w-3xl text-sm leading-7 text-slate-600">
              {company.notes || t("noNotes")}
            </p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap lg:w-auto">
            {session && canEditRecords(session.role) ? (
              <>
                <Link
                  className="inline-flex items-center justify-center rounded-full bg-coral px-5 py-3 text-sm font-medium text-white"
                  href={`/interactions/new?compact=1&companyId=${company.id}`}
                  locale={locale}
                >
                  {t("addInteraction")}
                </Link>
                <Link
                  className="inline-flex items-center justify-center rounded-full bg-[rgba(244,229,225,0.9)] px-5 py-3 text-sm font-medium text-slate-700"
                  href={`/tasks/new?compact=1&companyId=${company.id}`}
                  locale={locale}
                >
                  {t("addTask")}
                </Link>
                <Link
                  className="inline-flex items-center justify-center rounded-full bg-[rgba(244,229,225,0.9)] px-5 py-3 text-sm font-medium text-slate-700"
                  href={`/companies/${company.id}/edit`}
                  locale={locale}
                >
                  {t("edit")}
                </Link>
                {session.role === "admin" ? (
                  <form action={deleteCompanyAction.bind(null, locale)} className="space-y-2">
                    <input name="companyId" type="hidden" value={company.id} />
                    <label className="flex items-center gap-2 text-xs text-slate-600">
                      <input name="confirm" type="checkbox" value="1" />
                      {t("deleteConfirm")}
                    </label>
                    <button
                      className="inline-flex items-center justify-center rounded-full bg-rose-700 px-5 py-3 text-sm font-medium text-white"
                      type="submit"
                    >
                      {t("delete")}
                    </button>
                  </form>
                ) : null}
              </>
            ) : null}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <StatusChip tone="teal">
            {localizedValue(locale, company.stageLabelEn, company.stageLabelHe)}
          </StatusChip>
          <StatusChip>{localizedValue(locale, company.sourceLabelEn, company.sourceLabelHe)}</StatusChip>
          <StatusChip tone={company.inactivityLabel === "stale" ? "amber" : "ink"}>
            {company.inactivityLabel === "stale" ? t("inactive") : t("active")}
          </StatusChip>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <InfoPair label={t("website")} value={company.website || "—"} />
          <InfoPair
            label={t("stage")}
            value={localizedValue(locale, company.stageLabelEn, company.stageLabelHe)}
            accent="teal"
          />
          <InfoPair
            label={t("source")}
            value={localizedValue(locale, company.sourceLabelEn, company.sourceLabelHe)}
          />
          <InfoPair
            label={t("activity")}
            value={
              company.lastInteractionDate
                ? new Intl.DateTimeFormat(locale === "he" ? "he-IL" : "en-US", {
                    dateStyle: "medium"
                  }).format(new Date(company.lastInteractionDate))
                : t("noActivity")
            }
            accent={company.inactivityLabel === "stale" ? "coral" : "default"}
          />
        </div>
      </SurfaceCard>

      <section className="grid gap-4 lg:grid-cols-2">
        <SurfaceCard className="space-y-4 bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(254,241,237,0.92))]">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-semibold text-ink">{t("interactionsTitle")}</h3>
            <Link className="text-sm font-medium text-coral" href={`/interactions?companyId=${company.id}`} locale={locale}>
              {t("viewInteractions")}
            </Link>
          </div>
          <p className="text-sm text-slate-600">{t("activity")}</p>
          {session && canEditRecords(session.role) ? (
            <Link className="inline-flex text-sm font-medium text-slate-700" href={`/interactions/new?compact=1&companyId=${company.id}`} locale={locale}>
              {t("addInteraction")}
            </Link>
          ) : null}
        </SurfaceCard>
        <SurfaceCard className="space-y-4 bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(254,241,237,0.92))]">
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
            <Link className="inline-flex text-sm font-medium text-slate-700" href={`/tasks/new?compact=1&companyId=${company.id}`} locale={locale}>
              {t("addTask")}
            </Link>
          ) : null}
        </SurfaceCard>
      </section>

      <SurfaceCard className="space-y-4 bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(254,241,237,0.92))]">
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
          <p className="text-sm text-slate-600">{t("contactsEmpty")}</p>
        ) : (
          <div className="space-y-3">
            {company.contacts.map((contact) => (
              <Link
                className="block rounded-[20px] bg-mist p-4 transition hover:bg-sand"
                href={`/contacts/${contact.id}`}
                key={contact.id}
                locale={locale}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
      </SurfaceCard>
    </div>
  );
}
