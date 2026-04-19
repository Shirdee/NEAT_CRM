import {getTranslations} from "next-intl/server";
import {redirect} from "next/navigation";

import {Link} from "@/i18n/navigation";
import {SurfaceCard} from "@/components/ui/surface-card";
import {canManageAdminLists, getCurrentSession} from "@/lib/auth/session";
import {listAdminListCategories} from "@/lib/data/repository";

import {
  createCategoryAction,
  createValueAction,
  toggleValueAction,
  updateValueAction
} from "./actions";

type AdminListsPageProps = {
  params: Promise<{locale: string}>;
  searchParams: Promise<{error?: string}>;
};

export default async function AdminListsPage({params, searchParams}: AdminListsPageProps) {
  const {locale} = await params;
  const {error} = await searchParams;
  const t = await getTranslations("AdminLists");
  const session = await getCurrentSession();

  if (!session || !canManageAdminLists(session.role)) {
    redirect(`/${locale}/access-denied`);
  }

  const categories = await listAdminListCategories();

  return (
    <div className="space-y-4 lg:space-y-5">
      <SurfaceCard className="overflow-hidden bg-white/95">
        <div className="space-y-3">
          <h2 className="font-display text-3xl font-semibold tracking-tight text-ink">{t("title")}</h2>
          <p className="max-w-2xl text-sm leading-7 text-ink/70">{t("subtitle")}</p>
        </div>
      </SurfaceCard>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Link
          className="rounded-[28px] border border-ink/10 bg-white/95 p-5 shadow-[0_12px_40px_rgba(58,48,45,0.06)] transition hover:-translate-y-0.5 hover:border-coral/40 hover:shadow-panel"
          href="/admin/users"
          locale={locale}
        >
          <p className="text-xs uppercase tracking-[0.24em] text-coral">{t("tools.users.eyebrow")}</p>
          <h3 className="mt-2 text-lg font-semibold text-ink">{t("tools.users.title")}</h3>
          <p className="mt-2 text-sm leading-6 text-ink/70">{t("tools.users.body")}</p>
        </Link>
        <Link
          className="rounded-[28px] border border-ink/10 bg-white/95 p-5 shadow-[0_12px_40px_rgba(58,48,45,0.06)] transition hover:-translate-y-0.5 hover:border-coral/40 hover:shadow-panel"
          href="/admin/batch"
          locale={locale}
        >
          <p className="text-xs uppercase tracking-[0.24em] text-coral">{t("tools.batch.eyebrow")}</p>
          <h3 className="mt-2 text-lg font-semibold text-ink">{t("tools.batch.title")}</h3>
          <p className="mt-2 text-sm leading-6 text-ink/70">{t("tools.batch.body")}</p>
        </Link>
        <Link
          className="rounded-[28px] border border-ink/10 bg-white/95 p-5 shadow-[0_12px_40px_rgba(58,48,45,0.06)] transition hover:-translate-y-0.5 hover:border-coral/40 hover:shadow-panel"
          href="/admin/duplicates"
          locale={locale}
        >
          <p className="text-xs uppercase tracking-[0.24em] text-coral">{t("tools.duplicates.eyebrow")}</p>
          <h3 className="mt-2 text-lg font-semibold text-ink">{t("tools.duplicates.title")}</h3>
          <p className="mt-2 text-sm leading-6 text-ink/70">{t("tools.duplicates.body")}</p>
        </Link>
      </section>

      {error ? (
        <p className="rounded-2xl bg-coral/10 px-4 py-3 text-sm text-coral">{t("errors.generic")}</p>
      ) : null}

      <section className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
        <article className="rounded-[28px] border border-ink/10 bg-white/95 p-5 shadow-[0_12px_40px_rgba(58,48,45,0.06)]">
          <h3 className="text-lg font-semibold text-ink">{t("createCategory.title")}</h3>
          <p className="mt-2 text-sm leading-6 text-ink/70">{t("createCategory.body")}</p>
          <form action={createCategoryAction} className="mt-5 space-y-3">
            <input name="locale" type="hidden" value={locale} />
            <input
              className="w-full rounded-2xl border border-mist px-4 py-3 text-sm"
              name="name"
              placeholder={t("createCategory.namePlaceholder")}
            />
            <input
              className="w-full rounded-2xl border border-mist px-4 py-3 text-sm"
              name="key"
              placeholder={t("createCategory.keyPlaceholder")}
            />
            <button
              className="inline-flex rounded-full bg-ink px-4 py-2 text-sm font-medium text-white"
              type="submit"
            >
              {t("createCategory.submit")}
            </button>
          </form>
        </article>
        <div className="space-y-5">
          {categories.map((category) => (
            <article className="rounded-[28px] border border-ink/10 bg-white/95 p-5 shadow-[0_12px_40px_rgba(58,48,45,0.06)]" key={category.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-ink">{category.name}</h3>
                  <p className="text-sm text-ink/50">{category.key}</p>
                </div>
                <span className="rounded-full bg-mist px-3 py-1 text-xs font-medium text-ink/70">
                  {category.values.length} {t("values")}
                </span>
              </div>
              <div className="mt-4 space-y-3">
                {category.values.map((value) => (
                  <article
                    className={`rounded-[24px] border p-4 ${value.isActive ? "border-ink/10 bg-white" : "border-dashed border-ink/10 bg-mist/60"}`}
                    key={value.id}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h4 className="text-base font-semibold text-ink">{value.labelEn}</h4>
                        <p className="text-sm text-ink/60">{value.labelHe}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <span className="rounded-full bg-sand px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/60">
                          {value.key}
                        </span>
                        <span
                          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${
                            value.isActive ? "bg-emerald-100 text-emerald-800" : "bg-mist text-ink/55"
                          }`}
                        >
                          {value.isActive ? t("status.active") : t("status.inactive")}
                        </span>
                      </div>
                    </div>
                    <form action={updateValueAction} className="mt-4 grid gap-3 md:grid-cols-[1fr_1fr_1fr_auto]">
                      <input name="locale" type="hidden" value={locale} />
                      <input name="valueId" type="hidden" value={value.id} />
                      <input
                        className="rounded-2xl border border-transparent bg-white px-3 py-2 text-sm"
                        name="key"
                        placeholder={t("createValue.keyPlaceholder")}
                        defaultValue={value.key}
                      />
                      <input
                        className="rounded-2xl border border-transparent bg-white px-3 py-2 text-sm"
                        name="labelEn"
                        placeholder={t("createValue.labelEnPlaceholder")}
                        defaultValue={value.labelEn}
                      />
                      <input
                        className="rounded-2xl border border-transparent bg-white px-3 py-2 text-sm"
                        name="labelHe"
                        placeholder={t("createValue.labelHePlaceholder")}
                        defaultValue={value.labelHe}
                      />
                      <button
                        className="rounded-full bg-coral px-4 py-2 text-sm font-medium text-white"
                        type="submit"
                      >
                        {t("createValue.submit")}
                      </button>
                    </form>
                    <form action={createValueAction} className="mt-3 grid gap-3 md:grid-cols-[1fr_1fr_1fr_auto]">
                      <input name="locale" type="hidden" value={locale} />
                      <input name="categoryId" type="hidden" value={category.id} />
                      <input
                        className="rounded-2xl border border-transparent bg-white px-3 py-2 text-sm"
                        name="key"
                        placeholder={t("createValue.keyPlaceholder")}
                      />
                      <input
                        className="rounded-2xl border border-transparent bg-white px-3 py-2 text-sm"
                        name="labelEn"
                        placeholder={t("createValue.labelEnPlaceholder")}
                      />
                      <input
                        className="rounded-2xl border border-transparent bg-white px-3 py-2 text-sm"
                        name="labelHe"
                        placeholder={t("createValue.labelHePlaceholder")}
                      />
                      <button
                        className="rounded-full bg-ink px-4 py-2 text-sm font-medium text-white"
                        type="submit"
                      >
                        {t("createValue.submit")}
                      </button>
                    </form>
                    <form action={toggleValueAction} className="mt-3">
                      <input name="locale" type="hidden" value={locale} />
                      <input name="valueId" type="hidden" value={value.id} />
                      <button
                        className="rounded-full border border-ink/10 px-4 py-2 text-sm font-medium text-ink/70"
                        type="submit"
                      >
                        {value.isActive ? t("actions.deactivate") : t("actions.activate")}
                      </button>
                    </form>
                  </article>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
      <Link
        className="inline-flex rounded-full border border-ink/10 px-4 py-2 text-sm font-medium text-ink/70"
        href="/dashboard"
        locale={locale}
      >
        {t("backToDashboard")}
      </Link>
    </div>
  );
}
