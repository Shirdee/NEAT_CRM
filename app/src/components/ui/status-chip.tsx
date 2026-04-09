import clsx from "clsx";

type StatusChipProps = {
  children: React.ReactNode;
  tone?: "default" | "teal" | "coral" | "amber" | "ink";
};

const toneClasses = {
  default: "bg-slate-100 text-slate-700",
  teal: "bg-mint text-teal",
  coral: "bg-coral/10 text-coral",
  amber: "bg-amber/20 text-amber-900",
  ink: "bg-ink text-white"
} as const;

export function StatusChip({children, tone = "default"}: StatusChipProps) {
  return (
    <span
      className={clsx(
        "inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]",
        toneClasses[tone]
      )}
    >
      {children}
    </span>
  );
}
