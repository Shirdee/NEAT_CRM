"use client";

import {useSearchParams} from "next/navigation";

import {usePathname, useRouter} from "@/i18n/navigation";
import type {AppLocale} from "@/i18n/routing";

type ViewToggleProps = {
  current: "table" | "pipeline";
  locale: AppLocale;
};

function label(locale: AppLocale, table: string, pipeline: string) {
  return locale === "he" ? pipeline : table;
}

export function ViewToggle({current, locale}: ViewToggleProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  function setView(nextView: "table" | "pipeline") {
    const params = new URLSearchParams(searchParams.toString());

    if (nextView === "pipeline") {
      params.set("view", "pipeline");
    } else {
      params.delete("view");
    }

    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
  }

  return (
    <div className="inline-flex rounded-full border border-sand bg-white/90 p-1 shadow-[0_8px_24px_rgba(58,48,45,0.05)]">
      <button
        aria-pressed={current === "table"}
        className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
          current === "table" ? "bg-ink text-white" : "text-ink/60 hover:text-ink"
        }`}
        onClick={() => setView("table")}
        type="button"
      >
        {label(locale, "Table", "טבלה")}
      </button>
      <button
        aria-pressed={current === "pipeline"}
        className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
          current === "pipeline" ? "bg-ink text-white" : "text-ink/60 hover:text-ink"
        }`}
        onClick={() => setView("pipeline")}
        type="button"
      >
        {label(locale, "Pipeline", "צינור")}
      </button>
    </div>
  );
}
