type InfoPairProps = {
  label: string;
  value: React.ReactNode;
  accent?: "default" | "teal" | "coral";
};

const accentClasses = {
  default: "text-ink/55",
  teal: "text-teal",
  coral: "text-coral"
} as const;

export function InfoPair({label, value, accent = "default"}: InfoPairProps) {
  return (
    <div className="space-y-1.5 rounded-[20px] bg-mist/70 px-4 py-3.5">
      <p className={`text-[10px] font-semibold uppercase tracking-[0.22em] ${accentClasses[accent]}`}>{label}</p>
      <div className="text-sm leading-6 text-ink/85">{value}</div>
    </div>
  );
}
