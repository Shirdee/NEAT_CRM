import {getTranslations} from "next-intl/server";

import {Link} from "@/i18n/navigation";
import {MetricCard} from "@/components/ui/metric-card";
import {SurfaceCard} from "@/components/ui/surface-card";
import {getCurrentSession} from "@/lib/auth/session";
import {getDashboardSnapshot} from "@/lib/data/crm";

type DashboardPageProps = {
  searchParams: Promise<{period?: string}>;
};

function parsePeriodDays(raw: string | undefined) {
  switch ((raw ?? "").trim()) {
    case "30d":
      return 30;
    case "90d":
      return 90;
    default:
      return 7;
  }
}

export default async function DashboardPage({searchParams}: DashboardPageProps) {
  const t = await getTranslations("Dashboard");
  const {period} = await searchParams;
  const session = await getCurrentSession();
  const periodDays = parsePeriodDays(period);
  const snapshot = await getDashboardSnapshot(periodDays);

  const dateFormatter = new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric"
  });

  return (
    <div className="space-y-4 lg:space-y-3">
      <SurfaceCard className="relative overflow-hidden bg-ink text-white">
        <div className="pointer-events-none absolute inset-0 bg-transparent" />
        <div className="relative space-y-4">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.3em] text-white/60">{t("eyebrow")}</p>
            <div className="space-y-2">
              <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-4xl">
                {t("title")}
              </h2>
              <p className="hidden max-w-2xl text-sm leading-7 text-white/70 sm:block">
                {t("subtitle", {role: session?.role ?? "viewer"})}
              </p>
            </div>
          </div>
          <div className="inline-flex flex-wrap gap-2 rounded-[24px] bg-white/8 p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]">
            {[
              {key: "7d", days: 7},
              {key: "30d", days: 30},
              {key: "90d", days: 90}
            ].map((preset) => (
              <Link
                className={[
                  "rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] transition",
                periodDays === preset.days ? "bg-white/20 text-white" : "bg-white/10 text-white/80 hover:bg-white/15"
              ].join(" ")}
                href={`/dashboard?period=${preset.key}`}
                key={preset.key}
              >
                {preset.key}
              </Link>
            ))}
          </div>
          <div className="grid grid-cols-1 gap-2 pt-1 sm:grid-cols-3 sm:gap-3">
            <Link
              className="inline-flex items-center justify-center rounded-full bg-coral px-4 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-coral/90 sm:px-5"
              href="/tasks"
            >
              {t("actions.reviewTasks")}
            </Link>
            <Link
              className="inline-flex items-center justify-center rounded-full border border-white/12 bg-white/10 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/15 sm:px-5"
              href="/interactions/new?compact=1"
            >
              {t("actions.logInteraction")}
            </Link>
            <Link
              className="inline-flex items-center justify-center rounded-full border border-white/12 bg-white/10 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/15 sm:px-5"
              href="/opportunities"
            >
              {t("actions.reviewOpportunities")}
            </Link>
          </div>
        </div>
      </SurfaceCard>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <MetricCard
          detail={t("metrics.overdueDetail")}
          label={t("metrics.overdue")}
          tone="coral"
          value={String(snapshot.overdueTasksCount)}
        />
        <MetricCard
          detail={t("metrics.upcomingDetail")}
          label={t("metrics.upcoming")}
          tone="amber"
          value={String(snapshot.upcomingTasksCount)}
        />
        <MetricCard
          detail={t("metrics.meetingsDetail")}
          label={t("metrics.meetings")}
          tone="teal"
          value={String(snapshot.meetingsInPeriodCount)}
        />
        <MetricCard
          detail={t("metrics.opportunitiesDetail")}
          label={t("metrics.opportunities")}
          tone="ink"
          value={String(snapshot.openOpportunitiesCount)}
        />
      </div>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(300px,0.9fr)] xl:items-start">
        <SurfaceCard className="min-w-0 space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-coral">
                {t("priority.eyebrow")}
              </p>
              <h3 className="mt-2 font-display text-2xl font-semibold text-ink">
                {t("priority.title")}
              </h3>
            </div>
            <Link className="rounded-full bg-mist px-3 py-1.5 text-sm font-medium text-teal transition hover:bg-mint" href="/tasks">
              {t("priority.cta")}
            </Link>
          </div>
          <div className="space-y-3">
            {snapshot.overdueTasks.map((task) => (
              <Link
                className="block rounded-[24px] border border-transparent bg-slate-50/75 p-4 shadow-[0_1px_0_rgba(15,23,42,0.04)] transition hover:bg-white hover:shadow-[0_8px_24px_rgba(15,23,42,0.06)]"
                href={`/tasks/${task.id}`}
                key={task.id}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-base font-semibold text-ink">
                      {task.notes || t("priority.noTaskNotes")}
                    </p>
                    <p className="text-sm text-slate-600">
                      {task.companyName || task.contactName || t("priority.unassigned")}
                    </p>
                  </div>
                  <span className="rounded-full bg-coral/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-coral">
                    {dateFormatter.format(new Date(task.dueDate))}
                  </span>
                </div>
              </Link>
            ))}
            {snapshot.overdueTasksCount === 0 ? (
              <div className="rounded-[24px] bg-mint/70 px-4 py-5 text-sm text-slate-700">
                {t("priority.empty")}
              </div>
            ) : null}
          </div>
        </SurfaceCard>
        <div className="min-w-0 space-y-4">
          <SurfaceCard className="min-w-0 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-teal">
                  {t("timeline.eyebrow")}
                </p>
                <h3 className="mt-2 text-xl font-semibold text-ink">{t("timeline.title")}</h3>
              </div>
              <Link className="rounded-full bg-mist px-3 py-1.5 text-sm font-medium text-teal transition hover:bg-mint" href="/interactions">
                {t("timeline.cta")}
              </Link>
            </div>
            <div className="space-y-3">
              {snapshot.recentInteractions.map((interaction) => (
                <Link
                  className="block rounded-[22px] border border-transparent bg-mist/70 px-3 py-3 transition hover:bg-mint sm:px-4 sm:py-4"
                  href={`/interactions/${interaction.id}`}
                  key={interaction.id}
                >
                  <p className="font-medium text-ink">{interaction.subject}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-600">
                    <span>{interaction.companyName || interaction.contactName || t("timeline.general")}</span>
                    <span aria-hidden="true">•</span>
                    <span>{dateFormatter.format(new Date(interaction.interactionDate))}</span>
                  </div>
                </Link>
              ))}
              {snapshot.recentInteractions.length === 0 ? (
                <p className="rounded-[22px] bg-mist/70 px-4 py-5 text-sm text-slate-700">
                  {t("timeline.empty")}
                </p>
              ) : null}
            </div>
          </SurfaceCard>
          <SurfaceCard className="min-w-0 space-y-4">
            <p className="text-xs uppercase tracking-[0.28em] text-slate-400">{t("insights.eyebrow")}</p>
            <h3 className="text-xl font-semibold text-ink">{t("insights.title")}</h3>
            <div className="space-y-3">
              {snapshot.activeCompanies.map((company) => (
                <Link
                  className="flex items-center justify-between gap-3 rounded-[22px] border border-transparent bg-slate-50/75 px-4 py-3 transition hover:bg-mint/70"
                  href={`/companies/${company.id}`}
                  key={company.id}
                >
                  <div>
                    <p className="font-medium text-ink">{company.companyName}</p>
                    <p className="text-sm text-slate-600">
                      {company.stageLabelEn || company.sourceLabelEn || t("insights.noStage")}
                    </p>
                  </div>
                  <span className="rounded-full bg-ink px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white">
                    {company.contactsCount}
                  </span>
                </Link>
              ))}
            </div>
          </SurfaceCard>
        </div>
      </div>
    </div>
  );
}
