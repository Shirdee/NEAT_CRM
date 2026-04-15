type InfoPairProps = {
  label: string;
  value: React.ReactNode;
  accent?: "default" | "teal" | "coral";
};

const accentClasses = {
  default: "text-ink/45",
  teal: "text-teal",
  coral: "text-coral"
} as const;

export function InfoPair({label, value, accent = "default"}: InfoPairProps) {
  return (
    <div className="space-y-1 rounded-[22px] bg-mist/80 px-3 py-3">
      <p className={`text-[11px] uppercase tracking-[0.24em] ${accentClasses[accent]}`}>{label}</p>
      <div className="text-sm text-ink/80">{value}</div>
    </div>
  );
}
