"use client";

import clsx from "clsx";

import {Link, usePathname} from "@/i18n/navigation";
import type {AppLocale} from "@/i18n/routing";

type NavItemLinkProps = {
  href: string;
  label: string;
  locale: AppLocale;
};

export function NavItemLink({href, label, locale}: NavItemLinkProps) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      className={clsx(
        "group flex items-center justify-between rounded-[22px] px-3 py-2 text-sm font-medium transition sm:px-4 sm:py-3",
        active
          ? "bg-ink text-white shadow-panel"
          : "bg-white/70 text-slate-600 hover:bg-mint hover:text-ink"
      )}
      href={href}
      locale={locale}
    >
      <span>{label}</span>
      <span
        aria-hidden="true"
        className={clsx(
          "h-2.5 w-2.5 rounded-full transition",
          active ? "bg-coral" : "bg-slate-200 group-hover:bg-teal/30"
        )}
      />
    </Link>
  );
}
