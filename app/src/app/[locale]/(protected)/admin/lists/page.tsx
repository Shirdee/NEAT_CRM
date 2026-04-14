import {getTranslations} from "next-intl/server";
import {redirect} from "next/navigation";

import {Link} from "@/i18n/navigation";
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
    <div className="space-y-6">
      <div className="space-y-3">
        <h2 className="text-3xl font-semibold text-ink">{t("title")}</h2>
        <p className="max-w-2xl text-sm leading-7 text-slate-600">{t("subtitle")}</p>
      </div>
      {error ? (
        <p className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {t("errors.generic")}
        </p>
      ) : null}
      <section className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
        <article className="rounded-[24px] border border-slate-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-ink">{t("createCategory.title")}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {t("createCategory.body")}
          </p>
          <form action={createCategoryAction} className="mt-5 space-y-3">
            <input name="locale" type="hidden" value={locale} />
            <input
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
              name="name"
              placeholder={t("createCategory.namePlaceholder")}
            />
            <input
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
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
          <article className="rounded-[24px] border border-slate-200 bg-white p-5">
            <h3 className="text-lg font-semibold text-ink">
              {locale === "he" ? "פעולות מרובות" : "Bulk actions"}
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {locale === "he"
                ? "כלי ניהול לעדכונים מרובים על שדות מובנים. השתמשו בזהירות."
                : "Admin tools for limited batch updates on structured fields. Use carefully."}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                className="inline-flex rounded-full bg-coral px-4 py-2 text-sm font-medium text-white"
                href="/admin/batch/companies"
                locale={locale}
              >
                {locale === "he" ? "עריכת חברות בריבוי" : "Batch edit companies"}
              </Link>
              <Link
                className="inline-flex rounded-full bg-ink px-4 py-2 text-sm font-medium text-white"
                href="/admin/batch/opportunities"
                locale={locale}
              >
                {locale === "he" ? "עריכת הזדמנויות בריבוי" : "Batch edit opportunities"}
              </Link>
              <Link
                className="inline-flex rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700"
                href="/admin/duplicates"
                locale={locale}
              >
                {locale === "he" ? "סקירת כפילויות" : "Duplicate review"}
              </Link>
            </div>
          </article>
          {categories.map((category) => (
            <article className="rounded-[24px] border border-slate-200 bg-white p-5" key={category.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-ink">{category.name}</h3>
                  <p className="text-sm text-slate-500">{category.key}</p>
                </div>
                <span className="rounded-full bg-mist px-3 py-1 text-xs font-medium text-ink">
                  {t("valueCount", {count: category.values.length})}
                </span>
              </div>
              <div className="mt-5 space-y-4">
                {category.values.map((value) => (
                  <div
                    className="rounded-[20px] border border-slate-200 bg-slate-50 p-4"
                    key={value.id}
                  >
                    <form action={updateValueAction} className="grid gap-3 lg:grid-cols-[1fr_1fr_1fr_auto]">
                      <input name="locale" type="hidden" value={locale} />
                      <input name="id" type="hidden" value={value.id} />
                      <input
                        className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm"
                        defaultValue={value.key}
                        name="key"
                      />
                      <input
                        className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm"
                        defaultValue={value.labelEn}
                        name="labelEn"
                      />
                      <input
                        className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm"
                        defaultValue={value.labelHe}
                        name="labelHe"
                      />
                      <button
                        className="rounded-full bg-ink px-4 py-2 text-sm font-medium text-white"
                        type="submit"
                      >
                        {t("updateValue")}
                      </button>
                    </form>
                    <form action={toggleValueAction} className="mt-3">
                      <input name="locale" type="hidden" value={locale} />
                      <input name="id" type="hidden" value={value.id} />
                      <button
                        className={`rounded-full px-4 py-2 text-sm font-medium ${
                          value.isActive
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-slate-200 text-slate-700"
                        }`}
                        type="submit"
                      >
                        {value.isActive ? t("deactivate") : t("activate")}
                      </button>
                    </form>
                  </div>
                ))}
              </div>
              <form action={createValueAction} className="mt-5 grid gap-3 rounded-[20px] bg-mist p-4 lg:grid-cols-[1fr_1fr_1fr_auto]">
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
                  className="rounded-full bg-coral px-4 py-2 text-sm font-medium text-white"
                  type="submit"
                >
                  {t("createValue.submit")}
                </button>
              </form>
            </article>
          ))}
        </div>
      </section>
      <Link
        className="inline-flex rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700"
        href="/dashboard"
        locale={locale}
      >
        {t("backToDashboard")}
      </Link>
    </div>
  );
}
