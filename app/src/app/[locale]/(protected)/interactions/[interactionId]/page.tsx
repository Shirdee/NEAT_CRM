import {getTranslations} from "next-intl/server";
import {notFound} from "next/navigation";

import {Link} from "@/i18n/navigation";
import {canEditRecords, getCurrentSession} from "@/lib/auth/session";
import {getInteractionById} from "@/lib/data/crm";

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
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.3em] text-coral">{t("eyebrow")}</p>
          <h2 className="text-3xl font-semibold text-ink">{interaction.subject}</h2>
          <p className="max-w-3xl text-sm leading-7 text-slate-600">{interaction.summary}</p>
        </div>
        {session && canEditRecords(session.role) ? (
          <div className="flex flex-wrap gap-3">
            <Link
              className="inline-flex rounded-full border border-slate-300 px-5 py-3 text-sm font-medium text-slate-700"
              href={`/interactions/${interaction.id}/edit`}
              locale={locale}
            >
              {t("edit")}
            </Link>
            <Link
              className="inline-flex rounded-full bg-ink px-5 py-3 text-sm font-medium text-white"
              href={`/tasks/new?compact=1&relatedInteractionId=${interaction.id}`}
              locale={locale}
            >
              {t("createFollowUp")}
            </Link>
          </div>
        ) : null}
      </div>

      {success ? (
        <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {success === "created" ? t("created") : t("updated")}
        </p>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-4">
        <article className="rounded-[24px] border border-slate-200 bg-white p-5">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">{t("date")}</p>
          <p className="mt-3 text-sm text-slate-700">{formatDate(locale, interaction.interactionDate)}</p>
        </article>
        <article className="rounded-[24px] border border-slate-200 bg-white p-5">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">{t("type")}</p>
          <p className="mt-3 text-sm text-slate-700">
            {labelForLocale(locale, {
              en: interaction.interactionTypeLabelEn,
              he: interaction.interactionTypeLabelHe
            })}
          </p>
        </article>
        <article className="rounded-[24px] border border-slate-200 bg-white p-5">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">{t("company")}</p>
          <p className="mt-3 text-sm text-slate-700">{interaction.companyName || t("noCompany")}</p>
        </article>
        <article className="rounded-[24px] border border-slate-200 bg-white p-5">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">{t("contact")}</p>
          <p className="mt-3 text-sm text-slate-700">{interaction.contactName || t("noContact")}</p>
        </article>
      </div>

      <section className="rounded-[24px] border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-ink">{t("tasksTitle")}</h3>
          <Link className="text-sm font-medium text-coral" href="/tasks" locale={locale}>
            {t("viewTasks")}
          </Link>
        </div>
        {interaction.relatedTasks.length === 0 ? (
          <p className="mt-4 text-sm text-slate-600">{t("tasksEmpty")}</p>
        ) : (
          <div className="mt-4 space-y-3">
            {interaction.relatedTasks.map((task) => (
              <Link
                className="block rounded-[20px] bg-mist p-4 transition hover:bg-sand"
                href={`/tasks/${task.id}`}
                key={task.id}
                locale={locale}
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-medium text-ink">{task.notes || t("noTaskNotes")}</p>
                    <p className="text-sm text-slate-600">{formatDate(locale, task.dueDate)}</p>
                  </div>
                  <p className="text-sm text-slate-600">
                    {labelForLocale(locale, {
                      en: task.statusLabelEn,
                      he: task.statusLabelHe
                    })}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
