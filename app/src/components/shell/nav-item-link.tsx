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
        "group flex items-center justify-between rounded-[22px] px-3 py-1.5 text-sm font-medium transition",
        active
          ? "bg-ink text-white shadow-panel"
          : "bg-white/70 text-ink/70 hover:bg-mint hover:text-ink"
      )}
      href={href}
      locale={locale}
    >
      <span>{label}</span>
      <span
        aria-hidden="true"
        className={clsx(
          "h-2.5 w-2.5 rounded-full transition",
          active ? "bg-coral" : "bg-mist group-hover:bg-teal/30"
        )}
      />
    </Link>
  );
}
