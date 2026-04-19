import clsx from "clsx";
import {avatarTone} from "@/lib/ui/avatar-color";

type AvatarInitialProps = {
  name: string;
  size?: "sm" | "md" | "lg";
};

const sizeClasses = {
  sm: "h-7 w-7 text-[11px]",
  md: "h-8 w-8 text-[13px]",
  lg: "h-10 w-10 text-[15px]"
} as const;

export function AvatarInitial({name, size = "md"}: AvatarInitialProps) {
  const tone = avatarTone(name);
  const initials = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "?";

  return (
    <div
      aria-label={name}
      className={clsx(
        "flex shrink-0 items-center justify-center rounded-full font-display font-bold",
        tone.bg,
        tone.text,
        sizeClasses[size]
      )}
      role="img"
      title={name}
    >
      {initials}
    </div>
  );
}
