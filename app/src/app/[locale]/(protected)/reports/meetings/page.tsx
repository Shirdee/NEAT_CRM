import {getTranslations} from "next-intl/server";

import {Link} from "@/i18n/navigation";
import {listInteractions, listLookupOptions} from "@/lib/data/crm";
import {SurfaceCard} from "@/components/ui/surface-card";

type MeetingsReportPageProps = {
  params: Promise<{locale: "en" | "he"}>;
};

function monthKey(value: Date) {
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}`;
}

export default async function MeetingsReportPage({params}: MeetingsReportPageProps) {
  const {locale} = await params;
  const t = await getTranslations("MeetingsReport");
  const interactionTypeOptions = await listLookupOptions("interaction_type");
  const meetingTypeId = interactionTypeOptions.find((option) => option.key === "meeting")?.id ?? null;
  const interactions = meetingTypeId ? await listInteractions({interactionTypeValueId: meetingTypeId}) : [];

  const formatter = new Intl.DateTimeFormat(locale === "he" ? "he-IL" : "en-US", {
    month: "short",
    year: "numeric"
  });

  const buckets = new Map<string, number>();
  for (const interaction of interactions) {
    const key = monthKey(new Date(interaction.interactionDate));
    buckets.set(key, (buckets.get(key) ?? 0) + 1);
  }

  const rows = Array.from(buckets.entries())
    .map(([key, count]) => {
      const [year, month] = key.split("-");
      const date = new Date(Number(year), Number(month) - 1, 1);
      return {key, count, label: formatter.format(date)};
    })
    .sort((left, right) => right.key.localeCompare(left.key));

  const recent = interactions
    .slice()
    .sort((left, right) => new Date(right.interactionDate).getTime() - new Date(left.interactionDate).getTime())
    .slice(0, 8);

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <p className="text-xs uppercase tracking-[0.3em] text-coral">{t("eyebrow")}</p>
        <h2 className="font-display text-3xl font-semibold tracking-tight text-ink">{t("title")}</h2>
        <p className="max-w-3xl text-sm leading-7 text-slate-600">{t("subtitle")}</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <SurfaceCard className="overflow-hidden p-0">
          <div className="grid grid-cols-[minmax(0,1fr)_120px] gap-4 bg-mist px-5 py-4 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
            <span>{t("columns.period")}</span>
            <span className="text-right">{t("columns.count")}</span>
          </div>
          <div className="divide-y divide-slate-100">
            {rows.length === 0 ? (
              <p className="px-5 py-6 text-sm text-slate-600">{t("empty")}</p>
            ) : (
              rows.map((row) => (
                <div className="grid grid-cols-[minmax(0,1fr)_120px] gap-4 px-5 py-4" key={row.key}>
                  <span className="text-sm font-medium text-ink">{row.label}</span>
                  <span className="text-right text-sm font-semibold text-ink">{row.count}</span>
                </div>
              ))
            )}
          </div>
        </SurfaceCard>

        <SurfaceCard className="space-y-4">
          <h3 className="text-lg font-semibold text-ink">{t("recentTitle")}</h3>
          <div className="space-y-3">
            {recent.map((interaction) => (
              <Link
                className="block rounded-[22px] bg-mist px-4 py-4 transition hover:bg-mint"
                href={`/interactions/${interaction.id}`}
                key={interaction.id}
                locale={locale}
              >
                <p className="font-medium text-ink">{interaction.subject}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-600">
                  <span>{interaction.companyName || interaction.contactName || t("general")}</span>
                  <span aria-hidden="true">•</span>
                  <span>
                    {new Intl.DateTimeFormat(locale === "he" ? "he-IL" : "en-US", {dateStyle: "medium"}).format(
                      new Date(interaction.interactionDate)
                    )}
                  </span>
                </div>
              </Link>
            ))}
            {recent.length === 0 ? <p className="text-sm text-slate-600">{t("empty")}</p> : null}
          </div>
        </SurfaceCard>
      </div>

      <Link className="inline-flex text-sm font-medium text-slate-700" href="/reports" locale={locale}>
        {t("back")}
      </Link>
    </div>
  );
}

