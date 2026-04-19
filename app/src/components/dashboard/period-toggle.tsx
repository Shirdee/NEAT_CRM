"use client";

import {useMemo} from "react";
import {useSearchParams} from "next/navigation";

import {usePathname, useRouter} from "@/i18n/navigation";

type PeriodKey = "7" | "30" | "90";

type PeriodToggleProps = {
  value: PeriodKey;
};

const PERIODS: Array<{value: PeriodKey; label: string}> = [
  {value: "7", label: "7d"},
  {value: "30", label: "30d"},
  {value: "90", label: "90d"}
];

export function PeriodToggle({value}: PeriodToggleProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentParams = useMemo(() => new URLSearchParams(searchParams.toString()), [searchParams]);

  function setPeriod(nextValue: PeriodKey) {
    const params = new URLSearchParams(currentParams);
    params.set("period", nextValue);
    const queryString = params.toString();
    router.push(queryString ? `${pathname}?${queryString}` : pathname);
  }

  return (
    <div className="inline-flex h-8 items-center rounded-full bg-white/10 p-1">
      {PERIODS.map((period) => {
        const active = period.value === value;

        return (
          <button
            aria-pressed={active}
            className={[
              "inline-flex h-6 items-center justify-center rounded-full px-3 text-[11px] font-semibold uppercase tracking-[0.16em] transition",
              active
                ? "bg-teal text-white"
                : "bg-transparent text-white/65 hover:bg-white/10 hover:text-white"
            ].join(" ")}
            key={period.value}
            onClick={() => setPeriod(period.value)}
            type="button"
          >
            {period.label}
          </button>
        );
      })}
    </div>
  );
}
