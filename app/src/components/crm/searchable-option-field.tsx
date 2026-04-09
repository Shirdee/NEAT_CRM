"use client";

import {useEffect, useMemo, useState} from "react";

type SearchableOption = {
  id: string;
  label: string;
};

type SearchableOptionFieldProps = {
  emptyLabel: string;
  invalid?: boolean;
  label: string;
  name: string;
  noResultsLabel: string;
  onValueChange?: (value: string) => void;
  options: SearchableOption[];
  placeholder: string;
  searchPlaceholder: string;
  value?: string;
};

export function SearchableOptionField({
  emptyLabel,
  invalid,
  label,
  name,
  noResultsLabel,
  onValueChange,
  options,
  placeholder,
  searchPlaceholder,
  value
}: SearchableOptionFieldProps) {
  const selectedOption = useMemo(
    () => options.find((option) => option.id === value) ?? null,
    [options, value]
  );
  const [query, setQuery] = useState(selectedOption?.label ?? "");
  const [selectedId, setSelectedId] = useState(value ?? "");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setSelectedId(value ?? "");
    setQuery(selectedOption?.label ?? "");
  }, [selectedOption, value]);

  const filteredOptions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return options.slice(0, 8);
    }

    return options
      .filter((option) => option.label.toLowerCase().includes(normalizedQuery))
      .slice(0, 8);
  }, [options, query]);

  return (
    <div className="space-y-2 text-sm text-slate-700">
      <span className="font-medium">{label}</span>
      <input name={name} type="hidden" value={selectedId} />
      <div className="relative">
        <input
          autoComplete="off"
          className={`w-full rounded-2xl border px-4 py-3 ${invalid ? "border-amber-500 bg-amber-50" : "border-slate-200"}`}
          onBlur={() => {
            window.setTimeout(() => {
              setIsOpen(false);

              if (!selectedId) {
                setQuery("");
                return;
              }

              const selected = options.find((option) => option.id === selectedId);
              setQuery(selected?.label ?? "");
            }, 120);
          }}
          onChange={(event) => {
            setQuery(event.target.value);
            setSelectedId("");
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={selectedId ? searchPlaceholder : placeholder}
          value={query}
        />
        {query ? (
          <button
            className="absolute end-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-500"
            onClick={() => {
              setQuery("");
              setSelectedId("");
              setIsOpen(false);
              onValueChange?.("");
            }}
            type="button"
          >
            Clear
          </button>
        ) : null}
        {isOpen ? (
          <div className="absolute z-20 mt-2 max-h-64 w-full overflow-auto rounded-[20px] border border-slate-200 bg-white p-2 shadow-soft">
            <button
              className={`block w-full rounded-2xl px-3 py-2 text-left text-sm ${
                !selectedId ? "bg-mist text-ink" : "text-slate-700 hover:bg-mist"
              }`}
            onMouseDown={(event) => {
              event.preventDefault();
              setSelectedId("");
              setQuery("");
              setIsOpen(false);
              onValueChange?.("");
            }}
            type="button"
          >
              {emptyLabel}
            </button>
            {filteredOptions.length === 0 ? (
              <p className="px-3 py-2 text-sm text-slate-500">{noResultsLabel}</p>
            ) : (
              filteredOptions.map((option) => (
                <button
                  className={`block w-full rounded-2xl px-3 py-2 text-left text-sm ${
                    selectedId === option.id ? "bg-mist text-ink" : "text-slate-700 hover:bg-mist"
                  }`}
                  key={option.id}
                  onMouseDown={(event) => {
                    event.preventDefault();
                    setSelectedId(option.id);
                    setQuery(option.label);
                    setIsOpen(false);
                    onValueChange?.(option.id);
                  }}
                  type="button"
                >
                  {option.label}
                </button>
              ))
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
