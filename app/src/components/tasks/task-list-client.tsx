"use client";

import {TaskCard} from "./task-card";

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

const groupTitleColor: Record<Tab, string> = {
  overdue: "text-ink",
  today: "text-ink",
  upcoming: "text-ink",
  done: "text-ink/30"
};

const groupBadgeStyle: Record<Tab, string> = {
  overdue: "bg-coral/10 text-coral",
  today: "bg-amber/15 text-amber-text",
  upcoming: "bg-ink/6 text-ink/50",
  done: "bg-lime/15 text-lime/80"
};

const groupOrder: Array<{key: Tab; label: string}> = [
  {key: "overdue", label: "Overdue"},
  {key: "today", label: "Today"},
  {key: "upcoming", label: "Upcoming"},
  {key: "done", label: "Done"}
];

export function TaskListClient({
  groups,
  locale,
  noTasksLabel,
  noNotesLabel,
  noCompanyLabel,
  noContactLabel
}: TaskListClientProps) {
  const counts = {
    overdue: groups.overdue.length,
    today: groups.today.length,
    upcoming: groups.upcoming.length,
    done: groups.done.length
  };

  const hasAnyTasks = Object.values(counts).some((count) => count > 0);

  if (!hasAnyTasks) {
    return (
      <div className="rounded-[20px] bg-white p-5 text-sm text-ink/60 shadow-card">
        {noTasksLabel}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {groupOrder.map(({key, label}) => {
        const tasks = groups[key];

        if (tasks.length === 0) {
          return null;
        }

        return (
          <section className="flex scroll-mt-6 flex-col gap-2" id={key} key={key}>
            <div className="flex items-center gap-2 py-1">
              <h2 className={["font-display text-[13px] font-bold", groupTitleColor[key]].join(" ")}>
                {label}
              </h2>
              <span className={["rounded-full px-2 py-0.5 text-[11px] font-semibold", groupBadgeStyle[key]].join(" ")}>
                {counts[key]}
              </span>
            </div>

            <div className="flex flex-col gap-2">
              {tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  locale={locale}
                  noCompanyLabel={noCompanyLabel}
                  noContactLabel={noContactLabel}
                  noNotesLabel={noNotesLabel}
                  task={task}
                  groupKey={key}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
