import clsx from "clsx";

type SurfaceCardProps = {
  children: React.ReactNode;
  className?: string;
};

export function SurfaceCard({children, className}: SurfaceCardProps) {
  const hasCustomBg = className?.split(/\s+/).some((c) => /^bg-/.test(c));
  return (
    <section
      className={clsx(
        "min-w-0 w-full rounded-[24px] p-5 shadow-card sm:p-6",
        !hasCustomBg && "bg-white/95",
        className
      )}
    >
      {children}
    </section>
  );
}
