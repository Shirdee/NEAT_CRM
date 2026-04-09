type InfoPairProps = {
  label: string;
  value: React.ReactNode;
  accent?: "default" | "teal" | "coral";
};

const accentClasses = {
  default: "text-slate-400",
  teal: "text-teal",
  coral: "text-coral"
} as const;

export function InfoPair({label, value, accent = "default"}: InfoPairProps) {
  return (
    <div className="space-y-1 rounded-[22px] bg-[rgba(244,229,225,0.75)] px-3 py-3">
      <p className={`text-[11px] uppercase tracking-[0.24em] ${accentClasses[accent]}`}>{label}</p>
      <div className="text-sm text-slate-700">{value}</div>
    </div>
  );
}
