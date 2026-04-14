"use client";

import {useMemo, useState, useTransition} from "react";

import {batchUpdateCompaniesAction} from "@/lib/actions/batch-edit";

type Option = {id: string; label: string};

type CompanyRow = {
  id: string;
  companyName: string;
  sourceValueId: string | null;
  stageValueId: string | null;
};

type Props = {
  locale: "en" | "he";
  companies: CompanyRow[];
  sourceOptions: Option[];
  stageOptions: Option[];
};

function label(locale: "en" | "he", en: string, he: string) {
  return locale === "he" ? he : en;
}

export function BatchEditCompaniesClient({locale, companies, sourceOptions, stageOptions}: Props) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [sourceValueId, setSourceValueId] = useState("");
  const [stageValueId, setStageValueId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const allSelected = selectedIds.length > 0 && selectedIds.length === companies.length;
  const canApply = selectedIds.length > 0 && (sourceValueId || stageValueId);

  const selectionLabel = useMemo(() => {
    return label(locale, `${selectedIds.length} selected`, `${selectedIds.length} נבחרו`);
  }, [locale, selectedIds.length]);

  function toggle(id: string) {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  }

  function toggleAll() {
    setSelectedIds(allSelected ? [] : companies.map((company) => company.id));
  }

  function apply() {
    setError(null);
    setDone(null);

    startTransition(async () => {
      const result = await batchUpdateCompaniesAction({
        locale,
        ids: selectedIds,
        sourceValueId: sourceValueId || undefined,
        stageValueId: stageValueId || undefined
      });

      if (!result.ok) {
        setError(result.message);
        return;
      }

      setDone(label(locale, "Updated successfully.", "עודכן בהצלחה."));
      setSelectedIds([]);
    });
  }

  return (
    <div className="space-y-5">
      <div className="rounded-[26px] border border-slate-200 bg-white/80 p-4 shadow-[0_10px_30px_rgba(58,48,45,0.06)] backdrop-blur">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-slate-400">
              {label(locale, "Batch edit", "עריכה מרובה")}
            </p>
            <p className="text-sm text-slate-700">{selectionLabel}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <label className="space-y-1">
              <span className="block text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
                {label(locale, "Source", "מקור")}
              </span>
              <select
                className="rounded-[20px] border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
                disabled={isPending}
                onChange={(event) => setSourceValueId(event.target.value)}
                value={sourceValueId}
              >
                <option value="">{label(locale, "No change", "ללא שינוי")}</option>
                {sourceOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-1">
              <span className="block text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
                {label(locale, "Stage", "שלב")}
              </span>
              <select
                className="rounded-[20px] border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
                disabled={isPending}
                onChange={(event) => setStageValueId(event.target.value)}
                value={stageValueId}
              >
                <option value="">{label(locale, "No change", "ללא שינוי")}</option>
                {stageOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <button
              className="h-[42px] rounded-full bg-ink px-5 text-sm font-medium text-white disabled:opacity-60"
              disabled={!canApply || isPending}
              onClick={apply}
              type="button"
            >
              {label(locale, "Apply", "החל")}
            </button>
          </div>
        </div>

        {error ? (
          <p className="mt-3 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800">{error}</p>
        ) : null}
        {done ? (
          <p className="mt-3 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{done}</p>
        ) : null}
      </div>

      <div className="rounded-[24px] border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 text-sm">
          <label className="flex items-center gap-2 text-slate-700">
            <input checked={allSelected} onChange={toggleAll} type="checkbox" />
            {label(locale, "Select all", "בחר הכל")}
          </label>
          <span className="text-slate-500">{label(locale, `${companies.length} companies`, `${companies.length} חברות`)}</span>
        </div>
        <div className="divide-y divide-slate-100">
          {companies.map((company) => {
            const checked = selectedIds.includes(company.id);
            return (
              <label className="flex items-center gap-3 px-4 py-3" key={company.id}>
                <input checked={checked} onChange={() => toggle(company.id)} type="checkbox" />
                <span className="font-medium text-ink">{company.companyName}</span>
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
}

