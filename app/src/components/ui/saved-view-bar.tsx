"use client";

import {useMemo, useState, useTransition} from "react";

import {useRouter} from "@/i18n/navigation";
import type {SavedViewFilters, SavedViewModule} from "@/lib/data/saved-views.shared";
import {SAVED_VIEW_FILTER_KEYS, SAVED_VIEW_QUERY_PARAM} from "@/lib/data/saved-views.shared";
import {
  createSavedViewAction,
  deleteSavedViewAction,
  renameSavedViewAction
} from "@/lib/actions/saved-views";

type SavedViewOption = {id: string; name: string};

type SavedViewBarProps<M extends SavedViewModule> = {
  locale: "en" | "he";
  module: M;
  views: SavedViewOption[];
  selectedViewId: string | null;
  selectedViewName?: string | null;
  activeFilters: SavedViewFilters<M>;
};

function label(locale: "en" | "he", en: string, he: string) {
  return locale === "he" ? he : en;
}

function buildQueryFromFilters<M extends SavedViewModule>(module: M, filters: SavedViewFilters<M>) {
  const params = new URLSearchParams();
  for (const key of SAVED_VIEW_FILTER_KEYS[module]) {
    const value = (filters as Record<string, string | undefined>)[key];
    if (typeof value === "string" && value.trim()) {
      params.set(key, value);
    }
  }
  return params;
}

export function SavedViewBar<M extends SavedViewModule>({
  locale,
  module,
  views,
  selectedViewId,
  selectedViewName,
  activeFilters
}: SavedViewBarProps<M>) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const selectedName = useMemo(() => {
    if (selectedViewId && selectedViewName) return selectedViewName;
    return views.find((view) => view.id === selectedViewId)?.name ?? null;
  }, [selectedViewId, selectedViewName, views]);

  function replaceQuery(next: URLSearchParams) {
    const queryString = next.toString();
    router.replace(queryString ? `?${queryString}` : "?");
  }

  function clearView() {
    setError(null);
    const params = buildQueryFromFilters(module, activeFilters);
    replaceQuery(params);
  }

  function applyView(viewId: string) {
    setError(null);
    const params = new URLSearchParams();
    params.set(SAVED_VIEW_QUERY_PARAM, viewId);
    replaceQuery(params);
  }

  async function onCreate() {
    setError(null);
    const name = window.prompt(
      label(locale, "Name this view", "שם לתצוגה"),
      ""
    );

    if (!name) return;

    startTransition(async () => {
      const result = await createSavedViewAction({
        locale,
        module,
        name,
        filters: activeFilters
      });

      if (!result.ok) {
        setError(result.message);
        return;
      }

      applyView(result.id);
      router.refresh();
    });
  }

  async function onRename() {
    if (!selectedViewId) return;
    setError(null);
    const name = window.prompt(
      label(locale, "Rename this view", "שינוי שם לתצוגה"),
      selectedName ?? ""
    );
    if (!name) return;

    startTransition(async () => {
      const result = await renameSavedViewAction({
        locale,
        module,
        id: selectedViewId,
        name
      });

      if (!result.ok) {
        setError(result.message);
        return;
      }

      router.refresh();
    });
  }

  async function onDelete() {
    if (!selectedViewId) return;
    setError(null);
    const confirmed = window.confirm(
      label(locale, "Delete this saved view?", "למחוק את התצוגה השמורה?")
    );
    if (!confirmed) return;

    startTransition(async () => {
      const result = await deleteSavedViewAction({
        locale,
        module,
        id: selectedViewId
      });

      if (!result.ok) {
        setError(result.message);
        return;
      }

      clearView();
      router.refresh();
    });
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-col gap-3 rounded-[26px] border border-slate-200 bg-white/80 p-4 shadow-[0_10px_30px_rgba(58,48,45,0.06)] backdrop-blur sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-slate-400">
            {label(locale, "Saved views", "תצוגות שמורות")}
          </p>
          <select
            className="w-full rounded-[22px] border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 sm:w-[280px]"
            disabled={isPending}
            onChange={(event) => {
              const value = event.target.value;
              if (!value) {
                clearView();
                return;
              }
              applyView(value);
            }}
            value={selectedViewId ?? ""}
          >
            <option value="">{label(locale, "No saved view", "ללא תצוגה")}</option>
            {views.map((view) => (
              <option key={view.id} value={view.id}>
                {view.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            className="rounded-full bg-ink px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
            disabled={isPending}
            onClick={onCreate}
            type="button"
          >
            {label(locale, "Save", "שמירה")}
          </button>
          <button
            className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 disabled:opacity-60"
            disabled={!selectedViewId || isPending}
            onClick={onRename}
            type="button"
          >
            {label(locale, "Rename", "שינוי שם")}
          </button>
          <button
            className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 disabled:opacity-60"
            disabled={!selectedViewId || isPending}
            onClick={onDelete}
            type="button"
          >
            {label(locale, "Delete", "מחיקה")}
          </button>
        </div>
      </div>

      {error ? (
        <p className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800">{error}</p>
      ) : null}
    </div>
  );
}
