import {getTranslations} from "next-intl/server";
import {notFound} from "next/navigation";

import {Link} from "@/i18n/navigation";
import {canEditRecords, getCurrentSession} from "@/lib/auth/session";
import {getCompanyById} from "@/lib/data/crm";
import {InfoPair} from "@/components/ui/info-pair";
import {StatusChip} from "@/components/ui/status-chip";
import {SurfaceCard} from "@/components/ui/surface-card";

type CompanyDetailPageProps = {
  params: Promise<{locale: "en" | "he"; companyId: string}>;
  searchParams: Promise<{success?: string}>;
};

function localizedValue(locale: "en" | "he", en?: string | null, he?: string | null) {
  return locale === "he" ? he || en || "—" : en || he || "—";
}

function formatDate(locale: "en" | "he", value: Date | string | null) {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat(locale === "he" ? "he-IL" : "en-US", {
    dateStyle: "medium"
  }).format(new Date(value));
}

export default async function CompanyDetailPage({
  params,
  searchParams
}: CompanyDetailPageProps) {
  const {locale, companyId} = await params;
  const {success} = await searchParams;
  const tDetail = await getTranslations("CompanyDetail");
  const tCompanies = await getTranslations("Companies");
  const session = await getCurrentSession();
  const company = await getCompanyById(companyId);

  if (!company) {
    notFound();
  }

  const isStale = company.inactivityLabel === "stale";

  return (
    <div className="flex flex-col gap-5">
      <div className="text-[12px] text-ink/40">
        <Link className="text-teal transition hover:text-teal/80" href="/companies" locale={locale}>
          {tCompanies("title")}
        </Link>
        <span className="px-1.5">/</span>
        <span>{company.companyName}</span>
      </div>

      {success ? (
        <p className="rounded-2xl bg-teal/8 px-4 py-3 text-sm text-teal">
          {success === "created" ? tDetail("created") : tDetail("updated")}
        </p>
      ) : null}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="flex min-w-0 flex-col gap-4">
          <SurfaceCard className="space-y-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div className="space-y-3">
                <p className="text-xs uppercase tracking-[0.3em] text-coral">{tDetail("eyebrow")}</p>
                <h1 className="font-display text-[26px] font-extrabold tracking-tight text-ink">
                  {company.companyName}
                </h1>
                <div className="flex flex-wrap gap-2">
                  <StatusChip tone="teal">
                    {localizedValue(locale, company.stageLabelEn, company.stageLabelHe)}
                  </StatusChip>
                  <StatusChip tone="default">
                    {localizedValue(locale, company.sourceLabelEn, company.sourceLabelHe)}
                  </StatusChip>
                  <StatusChip tone={isStale ? "amber" : "ink"}>
                    {isStale ? tDetail("inactive") : tDetail("active")}
                  </StatusChip>
                </div>
              </div>

              {session && canEditRecords(session.role) ? (
                <div className="flex flex-wrap gap-2">
                  <Link
                    className="inline-flex items-center justify-center rounded-full bg-coral px-5 py-2.5 text-[13.5px] font-semibold text-white transition hover:bg-coral/90"
                    href={`/interactions/new?compact=1&companyId=${company.id}`}
                    locale={locale}
                  >
                    {tDetail("addInteraction")}
                  </Link>
                  <Link
                    className="inline-flex items-center justify-center rounded-full bg-mist px-5 py-2.5 text-[13.5px] font-medium text-ink/70 transition hover:bg-sand"
                    href={`/tasks/new?compact=1&companyId=${company.id}`}
                    locale={locale}
                  >
                    {tDetail("addTask")}
                  </Link>
                  <Link
                    className="inline-flex items-center justify-center rounded-full border border-ink/10 bg-white px-5 py-2.5 text-[13.5px] font-medium text-ink transition hover:border-coral/30 hover:bg-sand"
                    href={`/companies/${company.id}/edit`}
                    locale={locale}
                  >
                    {tDetail("edit")}
                  </Link>
                </div>
              ) : null}
            </div>

            <p className="max-w-3xl text-sm leading-7 text-ink/70">
              {company.notes || tDetail("noNotes")}
            </p>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <InfoPair label={tDetail("website")} value={company.website || "—"} />
              <InfoPair
                accent="teal"
                label={tDetail("stage")}
                value={localizedValue(locale, company.stageLabelEn, company.stageLabelHe)}
              />
              <InfoPair
                label={tDetail("source")}
                value={localizedValue(locale, company.sourceLabelEn, company.sourceLabelHe)}
              />
              <InfoPair
                accent={isStale ? "coral" : "default"}
                label={tDetail("activity")}
                value={
                  company.lastInteractionDate ? formatDate(locale, company.lastInteractionDate) : tDetail("noActivity")
                }
              />
            </div>
          </SurfaceCard>

          <section className="grid gap-4 lg:grid-cols-2">
            <SurfaceCard className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-ink">{tDetail("interactionsTitle")}</h2>
                <Link
                  className="text-sm font-medium text-coral"
                  href={`/interactions?companyId=${company.id}`}
                  locale={locale}
                >
                  {tDetail("viewInteractions")}
                </Link>
              </div>
              <p className="text-sm text-ink/70">{tDetail("activity")}</p>
              {session && canEditRecords(session.role) ? (
                <Link
                  className="text-sm font-medium text-ink/70"
                  href={`/interactions/new?compact=1&companyId=${company.id}`}
                  locale={locale}
                >
                  {tDetail("addInteraction")}
                </Link>
              ) : null}
            </SurfaceCard>

            <SurfaceCard className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-ink">{tDetail("tasksTitle")}</h2>
                <Link className="text-sm font-medium text-coral" href={`/tasks?companyId=${company.id}`} locale={locale}>
                  {tDetail("viewTasks")}
                </Link>
              </div>
              <p className="text-sm text-ink/70">
                {tDetail("openTasksCount", {count: company.openTasksCount ?? 0})}
              </p>
              <p className="text-sm text-ink/70">
                {tDetail("overdueTasksCount", {count: company.overdueTasksCount ?? 0})}
              </p>
              {session && canEditRecords(session.role) ? (
                <Link
                  className="text-sm font-medium text-ink/70"
                  href={`/tasks/new?compact=1&companyId=${company.id}`}
                  locale={locale}
                >
                  {tDetail("addTask")}
                </Link>
              ) : null}
            </SurfaceCard>
          </section>

          <SurfaceCard className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-ink">{tDetail("contactsTitle")}</h2>
              {session && canEditRecords(session.role) ? (
                <Link className="text-sm font-medium text-coral" href={`/contacts/new?companyId=${company.id}`} locale={locale}>
                  {tDetail("addContact")}
                </Link>
              ) : null}
            </div>
            {company.contacts.length === 0 ? (
              <p className="text-sm text-ink/70">{tDetail("contactsEmpty")}</p>
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {company.contacts.map((contact) => (
                  <Link
                    key={contact.id}
                    href={`/contacts/${contact.id}`}
                    locale={locale}
                    className="rounded-[18px] border border-ink/10 bg-white px-4 py-4 transition hover:border-coral/30 hover:bg-sand/70"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-medium text-ink">{contact.fullName}</p>
                        <p className="text-sm text-ink/60">{contact.roleTitle || tDetail("noRole")}</p>
                      </div>
                    </div>
                    <div className="mt-3 space-y-1 text-sm text-ink/60">
                      <p className="truncate">{contact.primaryEmail || "—"}</p>
                      <p className="truncate">{contact.primaryPhone || "—"}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </SurfaceCard>
        </div>

        <SurfaceCard className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-[14px] font-bold text-ink">{tDetail("activity")}</h2>
            {session && canEditRecords(session.role) ? (
              <Link
                className="text-[12px] font-medium text-teal transition hover:text-teal/80"
                href={`/interactions/new?compact=1&companyId=${company.id}`}
                locale={locale}
              >
                + {tDetail("addInteraction")}
              </Link>
            ) : null}
          </div>

          <div className="grid gap-3">
            <div className="rounded-[16px] bg-mist px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-ink/40">
                {tDetail("activity")}
              </p>
              <p className="mt-1 text-sm font-medium text-ink">
                {company.lastInteractionDate ? formatDate(locale, company.lastInteractionDate) : tDetail("noActivity")}
              </p>
            </div>
            <div className="rounded-[16px] bg-white px-4 py-3 shadow-[inset_0_-1px_0_rgba(16,36,63,0.04)]">
              <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-ink/40">
                {tDetail("openTasksCount", {count: company.openTasksCount ?? 0})}
              </p>
              <p className="mt-1 text-sm text-ink/70">{tDetail("viewTasks")}</p>
            </div>
            <div className="rounded-[16px] bg-white px-4 py-3 shadow-[inset_0_-1px_0_rgba(16,36,63,0.04)]">
              <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-ink/40">
                {tDetail("overdueTasksCount", {count: company.overdueTasksCount ?? 0})}
              </p>
              <p className="mt-1 text-sm text-ink/70">{tDetail("viewTasks")}</p>
            </div>
            <div className="rounded-[16px] bg-white px-4 py-3 shadow-[inset_0_-1px_0_rgba(16,36,63,0.04)]">
              <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-ink/40">
                {tDetail("contactsTitle")}
              </p>
              <p className="mt-1 text-sm text-ink/70">
                {company.contacts.length
                  ? company.contacts.slice(0, 3).map((contact) => contact.fullName).join(", ")
                  : tDetail("contactsEmpty")}
              </p>
            </div>
          </div>

          <div className="pt-1">
            <Link className="text-sm font-medium text-coral" href={`/companies/${company.id}/edit`} locale={locale}>
              {tDetail("edit")}
            </Link>
          </div>
        </SurfaceCard>
      </div>
    </div>
  );
}
