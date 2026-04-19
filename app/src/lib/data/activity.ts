import {listInteractions, listOpportunities, listTasks} from "./crm";

export type ActivityItem = {
  id: string;
  type: "interaction" | "task_done" | "task_overdue" | "created" | "stage_change";
  timestamp: number;
  text: string;
  href: string;
};

const DAY_MS = 24 * 60 * 60 * 1000;

function toTimestamp(value: Date | string | null | undefined) {
  if (!value) return 0;
  return new Date(value).getTime();
}

function sortNewestFirst(a: ActivityItem, b: ActivityItem) {
  return b.timestamp - a.timestamp;
}

function isOverdue(dueDate: Date | string | null | undefined, now: number) {
  if (!dueDate) return false;
  return toTimestamp(dueDate) < now;
}

export async function getRecentActivity(limit = 10): Promise<ActivityItem[]> {
  const now = Date.now();
  const [interactions, tasks, opportunities] = await Promise.all([
    listInteractions(),
    listTasks(),
    listOpportunities()
  ]);

  const interactionItems: ActivityItem[] = interactions.map((interaction) => ({
    id: `interaction-${interaction.id}`,
    type: "interaction",
    timestamp: toTimestamp(interaction.updatedAt ?? interaction.interactionDate),
    text: interaction.subject,
    href: `/interactions/${interaction.id}`
  }));

  const taskItems: ActivityItem[] = tasks.flatMap((task): ActivityItem[] => {
    if (task.completedAt) {
      return [
        {
          id: `task-done-${task.id}`,
          type: "task_done",
          timestamp: toTimestamp(task.completedAt),
          text: task.notes || task.companyName || task.contactName || "Task completed",
          href: `/tasks/${task.id}`
        }
      ];
    }

    if (isOverdue(task.dueDate, now)) {
      return [
        {
          id: `task-overdue-${task.id}`,
          type: "task_overdue",
          timestamp: toTimestamp(task.updatedAt ?? task.dueDate),
          text: task.notes || task.companyName || task.contactName || "Follow-up task",
          href: `/tasks/${task.id}`
        }
      ];
    }

    return [];
  });
  const opportunityItems: ActivityItem[] = opportunities.map((opportunity) => ({
    id: `opportunity-${opportunity.id}`,
    type: "created",
    timestamp: toTimestamp(opportunity.updatedAt ?? opportunity.createdAt),
    text: opportunity.opportunityName,
    href: `/opportunities/${opportunity.id}`
  }));

  return [...interactionItems, ...taskItems, ...opportunityItems]
    .filter((item) => item.timestamp > 0)
    .sort(sortNewestFirst)
    .slice(0, limit);
}

export function formatRelativeActivityTime(timestamp: number, locale: "en" | "he", now = Date.now()) {
  const elapsed = timestamp - now;
  const absElapsed = Math.abs(elapsed);
  const units: Array<[Intl.RelativeTimeFormatUnit, number]> = [
    ["year", 365 * DAY_MS],
    ["month", 30 * DAY_MS],
    ["week", 7 * DAY_MS],
    ["day", DAY_MS],
    ["hour", 60 * 60 * 1000],
    ["minute", 60 * 1000]
  ];

  const [unit, unitMs] = units.find(([, threshold]) => absElapsed >= threshold) ?? ["minute", 60 * 1000];
  const value = Math.round(elapsed / unitMs);

  return new Intl.RelativeTimeFormat(locale === "he" ? "he" : "en", {numeric: "auto"}).format(value, unit);
}

export function getOpenDealValue(snapshot: import("./crm").DashboardSnapshot) {
  const extended = snapshot as import("./crm").DashboardSnapshot & {openDealValue?: number};
  return typeof extended.openDealValue === "number" ? extended.openDealValue : null;
}
