"use client";

import clsx from "clsx";
import {useEffect, useMemo, useRef, useState} from "react";

type Option = {
  id: string;
  label: string;
};

type LiveSearchSelectProps = {
  name: string;
  value?: string;
  placeholder: string;
  allLabel: string;
  options: Option[];
  className?: string;
  inputClassName?: string;
};

export function LiveSearchSelect({
  name,
  value = "",
  placeholder,
  allLabel,
  options,
  className,
  inputClassName
}: LiveSearchSelectProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(() => options.find((option) => option.id === value)?.label ?? "");
  const [selectedId, setSelectedId] = useState(value);

  useEffect(() => {
    const onClickOutside = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const filteredOptions = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return options;
    return options.filter((option) => option.label.toLowerCase().includes(normalized));
  }, [options, query]);

  const selectedLabel = options.find((option) => option.id === selectedId)?.label ?? allLabel;

  const submitNearestForm = (target: HTMLElement | null) => {
    const form = target?.closest("form");
    form?.requestSubmit();
  };

  return (
    <div ref={rootRef} className={clsx("relative min-w-0", className)}>
      <input name={name} type="hidden" value={selectedId} />
      <button
        aria-haspopup="listbox"
        aria-expanded={open}
        className={clsx(
          "flex h-11 w-full items-center justify-between gap-3 rounded-[12px] bg-mist px-3.5 text-left text-[13px] text-ink/70 outline-none ring-1 ring-transparent transition focus:ring-teal/25",
          inputClassName
        )}
        type="button"
        onClick={() => setOpen((current) => !current)}
      >
        <span className="truncate">{selectedLabel || placeholder}</span>
        <span className="text-ink/30">⌄</span>
      </button>
      {open ? (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-20 rounded-[14px] border border-ink/10 bg-white p-2 shadow-card">
          <input
            autoFocus
            className="h-10 w-full rounded-[10px] bg-mist px-3 text-[13px] text-ink outline-none ring-1 ring-transparent placeholder:text-ink/30 focus:ring-teal/25"
            placeholder={placeholder}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <div className="mt-2 max-h-56 overflow-auto">
            <button
              className="flex w-full items-center rounded-[10px] px-3 py-2 text-left text-[13px] text-ink/70 transition hover:bg-sand"
              type="button"
              onClick={() => {
                setSelectedId("");
                setQuery("");
                setOpen(false);
                submitNearestForm(rootRef.current);
              }}
            >
              {allLabel}
            </button>
            {filteredOptions.map((option) => (
              <button
                className={clsx(
                  "flex w-full items-center rounded-[10px] px-3 py-2 text-left text-[13px] transition hover:bg-sand",
                  option.id === selectedId ? "bg-teal/10 text-teal" : "text-ink/70"
                )}
                key={option.id}
                type="button"
                onClick={() => {
                  setSelectedId(option.id);
                  setQuery(option.label);
                  setOpen(false);
                  submitNearestForm(rootRef.current);
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
