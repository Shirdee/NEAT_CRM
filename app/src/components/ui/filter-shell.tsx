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
        "rounded-[30px] bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(249,235,231,0.96))] p-4 sm:p-5 lg:sticky lg:top-5",
        className
      )}
    >
      {children}
    </SurfaceCard>
  );
}
