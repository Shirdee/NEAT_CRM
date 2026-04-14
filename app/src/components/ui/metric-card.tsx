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
    <SurfaceCard className="relative overflow-hidden p-0">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-white/0 via-white/60 to-white/0" />
      <div className={clsx("flex h-full flex-col gap-2 rounded-[28px] px-3 py-4 sm:gap-3 sm:px-5 sm:py-5", toneClasses[tone])}>
        <p className="text-[10px] uppercase tracking-tight opacity-70 sm:text-xs sm:tracking-[0.24em]">{label}</p>
        <p className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">{value}</p>
        {detail ? <p className="hidden text-xs opacity-80 sm:block sm:text-sm">{detail}</p> : null}
      </div>
    </SurfaceCard>
  );
}
