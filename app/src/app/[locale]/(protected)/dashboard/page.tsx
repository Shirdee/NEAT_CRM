import {getTranslations} from "next-intl/server";

import {getCurrentSession} from "@/lib/auth/session";

export default async function DashboardPage() {
  const t = await getTranslations("Dashboard");
  const session = await getCurrentSession();

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h2 className="text-3xl font-semibold text-ink">{t("title")}</h2>
        <p className="max-w-2xl text-sm leading-7 text-slate-600">
          {t("subtitle", {role: session?.role ?? "viewer"})}
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {[
          {value: "Auth", label: t("cards.auth")},
          {value: "RBAC", label: t("cards.rbac")},
          {value: "Data", label: t("cards.data")}
        ].map((card) => (
          <article className="rounded-[24px] bg-mist p-5" key={card.value}>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
              {card.value}
            </p>
            <p className="mt-4 text-sm leading-6 text-slate-700">{card.label}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
