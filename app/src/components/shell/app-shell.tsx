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
  }

  return (
    // Always locked to full viewport — thin bar + content area + bottom nav
    <div className="relative flex h-[100svh] flex-col overflow-hidden bg-sand text-slate-900">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[420px] bg-[radial-gradient(circle_at_top,rgba(15,118,110,0.34),transparent_54%),linear-gradient(145deg,rgba(16,36,63,1)_0%,rgba(23,53,92,0.96)_45%,rgba(15,118,110,0.78)_100%)]" />

      {/* ── Mobile thin top bar (shrink-0, never scrolls) ── */}
      <div className="shrink-0 z-40 border-b border-white/10 bg-ink lg:hidden">
        <div className="flex h-11 items-center justify-between pt-safe px-4">
          <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-white/60">
            {t("eyebrow")}
          </span>
          <div className="flex items-center gap-2">
            <LocaleSwitcher />
            <form action="/api/logout" method="post">
              <button
                aria-label={t("signOut")}
                className="rounded-full p-1.5 text-white/60 transition hover:text-white/90"
                type="submit"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} viewBox="0 0 24 24">
                  <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* ── Desktop full header (shrink-0, never scrolls, hidden on mobile) ── */}
      <header className="shrink-0 hidden px-4 pb-5 pt-safe sm:px-6 lg:block lg:px-8">
        <div className="mx-auto max-w-7xl rounded-[32px] border border-white/10 bg-ink/85 px-5 py-5 text-white shadow-soft backdrop-blur sm:px-6">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.3em] text-white/60">{t("eyebrow")}</p>
              <div className="space-y-1">
                <h1 className="font-display text-2xl font-semibold tracking-tight lg:text-3xl">
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

      {/* ── Content grid (flex-1, min-h-0 — always, not lg-only) ── */}
      <div className="mx-auto grid min-h-0 flex-1 max-w-7xl gap-5 px-4 sm:px-6 lg:grid-cols-[270px_minmax(0,1fr)] lg:px-8">
        <aside className="hidden min-w-0 overflow-y-auto rounded-[30px] border border-white/70 bg-white/70 p-3 shadow-panel backdrop-blur lg:block">
          <div className="mb-3 px-3 pt-2">
            <p className="text-xs uppercase tracking-[0.28em] text-slate-400">
              {t("eyebrow")}
            </p>
            <p className="mt-2 text-lg font-semibold text-ink">{t("workspace")}</p>
          </div>
          <nav className="space-y-2">
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

        {/* main is the ONLY scroll container on mobile */}
        <main className="min-w-0 overflow-y-auto overscroll-y-contain lg:[scrollbar-gutter:stable]">
          {/* Mobile header card — lives inside scroll area so it scrolls away */}
          <div className="pb-4 pt-3 lg:hidden">
            <div className="rounded-[32px] border border-white/10 bg-ink px-4 py-3 text-white shadow-soft">
              <div className="flex flex-col gap-3">
                <h1 className="font-display text-xl font-semibold tracking-tight">
                  {t("title")}
                </h1>
                <form action={`/${locale}/search`}>
                  <input
                    className="w-full rounded-full border border-white/10 bg-white/10 px-4 py-2.5 text-sm text-white placeholder:text-white/60"
                    name="q"
                    placeholder={t("searchPlaceholder")}
                  />
                </form>
                {canEditRecords(session.role) ? (
                  <div className="flex flex-wrap gap-2">
                    <QuickLogButton
                      href={`/${locale}/interactions/new?compact=1`}
                      label={t("quickLog")}
                      sheetLabel={t("quickLog")}
                    />
                    <QuickLogButton
                      href={`/${locale}/tasks/new?compact=1`}
                      label={t("quickTask")}
                      sheetLabel={t("quickTask")}
                    />
                    <QuickLogButton
                      href={`/${locale}/opportunities/new?compact=1`}
                      label={t("quickOpportunity")}
                      sheetLabel={t("quickOpportunity")}
                    />
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          <div className="space-y-4 pb-24 lg:pb-6">{children}</div>
        </main>
      </div>

      <BottomNav locale={locale} />
    </div>
  );
}
