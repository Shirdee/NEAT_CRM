"use client";

import {useState} from "react";

import {Link} from "@/i18n/navigation";
import {InfoPair} from "@/components/ui/info-pair";
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

function formatDate(locale: "en" | "he", value: Date | string) {
  return new Intl.DateTimeFormat(locale === "he" ? "he-IL" : "en-US", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
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
  noCompanyLabel,
  noContactLabel
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
        <SurfaceCard className="bg-[linear-gradient(180deg,rgba(255,255,255,0.9),rgba(249,235,231,0.92))] p-8 text-sm text-slate-600">
          {noTasksLabel}
        </SurfaceCard>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <Link
              className={[
                "block rounded-[28px] bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(249,235,231,0.84))]",
                "border-l-4 pl-4 shadow-[0_12px_32px_rgba(58,48,45,0.06)] transition",
                "hover:-translate-y-0.5 hover:shadow-[0_18px_36px_rgba(58,48,45,0.1)]",
                "pr-4 pt-4 pb-4 sm:pr-5 sm:pt-5 sm:pb-5",
                toneBorder[activeTab]
              ].join(" ")}
              href={`/tasks/${task.id}`}
              key={task.id}
              locale={locale}
            >
              <div className="space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-2">
                    <p
                      className={[
                        "text-lg font-semibold",
                        activeTab === "done" ? "text-slate-400 line-through" : "text-ink"
                      ].join(" ")}
                    >
                      {task.notes || noNotesLabel}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <StatusChip tone={toneChip[activeTab]}>
                        {labelForLocale(locale, {
                          en: task.priorityLabelEn,
                          he: task.priorityLabelHe
                        })}
                      </StatusChip>
                      <StatusChip>
                        {labelForLocale(locale, {
                          en: task.statusLabelEn,
                          he: task.statusLabelHe
                        })}
                      </StatusChip>
                    </div>
                  </div>
                  <div className="text-sm font-medium text-slate-500">
                    {formatDate(locale, task.dueDate)}
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <InfoPair
                    label={locale === "he" ? "סוג" : "Type"}
                    value={labelForLocale(locale, {
                      en: task.taskTypeLabelEn,
                      he: task.taskTypeLabelHe
                    })}
                  />
                  <InfoPair
                    label={locale === "he" ? "חברה" : "Company"}
                    value={task.companyName || noCompanyLabel}
                  />
                  <InfoPair
                    label={locale === "he" ? "איש קשר" : "Contact"}
                    value={task.contactName || noContactLabel}
                  />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
