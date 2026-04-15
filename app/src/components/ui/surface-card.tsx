import clsx from "clsx";

type SurfaceCardProps = {
  children: React.ReactNode;
  className?: string;
};

export function SurfaceCard({children, className}: SurfaceCardProps) {
  return (
    <section
      className={clsx(
        "min-w-0 w-full rounded-[28px] bg-white/95 p-5 shadow-[0_12px_40px_rgba(58,48,45,0.08)] backdrop-blur sm:p-6",
        className
      )}
    >
      {children}
    </section>
  );
}
