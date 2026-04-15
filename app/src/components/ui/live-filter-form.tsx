"use client";

import {type FormHTMLAttributes, useRef} from "react";

type LiveFilterFormProps = FormHTMLAttributes<HTMLFormElement> & {
  autoSubmitDelayMs?: number;
};

function isTextLikeInput(element: EventTarget | null) {
  if (!(element instanceof HTMLInputElement)) return false;
  const type = element.type.toLowerCase();
  return (
    type === "text" ||
    type === "search" ||
    type === "email" ||
    type === "url" ||
    type === "tel" ||
    type === "number"
  );
}

function shouldSkipAutoSubmit(element: EventTarget | null) {
  return element instanceof HTMLElement && element.dataset.liveSubmit === "off";
}

export function LiveFilterForm({
  autoSubmitDelayMs = 300,
  onChange,
  onInput,
  ...props
}: LiveFilterFormProps) {
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const submitForm = (target: EventTarget | null, useDebounce: boolean) => {
    if (!(target instanceof HTMLElement)) return;
    if (shouldSkipAutoSubmit(target)) return;
    const form = target.closest("form");
    if (!form) return;

    if (!useDebounce) {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      form.requestSubmit();
      return;
    }

    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      form.requestSubmit();
    }, autoSubmitDelayMs);
  };

  return (
    <form
      {...props}
      onChange={(event) => {
        onChange?.(event);
        if (event.defaultPrevented) return;

        const target = event.target;
        if (target instanceof HTMLSelectElement) {
          submitForm(target, false);
          return;
        }

        if (target instanceof HTMLInputElement) {
          if (target.type === "checkbox" || target.type === "radio") {
            submitForm(target, false);
            return;
          }
          if (isTextLikeInput(target)) {
            submitForm(target, true);
          }
        }
      }}
      onInput={(event) => {
        onInput?.(event);
        if (event.defaultPrevented) return;

        const target = event.target;
        if (isTextLikeInput(target) || target instanceof HTMLTextAreaElement) {
          submitForm(target, true);
        }
      }}
    />
  );
}
