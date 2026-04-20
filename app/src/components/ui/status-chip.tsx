import clsx from "clsx";

type StatusChipProps = {
  children: React.ReactNode;
  tone?: "default" | "teal" | "coral" | "amber" | "lime" | "ink";
};

const toneClasses = {
  default: "bg-sand text-ink/80",
  teal: "bg-teal/12 text-teal",
  coral: "bg-coral/12 text-coral",
  amber: "bg-amber/20 text-amber-text",
  lime: "bg-lime/18 text-lime/90",
  ink: "bg-ink text-white"
} as const;

export function StatusChip({children, tone = "default"}: StatusChipProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em]",
        toneClasses[tone]
      )}
    >
      {children}
    </span>
  );
}
