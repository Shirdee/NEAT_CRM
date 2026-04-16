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
    <main className="flex min-h-[100dvh] flex-col bg-ink">
      {/* Mobile brand header */}
      <div className="relative overflow-hidden px-6 pb-8 pt-safe pt-10 lg:hidden">
        <div className="absolute inset-x-0 top-0 h-32 bg-transparent" />
        <div className="relative space-y-2">
          <p className="text-xs uppercase tracking-[0.35em] text-white/50">{t("eyebrow")}</p>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-white">
            {t("title")}
          </h1>
          <p className="text-sm leading-6 text-white/60">{t("subtitle")}</p>
        </div>
      </div>

      {/* Form card */}
      <div className="flex flex-1 items-start justify-center px-4 pb-10 lg:items-center lg:py-10">
        <div className="mx-auto w-full max-w-6xl lg:grid lg:grid-cols-[1.08fr_0.92fr] lg:items-stretch lg:gap-6">

          {/* Desktop brand panel — hidden on mobile */}
          <section className="relative hidden overflow-hidden rounded-[34px] bg-ink/85 px-8 py-10 text-white backdrop-blur lg:block">
            <div className="absolute inset-x-0 top-0 h-40 bg-transparent" />
            <div className="relative space-y-7">
              <p className="text-xs uppercase tracking-[0.35em] text-white/60">{t("eyebrow")}</p>
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

          {/* Form */}
          <section className="rounded-[34px] border border-white/10 bg-white/95 p-6 shadow-soft backdrop-blur sm:p-8">
            <p className="text-xs uppercase tracking-[0.3em] text-coral">{t("eyebrow")}</p>
            <div className="mb-8 mt-3 space-y-2">
              <h2 className="font-display text-3xl font-semibold tracking-tight text-ink">
                {t("form.title")}
              </h2>
              <p className="max-w-md text-sm leading-6 text-ink/70">{t("form.subtitle")}</p>
            </div>
            <LoginForm
              action={loginAction}
              copy={{
                identifier: t("form.identifier"),
                identifierPlaceholder: t("form.identifierPlaceholder"),
                password: t("form.password"),
                passwordPlaceholder: t("form.passwordPlaceholder"),
                submit: t("form.submit"),
                hint: t("form.hint")
              }}
              error={errorMessage}
              locale={locale}
            />
          </section>
        </div>
      </div>
    </main>
  );
}
