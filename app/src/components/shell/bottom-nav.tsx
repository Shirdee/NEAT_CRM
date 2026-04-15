"use client";

import clsx from "clsx";

import {Link, usePathname} from "@/i18n/navigation";
import type {AppLocale} from "@/i18n/routing";

type BottomNavProps = {
  locale: AppLocale;
};

function HomeIcon({active}: {active: boolean}) {
  return active ? (
    <svg className="h-[22px] w-[22px]" fill="currentColor" viewBox="0 0 24 24">
      <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z" />
      <path d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198c.03-.028.061-.056.091-.086L12 5.432z" />
    </svg>
  ) : (
    <svg className="h-[22px] w-[22px]" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} viewBox="0 0 24 24">
      <path d="M3 12L12 3l9 9" />
      <path d="M9 21V12h6v9" />
      <path d="M5 21V10.5" />
      <path d="M19 21V10.5" />
    </svg>
  );
}

function CompaniesIcon({active}: {active: boolean}) {
  return active ? (
    <svg className="h-[22px] w-[22px]" fill="currentColor" viewBox="0 0 24 24">
      <path fillRule="evenodd" d="M4.5 2.25a.75.75 0 000 1.5v16.5h-.75a.75.75 0 000 1.5h16.5a.75.75 0 000-1.5h-.75V3.75a.75.75 0 000-1.5h-15zM9 6a.75.75 0 000 1.5h1.5a.75.75 0 000-1.5H9zm-.75 3.75A.75.75 0 019 9h1.5a.75.75 0 010 1.5H9a.75.75 0 01-.75-.75zM9 12a.75.75 0 000 1.5h1.5a.75.75 0 000-1.5H9zm3.75-5.25A.75.75 0 0113.5 6H15a.75.75 0 010 1.5h-1.5a.75.75 0 01-.75-.75zM13.5 9a.75.75 0 000 1.5H15A.75.75 0 0015 9h-1.5zm-.75 3.75a.75.75 0 01.75-.75H15a.75.75 0 010 1.5h-1.5a.75.75 0 01-.75-.75zM9 19.5v-2.25a.75.75 0 01.75-.75h4.5a.75.75 0 01.75.75v2.25a.75.75 0 01-.75.75h-4.5A.75.75 0 019 19.5z" clipRule="evenodd" />
    </svg>
  ) : (
    <svg className="h-[22px] w-[22px]" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} viewBox="0 0 24 24">
      <path d="M3 21h18" />
      <path d="M5 21V7l7-4 7 4v14" />
      <path d="M9 21v-4h6v4" />
      <path d="M9 9h.01M15 9h.01M9 13h.01M15 13h.01" />
    </svg>
  );
}

function ContactsIcon({active}: {active: boolean}) {
  return active ? (
    <svg className="h-[22px] w-[22px]" fill="currentColor" viewBox="0 0 24 24">
      <path d="M4.5 6.375a4.125 4.125 0 118.25 0 4.125 4.125 0 01-8.25 0zM14.25 8.625a3.375 3.375 0 116.75 0 3.375 3.375 0 01-6.75 0zM1.5 19.125a7.125 7.125 0 0114.25 0v.003l-.001.119a.75.75 0 01-.363.63 13.067 13.067 0 01-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 01-.364-.63l-.001-.122zM17.25 19.128l-.001.144a2.25 2.25 0 01-.233.96 10.088 10.088 0 005.06-1.01.75.75 0 00.42-.643 4.875 4.875 0 00-6.957-4.611 8.586 8.586 0 011.71 5.157v.003z" />
    </svg>
  ) : (
    <svg className="h-[22px] w-[22px]" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} viewBox="0 0 24 24">
      <circle cx="9" cy="7" r="3" />
      <path d="M3 21v-1a6 6 0 016-6h0a6 6 0 016 6v1" />
      <circle cx="18" cy="9" r="2.5" />
      <path d="M21 21v-.5a4 4 0 00-3-3.85" />
    </svg>
  );
}

