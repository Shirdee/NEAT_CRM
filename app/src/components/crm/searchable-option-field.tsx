"use client";

import {useMemo, useState} from "react";

type SearchableOption = {
  id: string;
  label: string;
};

type SearchableOptionFieldProps = {
  clearLabel?: string;
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
  clearLabel = "Clear",
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
  const isControlled = Boolean(onValueChange);
  const [uncontrolledSelectedId, setUncontrolledSelectedId] = useState(value ?? "");
  const selectedId = isControlled ? (value ?? "") : uncontrolledSelectedId;
  const [query, setQuery] = useState(() => options.find((option) => option.id === selectedId)?.label ?? "");
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = useMemo(() => options.find((option) => option.id === selectedId) ?? null, [options, selectedId]);
  const displayQuery = isOpen ? query : selectedOption?.label ?? query;

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
    <div className="space-y-2 text-sm text-ink/70">
      <span className="font-medium">{label}</span>
      <input name={name} type="hidden" value={selectedId} />
      <div className="relative">
        <input
          autoComplete="off"
          className={`w-full rounded-2xl border px-4 py-3 ${invalid ? "border-coral bg-sand/70 ring-1 ring-coral/25" : "border-sand/70 bg-white"}`}
          onBlur={() => {
            window.setTimeout(() => {
              setIsOpen(false);

              if (!selectedId) {
                setQuery("");
                return;
              }

              setQuery(selectedOption?.label ?? "");
            }, 120);
          }}
          onChange={(event) => {
            setQuery(event.target.value);
            if (selectedId) {
              if (isControlled) {
                onValueChange?.("");
              } else {
                setUncontrolledSelectedId("");
              }
            }
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={selectedId ? searchPlaceholder : placeholder}
          value={displayQuery}
        />
        {query ? (
          <button
            className="absolute end-3 top-1/2 -translate-y-1/2 text-xs font-medium text-ink/50"
            onClick={() => {
              setQuery("");
              setIsOpen(false);
              if (isControlled) {
                onValueChange?.("");
              } else {
                setUncontrolledSelectedId("");
              }
            }}
            type="button"
          >
            {clearLabel}
          </button>
        ) : null}
        {isOpen ? (
          <div className="absolute z-20 mt-2 max-h-64 w-full overflow-auto rounded-[20px] border border-sand/70 bg-white p-2 shadow-soft">
            <button
              className={`block w-full rounded-2xl px-3 py-2 text-left text-sm ${
                !selectedId ? "bg-mist text-ink" : "text-ink/70 hover:bg-mist"
              }`}
              onMouseDown={(event) => {
                event.preventDefault();
                setQuery("");
                setIsOpen(false);
                if (isControlled) {
                  onValueChange?.("");
                } else {
                  setUncontrolledSelectedId("");
                }
              }}
              type="button"
            >
              {emptyLabel}
            </button>
            {filteredOptions.length === 0 ? (
              <p className="px-3 py-2 text-sm text-ink/50">{noResultsLabel}</p>
            ) : (
              filteredOptions.map((option) => (
                <button
                  className={`block w-full rounded-2xl px-3 py-2 text-left text-sm ${
                    selectedId === option.id ? "bg-mist text-ink" : "text-ink/70 hover:bg-mist"
                  }`}
                  key={option.id}
                  onMouseDown={(event) => {
                    event.preventDefault();
                    if (isControlled) {
                      onValueChange?.(option.id);
                    } else {
                      setUncontrolledSelectedId(option.id);
                    }
                    setQuery(option.label);
                    setIsOpen(false);
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
