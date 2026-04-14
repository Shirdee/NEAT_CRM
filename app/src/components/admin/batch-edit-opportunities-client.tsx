"use client";

import {useMemo, useState, useTransition} from "react";

import {batchUpdateOpportunitiesAction} from "@/lib/actions/batch-edit";

type Option = {id: string; label: string};

type OpportunityRow = {
  id: string;
  opportunityName: string;
  statusValueId: string;
  opportunityStageValueId: string;
};

type Props = {
  locale: "en" | "he";
  opportunities: OpportunityRow[];
  stageOptions: Option[];
  statusOptions: Option[];
};

function label(locale: "en" | "he", en: string, he: string) {
  return locale === "he" ? he : en;
}

export function BatchEditOpportunitiesClient({locale, opportunities, stageOptions, statusOptions}: Props) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [opportunityStageValueId, setStage] = useState("");
  const [statusValueId, setStatus] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const allSelected = selectedIds.length > 0 && selectedIds.length === opportunities.length;
  const canApply = selectedIds.length > 0 && (opportunityStageValueId || statusValueId);

  const selectionLabel = useMemo(() => {
    return label(locale, `${selectedIds.length} selected`, `${selectedIds.length} נבחרו`);
  }, [locale, selectedIds.length]);

  function toggle(id: string) {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  }

  function toggleAll() {
    setSelectedIds(allSelected ? [] : opportunities.map((opportunity) => opportunity.id));
  }

  function apply() {
    setError(null);
    setDone(null);

    startTransition(async () => {
      const result = await batchUpdateOpportunitiesAction({
        locale,
        ids: selectedIds,
        opportunityStageValueId: opportunityStageValueId || undefined,
        statusValueId: statusValueId || undefined
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
                {label(locale, "Stage", "שלב")}
              </span>
              <select
                className="rounded-[20px] border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
                disabled={isPending}
                onChange={(event) => setStage(event.target.value)}
                value={opportunityStageValueId}
              >
                <option value="">{label(locale, "No change", "ללא שינוי")}</option>
                {stageOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-1">
              <span className="block text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
                {label(locale, "Status", "סטטוס")}
              </span>
              <select
                className="rounded-[20px] border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
                disabled={isPending}
                onChange={(event) => setStatus(event.target.value)}
                value={statusValueId}
              >
                <option value="">{label(locale, "No change", "ללא שינוי")}</option>
                {statusOptions.map((option) => (
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
          <span className="text-slate-500">
            {label(locale, `${opportunities.length} opportunities`, `${opportunities.length} הזדמנויות`)}
          </span>
        </div>
        <div className="divide-y divide-slate-100">
          {opportunities.map((opportunity) => {
            const checked = selectedIds.includes(opportunity.id);
            return (
              <label className="flex items-center gap-3 px-4 py-3" key={opportunity.id}>
                <input checked={checked} onChange={() => toggle(opportunity.id)} type="checkbox" />
                <span className="font-medium text-ink">{opportunity.opportunityName}</span>
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
}

