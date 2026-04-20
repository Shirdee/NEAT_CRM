import type {AppLocale} from "@/i18n/routing";
import {getTranslations} from "next-intl/server";

import {canManageAdminLists, type UserSession} from "@/lib/auth/session";
import {BottomNav} from "./bottom-nav";

import {LocaleSwitcher} from "../i18n/locale-switcher";
import {AvatarInitial} from "../ui/avatar-initial";
import {SidebarNavItem} from "./sidebar-nav-item";

type AppShellProps = {
  children: React.ReactNode;
  locale: AppLocale;
  session: UserSession;
};

function DashboardIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 16 16">
      <path d="M2.5 2.5h4v4h-4zM9.5 2.5h4v4h-4zM2.5 9.5h4v4h-4zM9.5 9.5h4v4h-4z" />
    </svg>
  );
}

function CompaniesIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 16 16">
      <path d="M2.5 14.5h11" />
      <path d="M4 14.5V4l4-2 4 2v10.5" />
      <path d="M6 6.5h.01M10 6.5h.01M6 9.5h.01M10 9.5h.01M6 12h.01M10 12h.01" />
    </svg>
  );
}

function ContactsIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 16 16">
      <path d="M5.5 7a2.5 2.5 0 1 0-2.5-2.5A2.5 2.5 0 0 0 5.5 7Z" />
      <path d="M1.5 14.5v-.6A4.4 4.4 0 0 1 5.9 9.5h-.8A4.4 4.4 0 0 1 10.5 13.9v.6" />
      <path d="M11.5 7.5a2 2 0 1 0-2-2 2 2 0 0 0 2 2Z" />
    </svg>
  );
}

function InteractionsIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 16 16">
      <path d="M3 3.5h10a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1H7l-3.5 3v-3H3a1 1 0 0 1-1-1v-5a1 1 0 0 1 1-1Z" />
      <path d="M5 6.25h6M5 8.75h4" />
    </svg>
  );
}

function TasksIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 16 16">
      <path d="M5 3h8M5 8h8M5 13h8" />
      <path d="M2.75 3.5l.75.75 1.5-1.5M2.75 8.5l.75.75 1.5-1.5M2.75 13.5l.75.75 1.5-1.5" />
    </svg>
  );
}

function OpportunitiesIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 16 16">
      <path d="M2.5 6.5h11" />
      <path d="M4 6.5V5a4 4 0 0 1 8 0v1.5" />
      <path d="M4 6.5v6a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-6" />
      <path d="M6.25 9.5h3.5" />
    </svg>
  );
}

function ReportsIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 16 16">
      <path d="M2.5 13.5h11" />
      <path d="M4 11V8.5" />
      <path d="M7 11V5.5" />
      <path d="M10 11V7.5" />
      <path d="M13 11V3.5" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 16 16">
      <circle cx="7" cy="7" r="4" />
      <path d="M10.25 10.25 13.5 13.5" />
    </svg>
  );
}

function AdminUsersIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 16 16">
      <path d="M9.5 8.25a2 2 0 1 0-2 0" />
      <path d="M4 13.5v-.5a4 4 0 0 1 8 0v.5" />
      <path d="M11.5 5.5h2" />
      <path d="M12.5 4.5v2" />
    </svg>
  );
}

function AdminListsIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 16 16">
      <path d="M5 4h8M5 8h8M5 12h8" />
      <path d="M2.75 4h.5M2.75 8h.5M2.75 12h.5" />
    </svg>
  );
}

function AdminImportsIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 16 16">
      <path d="M8 2.5v7" />
      <path d="m5.5 6 2.5 2.5L10.5 6" />
      <path d="M3 11.5h10" />
    </svg>
  );
}

function AdminBatchIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 16 16">
      <path d="M3.5 4.5h5L12.5 8l-4 3.5h-5z" />
      <path d="M8.5 5.5 6 8l2.5 2.5" />
    </svg>
  );
}

function AdminDuplicatesIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 16 16">
      <path d="M4.5 3.5h6a1 1 0 0 1 1 1v6" />
      <path d="M3.5 5.5h6a1 1 0 0 1 1 1v6" />
      <path d="M6.5 7.5h3" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg aria-hidden="true" className="h-[14px] w-[14px]" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 16 16">
      <path d="M6 2.5H3.5a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1H6" />
      <path d="M9 8H2.5" />
      <path d="M11 5.5 13.5 8 11 10.5" />
    </svg>
  );
}

