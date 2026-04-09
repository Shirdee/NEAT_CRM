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
    <main className="min-h-screen bg-[linear-gradient(160deg,rgba(245,240,231,0.98)_0%,rgba(223,247,241,0.92)_46%,rgba(236,246,243,0.94)_100%)] px-4 py-8 sm:py-10">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1.08fr_0.92fr] lg:items-stretch">
        <section className="relative overflow-hidden rounded-[34px] bg-ink px-6 py-8 text-white shadow-soft sm:px-8 sm:py-10">
          <div className="absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_top,rgba(15,118,110,0.32),transparent_60%)]" />
          <div className="relative space-y-7">
            <p className="text-xs uppercase tracking-[0.35em] text-white/60">
              {t("eyebrow")}
            </p>
            <div className="space-y-4">
              <h1 className="max-w-2xl font-display text-4xl font-semibold tracking-tight sm:text-5xl">
                {t("title")}
              </h1>
              <p className="max-w-xl text-base leading-7 text-white/70">{t("subtitle")}</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {["secure", "bilingual", "mobile"].map((item) => (
                <div
                  className="rounded-[28px] border border-white/10 bg-white/5 p-4 backdrop-blur"
                  key={item}
                >
                  <p className="text-sm font-semibold">{t(`highlights.${item}.title`)}</p>
                  <p className="mt-2 text-sm leading-6 text-white/70">
                    {t(`highlights.${item}.body`)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section className="rounded-[34px] border border-white/70 bg-white/90 p-6 shadow-panel backdrop-blur sm:p-8">
          <p className="text-xs uppercase tracking-[0.3em] text-coral">
            {t("eyebrow")}
          </p>
          <div className="mb-8 mt-3 space-y-2">
            <h2 className="font-display text-3xl font-semibold tracking-tight text-ink">
              {t("form.title")}
            </h2>
            <p className="max-w-md text-sm leading-6 text-slate-600">{t("form.subtitle")}</p>
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
