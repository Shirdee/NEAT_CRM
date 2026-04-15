import {getTranslations} from "next-intl/server";

import {Link} from "@/i18n/navigation";
import {listLeadSourceCounts, listLookupOptions} from "@/lib/data/crm";
import {SurfaceCard} from "@/components/ui/surface-card";

type LeadsBySourceReportPageProps = {
  params: Promise<{locale: "en" | "he"}>;
};

function labelForLocale(locale: "en" | "he", values: {en?: string | null; he?: string | null}) {
  return locale === "he" ? values.he || values.en || "—" : values.en || values.he || "—";
}

export default async function LeadsBySourceReportPage({params}: LeadsBySourceReportPageProps) {
  const {locale} = await params;
  const t = await getTranslations("LeadsBySourceReport");
  const [leadSourceCounts, sourceOptions] = await Promise.all([
    listLeadSourceCounts(),
    listLookupOptions("lead_source")
  ]);

  const sourceMap = new Map(sourceOptions.map((option) => [option.id, option]));
  const rows = leadSourceCounts
    .map(({sourceValueId, count}) => {
      const option = sourceValueId ? sourceMap.get(sourceValueId) ?? null : null;
      return {
        sourceValueId,
        count,
        label: option
          ? labelForLocale(locale, {en: option.labelEn, he: option.labelHe})
          : t("unknown")
      };
    })
    .sort((left, right) => right.count - left.count || left.label.localeCompare(right.label));

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <p className="text-xs uppercase tracking-[0.3em] text-coral">{t("eyebrow")}</p>
        <h2 className="font-display text-3xl font-semibold tracking-tight text-ink">{t("title")}</h2>
        <p className="max-w-3xl text-sm leading-7 text-ink/70">{t("subtitle")}</p>
      </div>

      <SurfaceCard className="overflow-hidden p-0">
        <div className="grid grid-cols-[minmax(0,1fr)_120px] gap-4 bg-mist px-5 py-4 text-xs font-semibold uppercase tracking-[0.24em] text-ink/40">
          <span>{t("columns.source")}</span>
          <span className="text-right">{t("columns.count")}</span>
        </div>
        <div>
          {rows.map((row) => (
            <div className="grid grid-cols-[minmax(0,1fr)_120px] gap-4 px-5 py-4" key={row.sourceValueId ?? "unknown"}>
              <span className="text-sm font-medium text-ink">{row.label}</span>
              <span className="text-right text-sm font-semibold text-ink">{row.count}</span>
            </div>
          ))}
        </div>
      </SurfaceCard>

      <Link className="inline-flex text-sm font-medium text-ink/70" href="/reports" locale={locale}>
        {t("back")}
      </Link>
    </div>
  );
}
