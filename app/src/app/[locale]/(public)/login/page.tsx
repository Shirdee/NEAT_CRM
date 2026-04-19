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
    <main className="min-h-[100dvh] bg-sand lg:grid lg:grid-cols-[420px_minmax(0,1fr)]">
      <aside className="hidden min-h-[100dvh] flex-col justify-between bg-ink px-10 py-12 text-white lg:flex">
        <div className="space-y-10">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-[16px] bg-white/10 text-xs font-semibold tracking-[0.32em]">
              CRM
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-white/55">{t("eyebrow")}</p>
              <p className="mt-1 text-lg font-semibold">{t("title")}</p>
            </div>
          </div>

          <div className="space-y-4">
            <h1 className="max-w-[18ch] font-display text-4xl font-semibold tracking-tight">
              {t("title")}
            </h1>
            <p className="max-w-md text-base leading-7 text-white/72">{t("subtitle")}</p>
          </div>
        </div>

        <div className="grid gap-3">
          {["secure", "bilingual", "mobile"].map((item) => (
            <div className="rounded-[22px] border border-white/10 bg-white/6 p-4 backdrop-blur" key={item}>
              <p className="text-sm font-semibold">{t(`highlights.${item}.title`)}</p>
              <p className="mt-2 text-sm leading-6 text-white/70">{t(`highlights.${item}.body`)}</p>
            </div>
          ))}
        </div>
      </aside>

      <section className="flex items-center justify-center px-4 py-6 lg:px-10 lg:py-12">
        <div className="w-full max-w-[560px] rounded-[24px] bg-white p-6 shadow-[0_24px_80px_rgba(16,36,63,0.14)] sm:p-8">
          <div className="[&_form]:space-y-5 [&_label]:block [&_label]:text-sm [&_label]:font-medium [&_label]:text-ink/70 [&_input]:w-full [&_input]:rounded-[12px] [&_input]:border-0 [&_input]:bg-mist [&_input]:px-4 [&_input]:py-3 [&_input]:text-[14px] [&_input]:text-ink [&_input]:placeholder:text-ink/30 [&_input]:focus:outline-none [&_input]:focus:ring-2 [&_input]:focus:ring-teal/35 [&_button]:mt-2 [&_button]:w-full [&_button]:rounded-full [&_button]:bg-coral [&_button]:py-3.5 [&_button]:text-[15px] [&_button]:font-semibold [&_button]:text-white [&_button]:transition [&_button]:hover:bg-coral/90">
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
          </div>
        </div>
      </section>
    </main>
  );
}
