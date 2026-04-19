import clsx from "clsx";

export type ActivityItem = {
  id: string;
  type: "interaction" | "task_done" | "task_overdue" | "created" | "stage_change";
  text: string;
  time: string;
};

type ActivityFeedProps = {
  items: ActivityItem[];
  dateGroups?: {label: string; itemIds: string[]}[];
};

const iconConfig: Record<ActivityItem["type"], {bg: string; symbol: string}> = {
  interaction: {bg: "bg-teal/10 text-teal", symbol: "✎"},
  task_done: {bg: "bg-lime/15 text-lime/80", symbol: "✓"},
  task_overdue: {bg: "bg-coral/10 text-coral", symbol: "!"},
  created: {bg: "bg-ink/6 text-ink/50", symbol: "+"},
  stage_change: {bg: "bg-amber/15 text-amber-text", symbol: "→"}
};

export function ActivityFeed({items, dateGroups}: ActivityFeedProps) {
  const itemsById = new Map(items.map((item) => [item.id, item]));

  if (!dateGroups) {
    return (
      <div className="flex flex-col gap-0 px-5 pb-4">
        {items.map((item) => (
          <ActivityRow key={item.id} item={item} />
        ))}
      </div>
    );
  }

  return (
    <div className="px-5 pb-4">
      {dateGroups.map((group) => (
        <div key={group.label}>
          <p className="pb-1.5 pt-3 text-[10px] font-bold uppercase tracking-[0.08em] text-ink/30">
            {group.label}
          </p>
          {group.itemIds.map((id) => {
            const item = itemsById.get(id);
            return item ? <ActivityRow key={id} item={item} /> : null;
          })}
        </div>
      ))}
    </div>
  );
}

function ActivityRow({item}: {item: ActivityItem}) {
  const {bg, symbol} = iconConfig[item.type];
  return (
    <div className="flex items-start gap-2.5 py-1.5">
      <div className={clsx("mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold", bg)}>
        {symbol}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[12.5px] leading-snug text-ink/80">{item.text}</p>
        <p className="mt-0.5 text-[11px] text-ink/30">{item.time}</p>
      </div>
    </div>
  );
}
