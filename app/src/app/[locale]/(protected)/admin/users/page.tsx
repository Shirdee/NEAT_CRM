import {getTranslations} from "next-intl/server";
import {redirect} from "next/navigation";

import {Link} from "@/i18n/navigation";
import {SurfaceCard} from "@/components/ui/surface-card";
import {canManageAdminLists, getCurrentSession} from "@/lib/auth/session";
import {listAdminUsers} from "@/lib/data/repository";

import {createUserAction, toggleUserActiveAction} from "./actions";

type AdminUsersPageProps = {
  params: Promise<{locale: string}>;
  searchParams: Promise<{error?: string}>;
};

export default async function AdminUsersPage({params, searchParams}: AdminUsersPageProps) {
  const {locale} = await params;
  const {error} = await searchParams;
  const t = await getTranslations("AdminUsers");
  const session = await getCurrentSession();

  if (!session || !canManageAdminLists(session.role)) {
    redirect(`/${locale}/access-denied`);
  }

  const users = await listAdminUsers();
  const errorMessage =
    error === "missing"
      ? t("errors.missing")
      : error === "password"
        ? t("errors.password")
        : error === "locale"
          ? t("errors.locale")
          : error === "email"
            ? t("errors.email")
            : null;

  return (
    <div className="space-y-4 lg:space-y-5">
      <SurfaceCard className="overflow-hidden bg-white/95">
        <div className="space-y-3">
          <h2 className="font-display text-3xl font-semibold tracking-tight text-ink">{t("title")}</h2>
          <p className="max-w-2xl text-sm leading-7 text-ink/70">{t("subtitle")}</p>
        </div>
      </SurfaceCard>

      {errorMessage ? (
        <p className="rounded-2xl bg-coral/10 px-4 py-3 text-sm text-coral">{errorMessage}</p>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-[330px_minmax(0,1fr)]">
        <article className="rounded-[28px] border border-ink/10 bg-white/95 p-5 shadow-[0_12px_40px_rgba(58,48,45,0.06)]">
          <h3 className="text-lg font-semibold text-ink">{t("create.title")}</h3>
          <p className="mt-2 text-sm leading-6 text-ink/70">{t("create.body")}</p>
          <form action={createUserAction} className="mt-5 space-y-3">
            <input name="locale" type="hidden" value={locale} />
            <input
              className="w-full rounded-2xl border border-mist px-4 py-3 text-sm"
              name="fullName"
              placeholder={t("create.fullNamePlaceholder")}
            />
            <input
              className="w-full rounded-2xl border border-mist px-4 py-3 text-sm"
              name="email"
              placeholder={t("create.emailPlaceholder")}
              type="email"
            />
            <input
              className="w-full rounded-2xl border border-mist px-4 py-3 text-sm"
              name="password"
              placeholder={t("create.passwordPlaceholder")}
              type="password"
            />
            <select
              className="w-full rounded-2xl border border-mist bg-white px-4 py-3 text-sm"
              defaultValue="editor"
              name="role"
            >
              <option value="admin">{t("roles.admin")}</option>
              <option value="editor">{t("roles.editor")}</option>
              <option value="viewer">{t("roles.viewer")}</option>
            </select>
            <select
              className="w-full rounded-2xl border border-mist bg-white px-4 py-3 text-sm"
              defaultValue="en"
              name="languagePreference"
            >
              <option value="en">{t("languages.en")}</option>
              <option value="he">{t("languages.he")}</option>
            </select>
            <button
              className="inline-flex rounded-full bg-ink px-4 py-2 text-sm font-medium text-white"
              type="submit"
            >
              {t("create.submit")}
            </button>
          </form>
        </article>

        <div className="space-y-4">
          {users.map((user) => (
            <article className="rounded-[28px] border border-ink/10 bg-white/95 p-5 shadow-[0_12px_40px_rgba(58,48,45,0.06)]" key={user.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-ink">{user.fullName}</h3>
                  <p className="text-sm text-ink/50">{user.email}</p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    user.isActive ? "bg-emerald-100 text-emerald-800" : "bg-mist text-ink/70"
                  }`}
                >
                  {user.isActive ? t("status.active") : t("status.inactive")}
                </span>
              </div>
              <p className="mt-3 text-sm text-ink/70">
                {t("meta", {
                  role: t(`roles.${user.role}`),
                  locale: t(`languages.${user.languagePreference}`)
                })}
              </p>
              <form action={toggleUserActiveAction} className="mt-4">
                <input name="locale" type="hidden" value={locale} />
                <input name="userId" type="hidden" value={user.id} />
                <button
                  className="rounded-full border border-ink/10 px-4 py-2 text-sm font-medium text-ink/80"
                  type="submit"
                >
                  {user.isActive ? t("actions.deactivate") : t("actions.activate")}
                </button>
              </form>
            </article>
          ))}
        </div>
      </section>

      <div className="flex flex-wrap gap-3">
        <Link
          className="inline-flex rounded-full border border-ink/10 px-4 py-2 text-sm font-medium text-ink/70"
          href="/admin/lists"
          locale={locale}
        >
          {t("backToAdmin")}
        </Link>
        <Link
          className="inline-flex rounded-full border border-ink/10 px-4 py-2 text-sm font-medium text-ink/70"
          href="/dashboard"
          locale={locale}
        >
          {t("backToDashboard")}
        </Link>
      </div>
    </div>
  );
}
