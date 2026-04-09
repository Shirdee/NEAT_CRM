import clsx from "clsx";

import {SurfaceCard} from "./surface-card";

type FilterShellProps = {
  children: React.ReactNode;
  className?: string;
};

export function FilterShell({children, className}: FilterShellProps) {
  return (
    <SurfaceCard
      className={clsx(
        "rounded-[28px] border-slate-200/80 bg-white/95 p-4 sm:p-5 lg:sticky lg:top-5",
        className
      )}
    >
      {children}
    </SurfaceCard>
  );
}
