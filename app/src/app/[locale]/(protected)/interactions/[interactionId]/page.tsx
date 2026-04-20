import {getTranslations} from "next-intl/server";
import {notFound} from "next/navigation";

import {Link} from "@/i18n/navigation";
import {canEditRecords, getCurrentSession} from "@/lib/auth/session";
import {getInteractionById} from "@/lib/data/crm";
import {InfoPair} from "@/components/ui/info-pair";
import {StatusChip} from "@/components/ui/status-chip";
import {SurfaceCard} from "@/components/ui/surface-card";

type InteractionDetailPageProps = {
  params: Promise<{locale: "en" | "he"; interactionId: string}>;
  searchParams: Promise<{success?: string}>;
};

function labelForLocale(
  locale: "en" | "he",
  values: {en?: string | null; he?: string | null}
) {
  return locale === "he" ? values.he || values.en || "—" : values.en || values.he || "—";
}

function formatDate(locale: "en" | "he", value: Date | string) {
  return new Intl.DateTimeFormat(locale === "he" ? "he-IL" : "en-US", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

export default async function InteractionDetailPage({params, searchParams}: InteractionDetailPageProps) {
  const {locale, interactionId} = await params;
  const {success} = await searchParams;
  const t = await getTranslations("InteractionDetail");
  const session = await getCurrentSession();
  const interaction = await getInteractionById(interactionId);

  if (!interaction) {
    notFound();
  }

  return (
    <div className="space-y-6 px-5 py-6 lg:px-10 lg:py-8">
      {success ? (
        <p className="rounded-2xl bg-teal/8 px-4 py-3 text-sm text-teal">
          {success === "created" ? t("created") : t("updated")}
        </p>
      ) : null}

      <SurfaceCard className="space-y-5 bg-white/95">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.3em] text-coral">{t("eyebrow")}</p>
            <h2 className="font-display text-3xl font-semibold tracking-tight text-ink">
              {interaction.subject}
            </h2>
            <p className="max-w-3xl text-sm leading-7 text-ink/60">{interaction.summary}</p>
            <div className="flex flex-wrap gap-2">
              <StatusChip tone="teal">
                {labelForLocale(locale, {
                  en: interaction.interactionTypeLabelEn,
                  he: interaction.interactionTypeLabelHe
                })}
              </StatusChip>
              <StatusChip>
                {labelForLocale(locale, {
                  en: interaction.outcomeLabelEn,
                  he: interaction.outcomeLabelHe
                })}
              </StatusChip>
            </div>
          </div>
          {session && canEditRecords(session.role) ? (
            <div className="flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap lg:w-auto">
              <Link
                className="inline-flex items-center justify-center rounded-full bg-mist px-5 py-3 text-sm font-medium text-ink/70"
                href={`/interactions/${interaction.id}/edit`}
                locale={locale}
              >
                {t("edit")}
              </Link>
              <Link
                className="inline-flex items-center justify-center rounded-full bg-ink px-5 py-3 text-sm font-medium text-white"
                href={`/tasks/new?compact=1&relatedInteractionId=${interaction.id}`}
                locale={locale}
              >
                {t("createFollowUp")}
              </Link>
            </div>
          ) : null}
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <InfoPair label={t("date")} value={formatDate(locale, interaction.interactionDate)} />
          <InfoPair
            accent="teal"
            label={t("type")}
            value={labelForLocale(locale, {
              en: interaction.interactionTypeLabelEn,
              he: interaction.interactionTypeLabelHe
            })}
          />
          <InfoPair
            accent="coral"
            label={t("company")}
            value={
              interaction.companyId && interaction.companyName ? (
                <Link className="font-medium text-coral hover:underline" href={`/companies/${interaction.companyId}`} locale={locale}>
                  {interaction.companyName}
                </Link>
              ) : (
                t("noCompany")
              )
            }
          />
          <InfoPair
            label={t("contact")}
            value={
              interaction.contactId && interaction.contactName ? (
                <Link className="font-medium text-coral hover:underline" href={`/contacts/${interaction.contactId}`} locale={locale}>
                  {interaction.contactName}
                </Link>
              ) : (
                t("noContact")
              )
            }
          />
        </div>
      </SurfaceCard>

      <SurfaceCard className="space-y-5 bg-white/95">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-ink">{t("tasksTitle")}</h3>
          <Link className="text-sm font-medium text-coral" href="/tasks" locale={locale}>
            {t("viewTasks")}
          </Link>
        </div>
        {interaction.relatedTasks.length === 0 ? (
          <p className="mt-4 text-sm text-ink/60">{t("tasksEmpty")}</p>
        ) : (
          <div className="mt-4 space-y-3">
            {interaction.relatedTasks.map((task) => (
              <Link
                className="block rounded-[24px] bg-mist p-4 transition hover:bg-sand hover:shadow-soft"
                href={`/tasks/${task.id}`}
                key={task.id}
                locale={locale}
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-medium text-ink">{task.notes || t("noTaskNotes")}</p>
                    <p className="text-sm text-ink/60">{formatDate(locale, task.dueDate)}</p>
                  </div>
                  <StatusChip tone="ink">
                    {labelForLocale(locale, {
                      en: task.statusLabelEn,
                      he: task.statusLabelHe
                    })}
                  </StatusChip>
                </div>
              </Link>
            ))}
          </div>
        )}
      </SurfaceCard>
    </div>
  );
}
