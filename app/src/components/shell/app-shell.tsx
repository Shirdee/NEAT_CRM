import type {AppLocale} from "@/i18n/routing";
import {getTranslations} from "next-intl/server";

import {canEditRecords, canManageAdminLists, type UserSession} from "@/lib/auth/session";
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
    {href: "/search", label: t("nav.search")}
  ];

  if (canManageAdminLists(session.role)) {
    navItems.push({href: "/admin/lists", label: t("nav.adminLists")});
    navItems.push({href: "/admin/imports", label: t("nav.adminImports")});
  }

  return (
    <div className="min-h-[100dvh] bg-sand text-slate-900">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[420px] bg-[radial-gradient(circle_at_top,rgba(15,118,110,0.34),transparent_54%),linear-gradient(145deg,rgba(16,36,63,1)_0%,rgba(23,53,92,0.96)_45%,rgba(15,118,110,0.78)_100%)]" />
      <header className="px-4 pb-5 pt-safe sm:px-6 lg:px-8">
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
      <div className="mx-auto grid max-w-7xl gap-5 px-4 pb-10 sm:px-6 lg:grid-cols-[270px_minmax(0,1fr)] lg:px-8">
        <aside className="min-w-0 rounded-[30px] border border-white/70 bg-white/70 p-3 shadow-panel backdrop-blur lg:sticky lg:top-6 lg:self-start">
          <div className="mb-3 px-3 pt-2">
            <p className="text-xs uppercase tracking-[0.28em] text-slate-400">
              {t("eyebrow")}
            </p>
            <p className="mt-2 text-lg font-semibold text-ink">{t("workspace")}</p>
          </div>
          <nav className="flex gap-2 overflow-x-auto px-1 pb-1 lg:block lg:space-y-2 lg:overflow-visible">
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
        <main className="min-w-0 space-y-6">{children}</main>
      </div>
    </div>
  );
}
