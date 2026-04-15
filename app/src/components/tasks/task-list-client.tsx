"use client";

import {useState} from "react";

import {Link} from "@/i18n/navigation";
import {StatusChip} from "@/components/ui/status-chip";
import {SurfaceCard} from "@/components/ui/surface-card";
import {TaskFilterTabs} from "./task-filter-tabs";

type Tab = "overdue" | "today" | "upcoming" | "done";

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

type Groups = Record<Tab, Task[]>;

type TaskListClientProps = {
  groups: Groups;
  locale: "en" | "he";
  noTasksLabel: string;
  noNotesLabel: string;
  noCompanyLabel: string;
  noContactLabel: string;
};

function labelForLocale(
  locale: "en" | "he",
  values: {en?: string | null; he?: string | null}
) {
  return locale === "he" ? values.he || values.en || "—" : values.en || values.he || "—";
}

const toneBorder: Record<Tab, string> = {
  overdue: "border-l-coral",
  today: "border-l-amber",
  upcoming: "border-l-teal",
  done: "border-l-slate-300"
};

const toneChip: Record<Tab, "coral" | "amber" | "teal" | "default"> = {
  overdue: "coral",
  today: "amber",
  upcoming: "teal",
  done: "default"
};

export function TaskListClient({
  groups,
  locale,
  noTasksLabel,
  noNotesLabel,
  noCompanyLabel
}: TaskListClientProps) {
  const [activeTab, setActiveTab] = useState<Tab>("overdue");
  const counts = {
    overdue: groups.overdue.length,
    today: groups.today.length,
    upcoming: groups.upcoming.length,
    done: groups.done.length
  };
  const tasks = groups[activeTab];

  return (
    <div className="space-y-4">
      <TaskFilterTabs active={activeTab} counts={counts} onChange={setActiveTab} />

      {tasks.length === 0 ? (
        <SurfaceCard className="bg-[linear-gradient(180deg,rgba(255,255,255,0.9),rgba(249,235,231,0.92))] p-5 text-sm text-slate-600">
          {noTasksLabel}
        </SurfaceCard>
      ) : (
        <div className="divide-y divide-slate-100 overflow-hidden rounded bg-white">
          {tasks.map((task) => (
            <Link
              className={[
                "block border-l-4 bg-white transition",
                "hover:bg-slate-50/70",
                "py-2.5 px-3",
                toneBorder[activeTab]
              ].join(" ")}
              href={`/tasks/${task.id}`}
              key={task.id}
              locale={locale}
            >
              {/* Priority chip + date row — always visible */}
              <div className="mb-1 flex items-center justify-between gap-2">
                <StatusChip tone={toneChip[activeTab]}>
                  {labelForLocale(locale, {
                    en: task.priorityLabelEn,
                    he: task.priorityLabelHe
                  })}
                </StatusChip>
                <span className="text-xs font-medium tabular-nums text-slate-500">
                  {new Intl.DateTimeFormat(locale === "he" ? "he-IL" : "en-US", {
                    month: "short",
                    day: "numeric"
                  }).format(new Date(task.dueDate))}
                </span>
              </div>

              {/* Title */}
              <p className={[
                "text-sm font-semibold leading-snug",
                activeTab === "done" ? "text-slate-400 line-through" : "text-ink"
              ].join(" ")}>
                {task.notes || noNotesLabel}
              </p>

              {/* Company / contact — compact row */}
              <p className="mt-0.5 text-xs text-slate-500">
                {task.companyName || task.contactName || noCompanyLabel}
                {task.companyName && task.contactName ? (
                  <span className="mx-1.5 opacity-40">·</span>
                ) : null}
                {task.companyName && task.contactName ? task.contactName : null}
              </p>

              {/* Type chip + status — only on larger screens */}
              <div className="mt-1.5 hidden gap-1.5 sm:flex">
                <StatusChip>
                  {labelForLocale(locale, {
                    en: task.taskTypeLabelEn,
                    he: task.taskTypeLabelHe
                  })}
                </StatusChip>
                <StatusChip>
                  {labelForLocale(locale, {
                    en: task.statusLabelEn,
                    he: task.statusLabelHe
                  })}
                </StatusChip>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
