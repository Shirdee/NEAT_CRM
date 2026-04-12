import {getTranslations} from "next-intl/server";

import {Link} from "@/i18n/navigation";
import {SurfaceCard} from "@/components/ui/surface-card";

type ReportsHomePageProps = {
  params: Promise<{locale: "en" | "he"}>;
};

export default async function ReportsHomePage({params}: ReportsHomePageProps) {
  const {locale} = await params;
  const t = await getTranslations("Reports");

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <p className="text-xs uppercase tracking-[0.3em] text-coral">{t("eyebrow")}</p>
        <h2 className="font-display text-3xl font-semibold tracking-tight text-ink">{t("title")}</h2>
        <p className="max-w-3xl text-sm leading-7 text-slate-600">{t("subtitle")}</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {[
          {
            href: "/reports/leads-by-source",
            title: t("cards.leadsBySource.title"),
            body: t("cards.leadsBySource.body")
          },
          {
            href: "/reports/meetings",
            title: t("cards.meetings.title"),
            body: t("cards.meetings.body")
          }
        ].map((card) => (
          <Link
            className="block"
            href={card.href}
            key={card.href}
            locale={locale}
          >
            <SurfaceCard className="space-y-3 transition hover:-translate-y-0.5 hover:shadow-panel">
              <h3 className="text-xl font-semibold text-ink">{card.title}</h3>
              <p className="text-sm leading-7 text-slate-600">{card.body}</p>
            </SurfaceCard>
          </Link>
        ))}
      </div>
    </div>
  );
}