function TasksIcon({active}: {active: boolean}) {
  return active ? (
    <svg className="h-[22px] w-[22px]" fill="currentColor" viewBox="0 0 24 24">
      <path fillRule="evenodd" d="M7.502 6h7.128A3.375 3.375 0 0118 9.375v9.375a3 3 0 003-3V6.108c0-1.505-1.125-2.811-2.664-2.94a48.972 48.972 0 00-.673-.05A3 3 0 0015 1.5h-1.5a3 3 0 00-2.663 1.618c-.225.015-.45.032-.673.05C8.662 3.295 7.554 4.542 7.502 6zM13.5 3A1.5 1.5 0 0012 4.5h4.5A1.5 1.5 0 0015 3h-1.5zM4.875 6H18a3 3 0 013 3v9a3 3 0 01-3 3H4.875a2.625 2.625 0 01-2.625-2.625v-9.75C2.25 7.174 3.456 6 4.875 6zM12 11.25a.75.75 0 00-.75.75v.008c0 .414.336.75.75.75h.008a.75.75 0 00.75-.75v-.008a.75.75 0 00-.75-.75H12zm-3 3a.75.75 0 00-.75.75v.008c0 .414.336.75.75.75h.008a.75.75 0 00.75-.75v-.008a.75.75 0 00-.75-.75H9zm6 0a.75.75 0 00-.75.75v.008c0 .414.336.75.75.75h.008a.75.75 0 00.75-.75v-.008a.75.75 0 00-.75-.75H15z" clipRule="evenodd" />
    </svg>
  ) : (
    <svg className="h-[22px] w-[22px]" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} viewBox="0 0 24 24">
      <path d="M9 11l3 3 8-8" />
      <path d="M20 12v7a2 2 0 01-2 2H6a2 2 0 01-2-2V5a2 2 0 012-2h9" />
    </svg>
  );
}

function LogIcon({active}: {active: boolean}) {
  return active ? (
    <svg className="h-[22px] w-[22px]" fill="currentColor" viewBox="0 0 24 24">
      <path fillRule="evenodd" d="M4.848 2.771A49.144 49.144 0 0112 2.25c2.43 0 4.817.178 7.152.52 1.978.292 3.348 2.024 3.348 3.97v6.02c0 1.946-1.37 3.678-3.348 3.97a48.901 48.901 0 01-3.476.383.39.39 0 00-.297.17l-2.755 4.133a.75.75 0 01-1.248 0l-2.755-4.133a.39.39 0 00-.297-.17 48.9 48.9 0 01-3.476-.384c-1.978-.29-3.348-2.024-3.348-3.97V6.741c0-1.946 1.37-3.68 3.348-3.97z" clipRule="evenodd" />
    </svg>
  ) : (
    <svg className="h-[22px] w-[22px]" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} viewBox="0 0 24 24">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
    </svg>
  );
}

const NAV_ITEMS = [
  {href: "/dashboard", label: "Home", Icon: HomeIcon},
  {href: "/companies", label: "Pipeline", Icon: CompaniesIcon},
  {href: "/contacts", label: "People", Icon: ContactsIcon},
  {href: "/tasks", label: "Tasks", Icon: TasksIcon},
  {href: "/interactions", label: "Log", Icon: LogIcon}
] as const;

export function BottomNav({locale}: BottomNavProps) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Main navigation"
      className="shrink-0 bg-white/95 shadow-[0_-1px_0_rgba(16,36,63,0.06)] backdrop-blur-sm lg:hidden"
    >
      <div className="flex items-stretch pb-safe">
        {NAV_ITEMS.map(({href, label, Icon}) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              className={clsx(
                "relative flex flex-1 flex-col items-center gap-0.5 px-1 pb-1 pt-2 transition-colors",
                active ? "text-teal" : "text-ink/40 hover:text-ink/65"
              )}
              href={href}
              key={href}
              locale={locale}
            >
              {active ? (
                <span className="absolute inset-x-3 top-0 h-0.5 rounded-full bg-teal" />
              ) : null}
              <Icon active={active} />
              <span className={clsx(
                "text-[10px] font-semibold tracking-wide",
                active ? "text-teal" : "text-ink/40"
              )}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
