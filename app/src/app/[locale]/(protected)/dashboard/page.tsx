import {getTranslations} from "next-intl/server";

import {Link} from "@/i18n/navigation";
import {PeriodToggle} from "@/components/dashboard/period-toggle";
import {StatusChip} from "@/components/ui/status-chip";
import {SurfaceCard} from "@/components/ui/surface-card";
import {canEditRecords, getCurrentSession} from "@/lib/auth/session";
import {listInteractions, listTasks, getDashboardSnapshot} from "@/lib/data/crm";
import {formatRelativeActivityTime, getOpenDealValue, getRecentActivity, type ActivityItem} from "@/lib/data/activity";

type DashboardPageProps = {
  params: Promise<{locale: "en" | "he"}>;
  searchParams: Promise<{period?: string}>;
};

type PeriodKey = "7" | "30" | "90";

function parsePeriodKey(raw: string | undefined): PeriodKey {
  switch ((raw ?? "").trim()) {
    case "30":
    case "30d":
      return "30";
    case "90":
    case "90d":
      return "90";
    default:
      return "7";
  }
}

function parsePeriodDays(period: PeriodKey) {
  switch (period) {
    case "30":
      return 30;
    case "90":
      return 90;
    default:
      return 7;
  }
}

function formatMoney(value: number, locale: "en" | "he") {
  return new Intl.NumberFormat(locale === "he" ? "he-IL" : "en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(value);
}

function formatShortDate(value: Date | string, locale: "en" | "he") {
  return new Intl.DateTimeFormat(locale === "he" ? "he-IL" : "en-US", {
    month: "short",
    day: "numeric"
  }).format(new Date(value));
}

function sameDay(a: Date | string, b: Date) {
  const left = new Date(a);
  return (
    left.getFullYear() === b.getFullYear() &&
    left.getMonth() === b.getMonth() &&
    left.getDate() === b.getDate()
  );
}

function firstName(fullName: string | null | undefined) {
  return fullName?.trim().split(/\s+/)[0] ?? "";
}

function activityTypeLabel(item: ActivityItem, t: Awaited<ReturnType<typeof getTranslations>>) {
  switch (item.type) {
    case "interaction":
      return t("activity.types.interaction");
    case "task_done":
      return t("activity.types.taskDone");
    case "task_overdue":
      return t("activity.types.taskOverdue");
    case "created":
      return t("activity.types.created");
    case "stage_change":
      return t("activity.types.stageChange");
  }
}

function activityTone(item: ActivityItem) {
  switch (item.type) {
    case "task_done":
      return {badge: "bg-lime/15 text-lime/80", symbol: "✓"};
    case "task_overdue":
      return {badge: "bg-coral/10 text-coral", symbol: "!"};
    case "created":
      return {badge: "bg-ink/6 text-ink/50", symbol: "+"};
    case "stage_change":
      return {badge: "bg-amber/15 text-amber-text", symbol: "→"};
    case "interaction":
    default:
      return {badge: "bg-teal/10 text-teal", symbol: "↗"};
  }
}

function bucketActivity(items: ActivityItem[], now = Date.now()) {
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const startOfYesterday = new Date(startOfToday.getTime() - 24 * 60 * 60 * 1000);

  const buckets = {
    today: [] as ActivityItem[],
    yesterday: [] as ActivityItem[],
    earlier: [] as ActivityItem[]
  };

  for (const item of items) {
    const timestamp = new Date(item.timestamp).getTime();

    if (timestamp >= startOfToday.getTime()) {
      buckets.today.push(item);
      continue;
    }

    if (timestamp >= startOfYesterday.getTime()) {
      buckets.yesterday.push(item);
      continue;
    }

    buckets.earlier.push(item);
  }

  return buckets;
}

export default async function DashboardPage({params, searchParams}: DashboardPageProps) {
  const {locale} = await params;
  const {period} = await searchParams;
  const t = await getTranslations("Dashboard");
  const session = await getCurrentSession();
  const selectedPeriod = parsePeriodKey(period);
  const periodDays = parsePeriodDays(selectedPeriod);
  const [snapshot, recentInteractions, tasks, recentActivity] = await Promise.all([
    getDashboardSnapshot(periodDays),
    listInteractions(),
    listTasks(),
    getRecentActivity(10)
  ]);
  const openDealValue = getOpenDealValue(snapshot);
  const canCreate = session ? canEditRecords(session.role) : false;
  const greetingName = firstName(session?.fullName) || t("greetingFallback");
  const roleLabel = session?.role ? t(`roles.${session.role}`) : t("roles.viewer");
  const dueTodayCount = tasks.filter((task) => {
    if (task.completedAt) {
      return false;
    }

    return sameDay(task.dueDate, new Date());
  }).length;
  const openOpportunitiesValue =
    typeof openDealValue === "number"
      ? `${snapshot.openOpportunitiesCount} · ${formatMoney(openDealValue, locale)}`
      : String(snapshot.openOpportunitiesCount);
  const activityBuckets = bucketActivity(recentActivity);
  const recentInteractionsSlice = recentInteractions.slice(0, 4);

  return (
    <div className="flex flex-col gap-6 px-4 py-5 lg:px-8 lg:py-7">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-[26px] font-extrabold text-ink">
            {t("greeting", {name: greetingName})}
          </h1>
          <p className="mt-0.5 text-[13px] text-ink/50">{t("greetingSub", {role: roleLabel})}</p>
        </div>
        <div className="flex items-center gap-3">
          <PeriodToggle value={selectedPeriod} />
          {canCreate ? (
            <>
              <Link
                className="inline-flex items-center justify-center rounded-full bg-coral px-4 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-coral/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint/70"
                href="/interactions/new?compact=1"
              >
                {t("quickLog")}
              </Link>
              <Link
                className="inline-flex items-center justify-center rounded-full bg-ink px-4 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-ink/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint/70"
                href="/tasks/new?compact=1"
              >
                {t("quickTask")}
              </Link>
            </>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <MetricTile
          detail={t("metrics.overdueDetail")}
          label={t("metrics.overdue")}
          tone="coral"
          value={String(snapshot.overdueTasksCount)}
        />
        <MetricTile
          detail={t("metrics.dueTodayDetail")}
          label={t("metrics.dueToday")}
          tone="amber"
          value={String(dueTodayCount)}
        />
        <MetricTile
          detail={t("metrics.meetingsDetail")}
          label={t("metrics.meetings")}
          tone="teal"
          value={String(snapshot.meetingsInPeriodCount)}
        />
        <MetricTile
          detail={openDealValue == null ? undefined : t("metrics.openDealsDetail")}
          label={t("metrics.openDeals")}
          tone="lime"
          value={openOpportunitiesValue}
        />
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_320px]">
        <div className="flex min-w-0 flex-col gap-5">
          <SurfaceCard className="!rounded-[20px] space-y-4 bg-white shadow-[0_2px_12px_rgba(16,36,63,0.07)]">
            <div className="flex items-center justify-between px-1 pb-3">
              <div className="flex items-center gap-2">
                <h2 className="font-display text-[14px] font-bold text-ink">{t("sections.overdue")}</h2>
                <span className="rounded-full bg-coral/10 px-2 py-0.5 text-[11px] font-semibold text-coral">
                  {snapshot.overdueTasksCount}
                </span>
              </div>
              <Link className="text-[12px] font-medium text-teal hover:underline" href="/tasks">
                {t("viewAll")}
              </Link>
            </div>
            {snapshot.overdueTasks.length > 0 ? (
              <div className="space-y-0.5">
                {snapshot.overdueTasks.map((task) => (
                  <Link
                    className="flex items-start gap-3 rounded-[14px] py-2.5 transition-colors hover:bg-sand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint/70"
                    href={`/tasks/${task.id}`}
                    key={task.id}
                  >
                    <span className="mt-0.5 h-[18px] w-[18px] shrink-0 rounded-full border-2 border-ink/20" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13.5px] font-medium text-ink">
                        {task.notes || t("priority.noTaskNotes")}
                      </p>
                      <p className="text-[12px] text-teal font-medium">
                        {task.companyName || task.contactName || t("priority.unassigned")}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full bg-coral/10 px-2.5 py-0.5 text-[11px] font-semibold text-coral">
                      {formatShortDate(task.dueDate, locale)}
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="rounded-[14px] bg-mist px-4 py-5 text-sm text-ink/60">
                {t("priority.empty")}
              </p>
            )}
          </SurfaceCard>

          <SurfaceCard className="!rounded-[20px] space-y-4 bg-white shadow-[0_2px_12px_rgba(16,36,63,0.07)]">
            <div className="flex items-center justify-between px-1 pb-3">
              <h2 className="font-display text-[14px] font-bold text-ink">{t("sections.recent")}</h2>
              <Link className="text-[12px] font-medium text-teal hover:underline" href="/interactions">
                {t("viewAll")}
              </Link>
            </div>
            {recentInteractionsSlice.length > 0 ? (
              <div className="space-y-0.5">
                {recentInteractionsSlice.map((interaction) => (
                  <Link
                    className="flex items-center gap-3 rounded-[14px] py-2 transition-colors hover:bg-sand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint/70"
                    href={`/interactions/${interaction.id}`}
                    key={interaction.id}
                  >
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-teal/15 font-display text-[11px] font-bold text-teal">
                      {interaction.contactName ? interaction.contactName.slice(0, 2).toUpperCase() : "IN"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-semibold text-ink">
                        {interaction.subject}
                      </p>
                      <p className="truncate text-[12px] text-ink/50">
                        {interaction.companyName || interaction.contactName || t("timeline.general")}
                      </p>
                    </div>
                    <StatusChip tone="teal">
                      {interaction.interactionTypeLabelHe && locale === "he"
                        ? interaction.interactionTypeLabelHe
                        : interaction.interactionTypeLabelEn || t("activity.types.interaction")}
                    </StatusChip>
                    <span className="shrink-0 text-[11px] text-ink/30">
                      {formatShortDate(interaction.interactionDate, locale)}
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="rounded-[14px] bg-mist px-4 py-5 text-sm text-ink/60">
                {t("timeline.empty")}
              </p>
            )}
          </SurfaceCard>
        </div>

        <SurfaceCard className="xl:sticky xl:top-7 !rounded-[20px] space-y-4 bg-white shadow-[0_2px_12px_rgba(16,36,63,0.07)]">
          <div className="flex items-center justify-between px-1 pb-2">
            <h2 className="font-display text-[14px] font-bold text-ink">{t("sections.activity")}</h2>
          </div>
          <ActivityFeed items={activityBuckets} locale={locale} t={t} />
        </SurfaceCard>
      </div>
    </div>
  );
}

type MetricTone = "coral" | "amber" | "teal" | "lime";

function MetricTile({
  label,
  value,
  detail,
  tone
}: {
  label: string;
  value: string;
  detail?: string;
  tone: MetricTone;
}) {
  const toneClasses: Record<MetricTone, string> = {
    coral: "bg-coral/10 text-coral",
    amber: "bg-amber/15 text-amber-text",
    teal: "bg-teal/10 text-teal",
    lime: "bg-lime/15 text-lime/80"
  };

  return (
    <div className="rounded-[20px] bg-white p-5 shadow-[0_2px_12px_rgba(16,36,63,0.07)] transition hover:-translate-y-0.5 hover:shadow-[0_6px_24px_rgba(16,36,63,0.11)]">
      <p className="text-[11px] font-semibold uppercase tracking-[0.07em] text-ink/50">{label}</p>
      <p className={`mt-2 font-display text-4xl font-extrabold leading-none ${toneClasses[tone]}`}>
        {value}
      </p>
      {detail ? <p className="mt-2 text-xs text-ink/40">{detail}</p> : null}
    </div>
  );
}

function ActivityFeed({
  items,
  locale,
  t
}: {
  items: {
    today: ActivityItem[];
    yesterday: ActivityItem[];
    earlier: ActivityItem[];
  };
  locale: "en" | "he";
  t: Awaited<ReturnType<typeof getTranslations>>;
}) {
  const sections: Array<[keyof typeof items, string]> = [
    ["today", t("activity.groups.today")],
    ["yesterday", t("activity.groups.yesterday")],
    ["earlier", t("activity.groups.earlier")]
  ];

  return (
    <div className="space-y-1">
      {sections.map(([key, label]) => {
        const groupItems = items[key];

        if (!groupItems.length) {
          return null;
        }

        return (
          <div key={key}>
            <p className="pb-1.5 pt-3 text-[10px] font-bold uppercase tracking-[0.08em] text-ink/30">
              {label}
            </p>
            <div className="space-y-0.5">
              {groupItems.map((item) => {
                const tone = activityTone(item);

                return (
                  <Link
                    className="flex items-start gap-2.5 rounded-[14px] px-3 py-2.5 transition hover:bg-sand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint/70"
                    href={item.href}
                    key={item.id}
                  >
                    <span
                      className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${tone.badge}`}
                    >
                      {tone.symbol}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[12.5px] leading-snug text-ink/80">{item.text}</p>
                      <p className="mt-0.5 text-[11px] text-ink/30">
                        {activityTypeLabel(item, t)} · {formatRelativeActivityTime(item.timestamp, locale)}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
