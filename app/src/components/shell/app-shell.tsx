import type {AppLocale} from "@/i18n/routing";
import {getTranslations} from "next-intl/server";

import {Link} from "@/i18n/navigation";
import {canEditRecords, canManageAdminLists, type UserSession} from "@/lib/auth/session";

import {LocaleSwitcher} from "../i18n/locale-switcher";

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
    <div className="min-h-screen bg-sand text-slate-900">
      <div className="absolute inset-x-0 top-0 -z-10 h-[420px] bg-[radial-gradient(circle_at_top,_rgba(43,122,120,0.3),_transparent_55%),linear-gradient(140deg,#10243f_0%,#173257_42%,#1d5462_100%)]" />
      <header className="px-4 pb-6 pt-6 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 rounded-[28px] bg-ink/80 px-5 py-5 text-white shadow-soft backdrop-blur md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.3em] text-white/60">
              {t("eyebrow")}
            </p>
            <div>
              <h1 className="font-semibold">{t("title")}</h1>
              <p className="text-sm text-white/75">
                {t("welcome", {
                  email: session.email,
                  role: t(`roles.${session.role}`),
                  fullName: session.fullName
                })}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <form action={`/${locale}/search`} className="min-w-[220px] flex-1">
              <input
                className="w-full rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-white placeholder:text-white/60"
                name="q"
                placeholder={t("searchPlaceholder")}
              />
            </form>
            {canEditRecords(session.role) ? (
              <Link
                className="rounded-full bg-coral px-4 py-2 text-sm font-medium text-white transition hover:bg-coral/90"
                href="/interactions/new?compact=1"
                locale={locale}
              >
                {t("quickLog")}
              </Link>
            ) : null}
            <LocaleSwitcher />
            <form action="/api/logout" method="post">
              <button
                className="rounded-full border border-white/20 px-4 py-2 text-sm text-white transition hover:bg-white/10"
                type="submit"
              >
                {t("signOut")}
              </button>
            </form>
          </div>
        </div>
      </header>
      <div className="mx-auto grid max-w-6xl gap-6 px-4 pb-10 sm:px-6 lg:grid-cols-[260px_minmax(0,1fr)] lg:px-8">
        <aside className="rounded-[28px] bg-white p-4 shadow-soft">
          <nav className="space-y-2">
            {navItems.map((item) => (
              <Link
                className="block rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-mist hover:text-ink"
                href={item.href}
                key={item.href}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>
        <main className="space-y-6">{children}</main>
      </div>
    </div>
  );
}
