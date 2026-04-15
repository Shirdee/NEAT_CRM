"use client";

import {useState} from "react";

import type {AppLocale} from "@/i18n/routing";
import type {LookupOption} from "@/lib/data/crm";

type InteractionTypeFieldProps = {
  invalid?: boolean;
  locale: AppLocale;
  name: string;
  options: LookupOption[];
  value?: string;
};

function lookupLabel(option: LookupOption, locale: AppLocale) {
  return locale === "he" ? option.labelHe : option.labelEn;
}

export function InteractionTypeField({
  invalid,
  locale,
  name,
  options,
  value
}: InteractionTypeFieldProps) {
  const [selectedId, setSelectedId] = useState(value ?? "");

  return (
    <div className="space-y-2 text-sm text-ink/70">
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
                  : invalid
                    ? "border-coral bg-sand/70 text-ink/70 hover:border-coral/50 hover:bg-mist"
                    : "border-sand/70 bg-white text-ink/70 hover:border-coral/50 hover:bg-mist"
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
