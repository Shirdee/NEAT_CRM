import {getTranslations} from "next-intl/server";

import {Link} from "@/i18n/navigation";

type AccessDeniedPageProps = {
  params: Promise<{locale: string}>;
};

export default async function AccessDeniedPage({params}: AccessDeniedPageProps) {
  const {locale} = await params;
  const t = await getTranslations("AccessDenied");

  return (
    <main className="flex min-h-screen items-center justify-center bg-sand px-4">
      <section className="max-w-lg rounded-[32px] bg-white p-8 text-center shadow-soft">
        <p className="text-xs uppercase tracking-[0.3em] text-coral">{t("eyebrow")}</p>
        <h1 className="mt-4 text-3xl font-semibold text-ink">{t("title")}</h1>
        <p className="mt-4 text-sm leading-7 text-slate-600">{t("body")}</p>
        <Link
          className="mt-6 inline-flex rounded-full bg-ink px-5 py-3 text-sm font-medium text-white"
          href="/dashboard"
          locale={locale}
        >
          {t("cta")}
        </Link>
      </section>
    </main>
  );
}
