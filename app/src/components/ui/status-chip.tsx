import clsx from "clsx";

type StatusChipProps = {
  children: React.ReactNode;
  tone?: "default" | "teal" | "coral" | "amber" | "ink";
};

const toneClasses = {
  default: "bg-sand text-ink",
  teal: "bg-mint/90 text-teal",
  coral: "bg-coral/12 text-coral",
  amber: "bg-mist text-ink",
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
