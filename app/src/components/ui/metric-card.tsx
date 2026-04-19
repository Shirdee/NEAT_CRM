import clsx from "clsx";

type MetricCardProps = {
  label: string;
  value: string | number;
  sub?: string;
  detail?: string;
  tone?: "coral" | "amber" | "teal" | "lime" | "ink";
};

const valueTone = {
  coral: "text-coral",
  amber: "text-amber-text",
  teal: "text-teal",
  lime: "text-lime/80",
  ink: "text-ink"
} as const;

export function MetricCard({label, value, sub, detail, tone = "teal"}: MetricCardProps) {
  const supportingText = sub ?? detail;

  return (
    <div className="flex flex-col gap-1.5 rounded-[20px] bg-white p-5 shadow-card transition-shadow hover:shadow-hover">
      <p className="text-[11px] font-semibold uppercase tracking-[0.07em] text-ink/50">
        {label}
      </p>
      <p className={clsx("font-display text-4xl font-extrabold leading-none", valueTone[tone])}>
        {value}
      </p>
      {supportingText ? (
        <p className="mt-1 text-xs text-ink/40">{supportingText}</p>
      ) : null}
    </div>
  );
}
