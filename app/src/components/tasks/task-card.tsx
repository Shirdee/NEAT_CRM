"use client";

import clsx from "clsx";

import {Link} from "@/i18n/navigation";
import {StatusChip} from "@/components/ui/status-chip";

type Task = {
  id: string;
  notes: string | null;
  dueDate: string | Date;
  completedAt: string | Date | null;
  companyName: string | null;
  contactName: string | null;
  taskTypeLabelEn: string | null;
  taskTypeLabelHe: string | null;
  priorityLabelEn: string | null;
  priorityLabelHe: string | null;
  statusLabelEn: string | null;
  statusLabelHe: string | null;
};

type GroupKey = "overdue" | "today" | "upcoming" | "done";

type TaskCardProps = {
  task: Task;
  locale: "en" | "he";
  groupKey: GroupKey;
  noNotesLabel: string;
  noCompanyLabel: string;
  noContactLabel: string;
};

function localizedLabel(
  locale: "en" | "he",
  values: {en?: string | null; he?: string | null}
) {
  return locale === "he" ? values.he || values.en || "—" : values.en || values.he || "—";
}

function formatTaskDate(locale: "en" | "he", value: string | Date) {
  return new Intl.DateTimeFormat(locale === "he" ? "he-IL" : "en-US", {
    month: "short",
    day: "numeric"
  }).format(new Date(value));
}

function priorityTone(label: string) {
  const normalized = label.trim().toLowerCase();

  if (normalized.includes("high") || normalized.includes("גבוה")) {
    return "coral";
  }

  if (normalized.includes("medium") || normalized.includes("בינוני")) {
    return "amber";
  }

  if (normalized.includes("low") || normalized.includes("נמוך")) {
    return "default";
  }

  return "default";
}

export function TaskCard({
  task,
  locale,
  groupKey,
  noNotesLabel,
  noCompanyLabel,
  noContactLabel
}: TaskCardProps) {
  const isDone = groupKey === "done" || Boolean(task.completedAt);
  const isOverdue = groupKey === "overdue";
  const isToday = groupKey === "today";
  const priorityLabel = localizedLabel(locale, {
    en: task.priorityLabelEn,
    he: task.priorityLabelHe
  });
  const priorityChipTone = priorityTone(priorityLabel);

  return (
    <Link
      className="group flex items-center gap-3 rounded-[10px] bg-white px-4 py-2.5 shadow-card transition hover:-translate-y-px hover:shadow-hover"
      href={`/tasks/${task.id}`}
      locale={locale}
    >
      <div
        className={clsx(
          "flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border-2 text-[10px] font-bold",
          isDone
            ? "border-transparent bg-lime/15 text-lime/80"
            : isOverdue
              ? "border-coral/20 bg-coral/10 text-coral"
              : isToday
                ? "border-amber/20 bg-amber/15 text-amber-text"
                : "border-teal/20 bg-teal/10 text-teal"
        )}
      >
        {isDone ? "✓" : "•"}
      </div>

      <div
        className={clsx(
          "h-2 w-2 shrink-0 rounded-full",
          priorityChipTone === "coral"
            ? "bg-coral"
            : priorityChipTone === "amber"
              ? "bg-amber"
              : "bg-ink/25"
        )}
      />

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p
              className={clsx(
                "truncate text-[13.5px] font-semibold leading-snug text-ink",
                isDone && "text-ink/35 line-through"
              )}
            >
              {task.notes || noNotesLabel}
            </p>
            <p className="mt-0.5 text-[12px] text-ink/50">
              {task.companyName ? (
                <span className="font-medium text-teal">{task.companyName}</span>
              ) : (
                noCompanyLabel
              )}
              {task.companyName && task.contactName ? " · " : null}
              {task.contactName || (!task.companyName ? noContactLabel : null)}
            </p>
          </div>

          <span
            className={clsx(
              "shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
              isDone
                ? "bg-ink/4 text-ink/25"
                : isOverdue
                  ? "bg-coral/10 text-coral"
                  : isToday
                    ? "bg-amber/15 text-amber-text"
                    : "bg-ink/6 text-ink/50"
            )}
          >
            {formatTaskDate(locale, task.dueDate)}
          </span>
        </div>

        <div className="mt-2 flex items-center gap-2">
          <StatusChip tone={priorityChipTone}>{priorityLabel}</StatusChip>
        </div>
      </div>
    </Link>
  );
}
