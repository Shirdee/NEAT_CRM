import clsx from "clsx";

type StatusChipProps = {
  children: React.ReactNode;
  tone?: "default" | "teal" | "coral" | "amber" | "lime" | "ink";
};

const toneClasses = {
  default: "bg-sand text-ink/70",
  teal: "bg-teal/10 text-teal",
  coral: "bg-coral/10 text-coral",
  amber: "bg-amber/15 text-amber-text",
  lime: "bg-lime/15 text-lime/80",
  ink: "bg-ink text-white"
} as const;

export function StatusChip({children, tone = "default"}: StatusChipProps) {
  return (
    <span
      className={clsx(
        "inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]",
        toneClasses[tone]
      )}
    >
      {children}
    </span>
  );
}
