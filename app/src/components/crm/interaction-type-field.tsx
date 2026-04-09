"use client";

import {useEffect, useState} from "react";

import type {AppLocale} from "@/i18n/routing";
import type {LookupOption} from "@/lib/data/crm";

type InteractionTypeFieldProps = {
  locale: AppLocale;
  name: string;
  options: LookupOption[];
  value?: string;
};

function lookupLabel(option: LookupOption, locale: AppLocale) {
  return locale === "he" ? option.labelHe : option.labelEn;
}

export function InteractionTypeField({
  locale,
  name,
  options,
  value
}: InteractionTypeFieldProps) {
  const [selectedId, setSelectedId] = useState(value ?? "");

  useEffect(() => {
    setSelectedId(value ?? "");
  }, [value]);

  return (
    <div className="space-y-2 text-sm text-slate-700">
      <input name={name} type="hidden" value={selectedId} />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {options.map((option) => {
          const isSelected = selectedId === option.id;

          return (
            <button
              aria-pressed={isSelected}
              className={`rounded-[20px] border p-4 text-left transition ${
                isSelected
                  ? "border-coral bg-mist text-ink shadow-soft"
                  : "border-slate-200 bg-white text-slate-700 hover:border-coral/50 hover:bg-mist"
              }`}
              key={option.id}
              onClick={() => setSelectedId(option.id)}
              type="button"
            >
              <span className="text-sm font-medium">{lookupLabel(option, locale)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
