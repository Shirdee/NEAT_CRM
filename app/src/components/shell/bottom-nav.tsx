"use client";

import clsx from "clsx";

import {Link, usePathname} from "@/i18n/navigation";
import type {AppLocale} from "@/i18n/routing";

type BottomNavProps = {
  locale: AppLocale;
};

function DashboardIcon() {
  return (
    <svg className="h-[22px] w-[22px]" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} viewBox="0 0 24 24">
      <rect height="9" rx="2" width="9" x="3" y="3" />
      <rect height="5" rx="2" width="9" x="3" y="16" />
      <rect height="5" rx="2" width="9" x="16" y="3" />
      <rect height="9" rx="2" width="5" x="16" y="12" />
    </svg>
  );
}

function CompaniesIcon() {
  return (
    <svg className="h-[22px] w-[22px]" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} viewBox="0 0 24 24">
      <path d="M3 21h18" />
      <path d="M5 21V7l7-4 7 4v14" />
      <path d="M9 21v-4h6v4" />
      <path d="M9 9h.01M15 9h.01M9 13h.01M15 13h.01" />
    </svg>
  );
}

function ContactsIcon() {
  return (
    <svg className="h-[22px] w-[22px]" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} viewBox="0 0 24 24">
      <circle cx="9" cy="7" r="3" />
      <path d="M3 21v-1a6 6 0 016-6h0a6 6 0 016 6v1" />
      <circle cx="18" cy="9" r="2.5" />
      <path d="M21 21v-.5a4 4 0 00-3-3.85" />
    </svg>
  );
}

function TasksIcon() {
  return (
    <svg className="h-[22px] w-[22px]" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} viewBox="0 0 24 24">
      <path d="M9 11l3 3 8-8" />
      <path d="M20 12v7a2 2 0 01-2 2H6a2 2 0 01-2-2V5a2 2 0 012-2h9" />
    </svg>
  );
}

function InteractionsIcon() {
  return (
    <svg className="h-[22px] w-[22px]" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} viewBox="0 0 24 24">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
    </svg>
  );
}

const NAV_ITEMS = [
  {href: "/dashboard", label: "Home", Icon: DashboardIcon},
  {href: "/companies", label: "Pipeline", Icon: CompaniesIcon},
  {href: "/contacts", label: "People", Icon: ContactsIcon},
  {href: "/tasks", label: "Tasks", Icon: TasksIcon},
  {href: "/interactions", label: "Log", Icon: InteractionsIcon}
] as const;

export function BottomNav({locale}: BottomNavProps) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Main navigation"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-white/50 bg-white/90 backdrop-blur lg:hidden"
    >
      <div className="flex items-stretch pb-safe">
        {NAV_ITEMS.map(({href, label, Icon}) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              className={clsx(
                "flex flex-1 flex-col items-center gap-1 px-1 pb-1 pt-2.5 text-[9px] font-semibold uppercase tracking-[0.16em] transition-colors",
                active ? "text-coral" : "text-slate-400 hover:text-slate-600"
              )}
              href={href}
              key={href}
              locale={locale}
            >
              <Icon />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
