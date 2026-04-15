"use client";

import clsx from "clsx";

type Tab = "overdue" | "today" | "upcoming" | "done";

type TaskFilterTabsProps = {
  active: Tab;
  counts: Record<Tab, number>;
  onChange: (tab: Tab) => void;
};

const TABS: {key: Tab; label: string}[] = [
  {key: "overdue", label: "Overdue"},
  {key: "today", label: "Today"},
  {key: "upcoming", label: "Upcoming"},
  {key: "done", label: "Done"}
];

const toneClasses: Record<Tab, string> = {
  overdue: "bg-coral text-white shadow-[0_4px_14px_rgba(221,107,77,0.26)]",
  today: "bg-mist text-ink shadow-[0_4px_14px_rgba(16,36,63,0.08)]",
  upcoming: "bg-mint text-teal shadow-[0_4px_14px_rgba(15,118,110,0.18)]",
  done: "bg-ink text-white shadow-[0_4px_14px_rgba(16,36,63,0.22)]"
};

export function TaskFilterTabs({active, counts, onChange}: TaskFilterTabsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {TABS.map(({key, label}) => (
        <button
          className={clsx(
            "flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition",
            active === key
              ? toneClasses[key]
              : "bg-white/80 text-ink/55 hover:bg-white hover:text-ink/80"
          )}
          key={key}
          onClick={() => onChange(key)}
          type="button"
        >
          {label}
          <span
            className={clsx(
              "flex h-5 min-w-[1.25rem] items-center justify-center rounded-full px-1 text-[10px] font-bold",
              active === key ? "bg-white/25" : "bg-sand text-ink/55"
            )}
          >
            {counts[key]}
          </span>
        </button>
      ))}
    </div>
  );
}
