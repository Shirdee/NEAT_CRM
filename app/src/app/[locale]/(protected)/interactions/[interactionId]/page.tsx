import {getTranslations} from "next-intl/server";
import {notFound} from "next/navigation";

import {Link} from "@/i18n/navigation";
import {canEditRecords, getCurrentSession} from "@/lib/auth/session";
import {getInteractionById, listLookupOptions} from "@/lib/data/crm";
import {closeInteractionAction} from "@/app/[locale]/(protected)/interactions/actions";
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
  const [interaction, closeReasonOptions] = await Promise.all([
    getInteractionById(interactionId),
    listLookupOptions("close_reason")
  ]);

  if (!interaction) {
    notFound();
  }

  return (
    <div className="space-y-6 px-5 py-6 lg:px-10 lg:py-8">
      {success ? (
        <p className="rounded-2xl bg-teal/10 px-4 py-3 text-sm font-medium text-teal">
          {success === "created" ? t("created") : success === "closed" ? t("closed") : t("updated")}
        </p>
      ) : null}

      <SurfaceCard className="space-y-6 bg-white/95">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.3em] text-coral">{t("eyebrow")}</p>
            <h2 className="font-display text-3xl font-semibold tracking-tight text-ink">
              {interaction.subject}
            </h2>
            <p className="max-w-3xl text-sm leading-7 text-ink/75">{interaction.summary}</p>
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
                className="inline-flex items-center justify-center rounded-full bg-mist px-5 py-3 text-sm font-medium text-ink/80"
                href={`/interactions/${interaction.id}/edit`}
                locale={locale}
              >
                {t("edit")}
              </Link>
              <Link
                className="inline-flex items-center justify-center rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white"
                href={`/tasks/new?compact=1&relatedInteractionId=${interaction.id}`}
                locale={locale}
              >
                {t("createFollowUp")}
              </Link>
              <form action={closeInteractionAction.bind(null, locale)} className="flex items-center gap-2">
                <input name="interactionId" type="hidden" value={interaction.id} />
                <select
                  className="rounded-full bg-mist px-4 py-2.5 text-sm text-ink/80 focus:outline-none focus:ring-2 focus:ring-teal/20"
                  defaultValue=""
                  name="closeReasonValueId"
                  required
                >
                  <option disabled value="">
                    {t("closeReasonPlaceholder")}
                  </option>
                  {closeReasonOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {labelForLocale(locale, {en: option.labelEn, he: option.labelHe})}
                    </option>
                  ))}
                </select>
                <button
                  className="inline-flex items-center justify-center rounded-full bg-coral px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-coral/90"
                  type="submit"
                >
                  {t("closeAction")}
                </button>
              </form>
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
          <InfoPair
            accent="teal"
            label={t("closeReason")}
            value={
              interaction.closeReasonLabelEn || interaction.closeReasonLabelHe
                ? labelForLocale(locale, {
                    en: interaction.closeReasonLabelEn,
                    he: interaction.closeReasonLabelHe
                  })
                : t("closeReasonEmpty")
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
          <p className="mt-4 text-sm text-ink/75">{t("tasksEmpty")}</p>
        ) : (
          <div className="mt-4 space-y-3">
            {interaction.relatedTasks.map((task) => (
              <Link
                className="block rounded-[22px] bg-mist/80 p-4 transition hover:bg-sand hover:shadow-soft"
                href={`/tasks/${task.id}`}
                key={task.id}
                locale={locale}
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-medium text-ink">{task.notes || t("noTaskNotes")}</p>
                    <p className="text-sm text-ink/70">{formatDate(locale, task.dueDate)}</p>
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