export async function AppShell({children, locale, session}: AppShellProps) {
  const t = await getTranslations("Shell");

  const coreNavItems = [
    {href: "/dashboard", label: t("nav.dashboard"), icon: <DashboardIcon />},
    {href: "/companies", label: t("nav.companies"), icon: <CompaniesIcon />},
    {href: "/contacts", label: t("nav.contacts"), icon: <ContactsIcon />},
    {href: "/interactions", label: t("nav.interactions"), icon: <InteractionsIcon />},
    {href: "/tasks", label: t("nav.tasks"), icon: <TasksIcon />},
    {href: "/opportunities", label: t("nav.opportunities"), icon: <OpportunitiesIcon />},
    {href: "/reports", label: t("nav.reports"), icon: <ReportsIcon />},
    {href: "/search", label: t("nav.search"), icon: <SearchIcon />}
  ];

  const adminNavItems = [
    {href: "/admin/users", label: t("nav.adminUsers"), icon: <AdminUsersIcon />},
    {href: "/admin/lists", label: t("nav.adminLists"), icon: <AdminListsIcon />},
    {href: "/admin/imports", label: t("nav.adminImports"), icon: <AdminImportsIcon />},
    {href: "/admin/batch", label: t("nav.adminBatchEdit"), icon: <AdminBatchIcon />},
    {href: "/admin/duplicates", label: t("nav.adminDuplicates"), icon: <AdminDuplicatesIcon />}
  ];

  return (
    <div className="flex h-[100dvh] w-full overflow-hidden bg-sand text-ink overscroll-none">
      <aside className="hidden w-[240px] shrink-0 flex-col bg-ink lg:flex">
        <div className="flex items-center gap-2.5 px-5 py-[22px]">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal font-display text-sm font-extrabold text-white">
            C
          </div>
          <span className="font-display text-[15px] font-bold text-white">{t("title")}</span>
        </div>

        <nav className="flex-1 space-y-0.5 px-3">
          {coreNavItems.map((item) => (
            <SidebarNavItem
              href={item.href}
              icon={item.icon}
              key={item.href}
              label={item.label}
              locale={locale}
            />
          ))}

          {canManageAdminLists(session.role) ? (
            <>
              <p className="px-2 pb-1 pt-4 text-[10px] font-semibold uppercase tracking-[0.08em] text-white/25">
                {t("roles.admin")}
              </p>
              {adminNavItems.map((item) => (
                <SidebarNavItem
                  href={item.href}
                  icon={item.icon}
                  key={item.href}
                  label={item.label}
                  locale={locale}
                />
              ))}
            </>
          ) : null}
        </nav>

        <div className="border-t border-white/10 p-3">
          <div className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 transition hover:bg-white/6">
            <AvatarInitial name={session.fullName} size="md" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-semibold text-white/92">{session.fullName}</p>
              <p className="text-[11px] text-white/45">{t(`roles.${session.role}`)}</p>
            </div>
            <div className="flex items-center gap-1.5">
              <LocaleSwitcher />
              <form action="/api/logout" method="post">
                <button
                  aria-label={t("signOut")}
                  className="rounded p-1 text-white/30 transition hover:text-white/70"
                  type="submit"
                >
                  <LogoutIcon />
                </button>
              </form>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-sand">
        <header className="pt-safe bg-ink lg:hidden">
          <div className="flex items-center justify-between gap-3 px-3 py-2">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded bg-coral text-white">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.25} viewBox="0 0 24 24">
                  <path d="M3 12L12 3l9 9" />
                  <path d="M9 21V12h6v9" />
                </svg>
              </div>
              <span className="font-display text-sm font-semibold text-white">{t("title")}</span>
            </div>
            <div className="flex items-center gap-2">
              <LocaleSwitcher />
              <form action="/api/logout" method="post">
                <button
                className="rounded-full border border-white/20 px-3 py-1.5 text-xs font-medium text-white/90 transition hover:bg-white/10"
                type="submit"
              >
                {t("signOut")}
                </button>
              </form>
            </div>
          </div>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-y-contain bg-sand">
          {children}
        </main>

        <BottomNav locale={locale} />
      </div>
    </div>
  );
}
