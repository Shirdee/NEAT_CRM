"use client";

import {useState} from "react";

import {BottomSheet} from "@/components/ui/bottom-sheet";

type QuickLogButtonProps = {
  href: string;
  label: string;
  sheetLabel: string;
};

export function QuickLogButton({href, label, sheetLabel}: QuickLogButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile: opens bottom sheet */}
      <button
        className="sm:hidden rounded-full bg-coral px-3 py-1.5 text-xs font-semibold text-white transition hover:-translate-y-0.5 hover:bg-coral/90"
        onClick={() => setOpen(true)}
        type="button"
      >
        {label}
      </button>

      {/* Desktop: plain anchor navigation */}
      <a
        className="hidden sm:inline-flex rounded-full bg-coral px-4 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-coral/90"
        href={href}
      >
        {label}
      </a>

      <BottomSheet isOpen={open} label={sheetLabel} onClose={() => setOpen(false)}>
        <iframe
          className="h-[80dvh] w-full border-0 bg-transparent"
          src={href}
          title={sheetLabel}
        />
      </BottomSheet>
    </>
  );
}
