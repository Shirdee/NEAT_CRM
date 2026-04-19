import clsx from "clsx";

type InfoCellProps = {
  label: string;
  value: React.ReactNode;
  tone?: "default" | "teal" | "amber";
};

const valueTone = {
  default: "text-ink/80",
  teal: "text-teal",
  amber: "text-amber-text"
} as const;

export function InfoCell({label, value, tone = "default"}: InfoCellProps) {
  return (
    <div className="rounded-[12px] bg-mist px-4 py-3.5">
      <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.08em] text-ink/40">
        {label}
      </p>
      <p className={clsx("text-[13.5px] font-medium", valueTone[tone])}>{value ?? "—"}</p>
    </div>
  );
}
