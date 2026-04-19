"use client";

import clsx from "clsx";

import {Link, usePathname} from "@/i18n/navigation";
import type {AppLocale} from "@/i18n/routing";

type Props = {
  href: string;
  label: string;
  locale: AppLocale;
  icon: React.ReactNode;
};

export function SidebarNavItem({href, label, locale, icon}: Props) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      aria-current={active ? "page" : undefined}
      href={href}
      locale={locale}
      className={clsx(
        "group flex items-center gap-2.5 rounded-lg px-2.5 py-[9px] text-[13.5px] font-medium transition-colors focus-visible:ring-2 focus-visible:ring-mint/70 focus-visible:ring-offset-2 focus-visible:ring-offset-ink",
        active
          ? "bg-teal/18 text-white"
          : "text-white/55 hover:bg-white/6 hover:text-white/85"
      )}
    >
      <span
        className={clsx(
          "shrink-0 transition-colors",
          active ? "text-teal" : "text-white/45 group-hover:text-white/80"
        )}
      >
        {icon}
      </span>
      <span className="min-w-0 truncate">{label}</span>
    </Link>
  );
}
