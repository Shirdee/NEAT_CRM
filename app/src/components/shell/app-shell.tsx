import type {AppLocale} from "@/i18n/routing";
import {getTranslations} from "next-intl/server";

import {canEditRecords, canManageAdminLists, type UserSession} from "@/lib/auth/session";
import {BottomNav} from "./bottom-nav";
import {QuickLogButton} from "./quick-log-button";

import {LocaleSwitcher} from "../i18n/locale-switcher";
import {NavItemLink} from "./nav-item-link";

type AppShellProps = {
  children: React.ReactNode;
  locale: AppLocale;
  session: UserSession;
};

export async function AppShell({children, locale, session}: AppShellProps) {
  const t = await getTranslations("Shell");
  const navItems = [
    {href: "/dashboard", label: t("nav.dashboard")},
    {href: "/companies", label: t("nav.companies")},
    {href: "/contacts", label: t("nav.contacts")},
    {href: "/interactions", label: t("nav.interactions")},
    {href: "/tasks", label: t("nav.tasks")},
    {href: "/opportunities", label: t("nav.opportunities")},
    {href: "/reports", label: t("nav.reports")},
    {href: "/search", label: t("nav.search")}
  ];

  if (canManageAdminLists(session.role)) {
    navItems.push({href: "/admin/lists", label: t("nav.adminLists")});
    navItems.push({href: "/admin/imports", label: t("nav.adminImports")});
    navItems.push({href: "/admin/batch", label: t("nav.adminBatchEdit")});
    navItems.push({href: "/admin/duplicates", label: t("nav.adminDuplicates")});
  }

  return (
    <div className="relative grid h-[100dvh] min-h-[100dvh] w-full grid-rows-[minmax(0,1fr)_auto] overflow-hidden bg-sand text-slate-900 overscroll-none">
      {/* Atmospheric background */}
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[320px] bg-ink" />

      <div className="min-h-0 overflow-x-hidden overflow-y-auto overscroll-y-contain">

        {/* ── Mobile header ───────────────────────────── */}
        <header className="pt-safe lg:hidden">
          <div className="flex items-center justify-between gap-3 px-3 py-2">
            {/* Wordmark */}
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded bg-coral text-white">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.25} viewBox="0 0 24 24">
                  <path d="M3 12L12 3l9 9" />
                  <path d="M9 21V12h6v9" />
                </svg>
              </div>
              <span className="font-display text-sm font-semibold text-white">
                {t("title")}
              </span>
            </div>
            {/* Right actions */}
            <div className="flex items-center gap-2">
              <LocaleSwitcher />
              <form action="/api/logout" method="post">
                <button
                  className="rounded-full border border-white/20 px-3 py-1.5 text-xs font-medium text-white/80 transition hover:bg-white/10"
                  type="submit"
                >
                  {t("signOut")}
                </button>
              </form>
            </div>
          </div>
        </header>

        {/* ── Desktop header ──────────────────────────── */}
        <header className="hidden px-6 pb-5 pt-safe lg:block lg:px-8">
          <div className="mx-auto max-w-7xl rounded-[32px] border border-white/10 bg-ink/85 px-5 py-5 text-white shadow-soft backdrop-blur sm:px-6">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
              <div className="space-y-3">
                <p className="text-xs uppercase tracking-[0.3em] text-white/60">
                  {t("eyebrow")}
                </p>
                <div className="space-y-1">
                  <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
                    {t("title")}
                  </h1>
                  <p className="max-w-2xl text-sm leading-6 text-white/70">
                    {t("welcome", {
                      email: session.email,
                      role: t(`roles.${session.role}`),
                      fullName: session.fullName
                    })}
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-3 xl:items-end">
                <form action={`/${locale}/search`} className="w-full xl:min-w-[360px]">
                  <input
                    className="w-full rounded-full border border-white/10 bg-white/10 px-5 py-3 text-sm text-white placeholder:text-white/60"
                    name="q"
                    placeholder={t("searchPlaceholder")}
                  />
                </form>
                <div className="flex flex-wrap items-center gap-2.5">
                  {canEditRecords(session.role) ? (
                    <QuickLogButton
                      href={`/${locale}/interactions/new?compact=1`}
                      label={t("quickLog")}
                      sheetLabel={t("quickLog")}
                    />
                  ) : null}
                  {canEditRecords(session.role) ? (
                    <QuickLogButton
                      href={`/${locale}/tasks/new?compact=1`}
                      label={t("quickTask")}
                      sheetLabel={t("quickTask")}
                    />
                  ) : null}
                  {canEditRecords(session.role) ? (
                    <QuickLogButton
                      href={`/${locale}/opportunities/new?compact=1`}
                      label={t("quickOpportunity")}
                      sheetLabel={t("quickOpportunity")}
                    />
                  ) : null}
                  <LocaleSwitcher />
                  <form action="/api/logout" method="post">
                    <button
                      className="rounded-full border border-white/20 px-4 py-2.5 text-sm text-white transition hover:bg-white/10"
                      type="submit"
                    >
                      {t("signOut")}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* ── Body grid ───────────────────────────────── */}
        <div className="mx-auto grid w-full max-w-7xl gap-5 px-4 pb-6 sm:px-6 lg:grid-cols-[270px_minmax(0,1fr)] lg:px-8">
          <aside className="hidden min-w-0 overflow-y-auto rounded-[30px] border border-white/70 bg-white/70 p-2 shadow-panel backdrop-blur lg:block">
            <div className="mb-3 px-3 pt-2">
              <p className="text-xs uppercase tracking-[0.28em] text-slate-400">
                {t("eyebrow")}
              </p>
              <p className="mt-2 text-lg font-semibold text-ink">{t("workspace")}</p>
            </div>
            <nav className="space-y-0.5">
              {navItems.map((item) => (
                <NavItemLink
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  locale={locale}
                />
              ))}
            </nav>
          </aside>
          <main className="min-w-0 overflow-x-hidden">
            <div className="space-y-6 pb-6">{children}</div>
          </main>
        </div>
      </div>

      <BottomNav locale={locale} />
    </div>
  );
}
