import {getTranslations} from "next-intl/server";
import {notFound} from "next/navigation";

import {Link} from "@/i18n/navigation";
import {canEditRecords, getCurrentSession} from "@/lib/auth/session";
import {getTaskById, listLookupOptions} from "@/lib/data/crm";
import {closeTaskAction} from "@/app/[locale]/(protected)/tasks/actions";
import {SurfaceCard} from "@/components/ui/surface-card";

type TaskDetailPageProps = {
  params: Promise<{locale: "en" | "he"; taskId: string}>;
  searchParams: Promise<{error?: string; success?: string}>;
};

function labelForLocale(
  locale: "en" | "he",
  values: {en?: string | null; he?: string | null}
) {
  return locale === "he" ? values.he || values.en || "—" : values.en || values.he || "—";
}

function formatDate(locale: "en" | "he", value: Date | string | null) {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat(locale === "he" ? "he-IL" : "en-US", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

export default async function TaskDetailPage({params, searchParams}: TaskDetailPageProps) {
  const {locale, taskId} = await params;
  const {error, success} = await searchParams;
  const t = await getTranslations("TaskDetail");
  const session = await getCurrentSession();
  const [task, closeReasonOptions] = await Promise.all([getTaskById(taskId), listLookupOptions("close_reason")]);

  if (!task) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.3em] text-coral">{t("eyebrow")}</p>
          <h2 className="text-3xl font-semibold text-ink">{task.notes || t("noNotes")}</h2>
          <p className="max-w-3xl text-sm leading-7 text-ink/60">{t("subtitle")}</p>
        </div>
        {session && canEditRecords(session.role) ? (
          <div>
            <Link
              className="inline-flex rounded-full border border-ink/10 px-5 py-3 text-sm font-medium text-ink/70"
              href={`/tasks/${task.id}/edit`}
              locale={locale}
            >
              {t("edit")}
            </Link>
          </div>
        ) : null}
      </div>

      {success ? (
        <p className="rounded-2xl bg-teal/10 px-4 py-3 text-sm font-medium text-teal">
          {success === "created" ? t("created") : success === "closed" ? t("closed") : t("updated")}
        </p>
      ) : null}
      {error ? (
        <p className="rounded-2xl bg-amber/10 px-4 py-3 text-sm text-ink">
          {error === "meeting-date" ? t("meetingDateError") : t("closeError")}
        </p>
      ) : null}

      {session && canEditRecords(session.role) ? (
        <SurfaceCard className="space-y-3 bg-white/95">
          <p className="text-sm font-semibold text-ink">{t("closeActionTitle")}</p>
          <form action={closeTaskAction.bind(null, locale)} className="flex flex-wrap items-center gap-2">
            <input name="taskId" type="hidden" value={task.id} />
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
            <input
              className="rounded-full bg-mist px-4 py-2.5 text-sm text-ink/80 focus:outline-none focus:ring-2 focus:ring-teal/20"
              name="meetingDate"
              title={t("meetingDate")}
              type="datetime-local"
            />
            <button
              className="inline-flex items-center justify-center rounded-full bg-coral px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-coral/90"
              type="submit"
            >
              {t("closeAction")}
            </button>
          </form>
        </SurfaceCard>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-4">
        <article className="rounded-[24px] border border-ink/8 bg-white p-5">
          <p className="text-xs uppercase tracking-[0.24em] text-ink/50">{t("dueDate")}</p>
          <p className="mt-3 text-sm text-ink/70">{formatDate(locale, task.dueDate)}</p>
        </article>
        <article className="rounded-[24px] border border-ink/8 bg-white p-5">
          <p className="text-xs uppercase tracking-[0.24em] text-ink/50">{t("status")}</p>
          <p className="mt-3 text-sm text-ink/70">
            {labelForLocale(locale, {
              en: task.statusLabelEn,
              he: task.statusLabelHe
            })}
          </p>
        </article>
        <article className="rounded-[24px] border border-ink/8 bg-white p-5">
          <p className="text-xs uppercase tracking-[0.24em] text-ink/50">{t("priority")}</p>
          <p className="mt-3 text-sm text-ink/70">
            {labelForLocale(locale, {
              en: task.priorityLabelEn,
              he: task.priorityLabelHe
            })}
          </p>
        </article>
        <article className="rounded-[24px] border border-ink/8 bg-white p-5">
          <p className="text-xs uppercase tracking-[0.24em] text-ink/50">{t("type")}</p>
          <p className="mt-3 text-sm text-ink/70">
            {labelForLocale(locale, {
              en: task.taskTypeLabelEn,
              he: task.taskTypeLabelHe
            })}
          </p>
        </article>
        <article className="rounded-[24px] border border-ink/8 bg-white p-5">
          <p className="text-xs uppercase tracking-[0.24em] text-ink/50">{t("closeReason")}</p>
          <p className="mt-3 text-sm text-ink/70">
            {labelForLocale(locale, {
              en: task.closeReasonLabelEn,
              he: task.closeReasonLabelHe
            })}
          </p>
        </article>
      </div>

      <section className="grid gap-4 lg:grid-cols-3">
        <article className="rounded-[24px] border border-ink/8 bg-white p-5">
          <p className="text-xs uppercase tracking-[0.24em] text-ink/50">{t("company")}</p>
          <p className="mt-3 text-sm text-ink/70">{task.companyName || t("noCompany")}</p>
        </article>
        <article className="rounded-[24px] border border-ink/8 bg-white p-5">
          <p className="text-xs uppercase tracking-[0.24em] text-ink/50">{t("contact")}</p>
          <p className="mt-3 text-sm text-ink/70">{task.contactName || t("noContact")}</p>
        </article>
        <article className="rounded-[24px] border border-ink/8 bg-white p-5">
          <p className="text-xs uppercase tracking-[0.24em] text-ink/50">{t("completedAt")}</p>
          <p className="mt-3 text-sm text-ink/70">{formatDate(locale, task.completedAt)}</p>
        </article>
        <article className="rounded-[24px] border border-ink/8 bg-white p-5">
          <p className="text-xs uppercase tracking-[0.24em] text-ink/50">{t("followUpEmail")}</p>
          <p className="mt-3 text-sm text-ink/70">{task.followUpEmail || "—"}</p>
        </article>
      </section>

      <section className="rounded-[24px] border border-ink/8 bg-white p-5">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-ink">{t("relatedInteraction")}</h3>
          {task.relatedInteractionId ? (
            <Link
              className="text-sm font-medium text-coral"
              href={`/interactions/${task.relatedInteractionId}`}
              locale={locale}
            >
              {t("viewInteraction")}
            </Link>
          ) : null}
        </div>
        <p className="mt-4 text-sm text-ink/60">{task.interactionSubject || t("noInteraction")}</p>
      </section>
    </div>
  );
}
