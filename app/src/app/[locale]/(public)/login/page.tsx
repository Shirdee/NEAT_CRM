import {getTranslations} from "next-intl/server";

import {LoginForm} from "@/components/auth/login-form";

import {loginAction} from "./actions";

type LoginPageProps = {
  params: Promise<{locale: string}>;
  searchParams: Promise<{error?: string}>;
};

export default async function LoginPage({params, searchParams}: LoginPageProps) {
  const {locale} = await params;
  const {error} = await searchParams;
  const t = await getTranslations("Login");
  const errorMessage =
    error === "missing"
      ? t("form.errors.missingCredentials")
      : error === "invalid"
        ? t("form.errors.invalidCredentials")
        : null;

  return (
    <main className="min-h-screen bg-[linear-gradient(145deg,#f5f0e7_0%,#e7f2ef_45%,#dce8e7_100%)] px-4 py-10">
      <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <section className="space-y-6 rounded-[32px] bg-ink px-6 py-8 text-white shadow-soft sm:px-8">
          <p className="text-xs uppercase tracking-[0.35em] text-white/60">
            {t("eyebrow")}
          </p>
          <div className="space-y-4">
            <h1 className="max-w-xl text-4xl font-semibold tracking-tight">
              {t("title")}
            </h1>
            <p className="max-w-xl text-base leading-7 text-white/75">{t("subtitle")}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {["secure", "bilingual", "mobile"].map((item) => (
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4" key={item}>
                <p className="text-sm font-medium">{t(`highlights.${item}.title`)}</p>
                <p className="mt-2 text-sm text-white/70">
                  {t(`highlights.${item}.body`)}
                </p>
              </div>
            ))}
          </div>
        </section>
        <section className="rounded-[32px] bg-white p-6 shadow-soft sm:p-8">
          <div className="mb-6 space-y-2">
            <h2 className="text-2xl font-semibold text-ink">{t("form.title")}</h2>
            <p className="text-sm leading-6 text-slate-600">{t("form.subtitle")}</p>
          </div>
          <LoginForm
            action={loginAction}
            copy={{
              email: t("form.email"),
              password: t("form.password"),
              submit: t("form.submit"),
              hint: t("form.hint")
            }}
            error={errorMessage}
            locale={locale}
          />
        </section>
      </div>
    </main>
  );
}
