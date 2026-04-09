import clsx from "clsx";

type SurfaceCardProps = {
  children: React.ReactNode;
  className?: string;
};

export function SurfaceCard({children, className}: SurfaceCardProps) {
  return (
    <section
      className={clsx(
        "rounded-[28px] border border-white/70 bg-white/90 p-5 shadow-panel backdrop-blur sm:p-6",
        className
      )}
    >
      {children}
    </section>
  );
}
