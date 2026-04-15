import clsx from "clsx";

import {SurfaceCard} from "./surface-card";

type MetricCardProps = {
  label: string;
  value: string;
  tone?: "ink" | "teal" | "coral" | "amber";
  detail?: string;
};

const toneClasses = {
  ink: "bg-ink text-white",
  teal: "bg-teal text-white",
  coral: "bg-coral text-white",
  amber: "bg-amber text-ink"
} as const;

export function MetricCard({label, value, tone = "ink", detail}: MetricCardProps) {
  return (
    <SurfaceCard className="relative min-w-0 overflow-hidden p-0">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-white/0 via-white/60 to-white/0" />
      <div className={clsx("flex h-full min-w-0 w-full flex-col gap-3 rounded-[28px] px-5 py-5", toneClasses[tone])}>
        <p className="text-xs uppercase tracking-[0.24em] opacity-70">{label}</p>
        <p className="font-display text-3xl font-semibold tracking-tight">{value}</p>
        {detail ? <p className="text-sm opacity-80">{detail}</p> : null}
      </div>
    </SurfaceCard>
  );
}
