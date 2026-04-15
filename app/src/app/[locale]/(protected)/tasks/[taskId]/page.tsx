import {getTranslations} from "next-intl/server";
import {notFound} from "next/navigation";

import {Link} from "@/i18n/navigation";
import {canEditRecords, getCurrentSession} from "@/lib/auth/session";
import {getTaskById} from "@/lib/data/crm";
import {deleteTaskAction} from "../actions";

type TaskDetailPageProps = {
  params: Promise<{locale: "en" | "he"; taskId: string}>;
  searchParams: Promise<{success?: string; error?: string}>;
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
  const {success, error} = await searchParams;
  const t = await getTranslations("TaskDetail");
  const session = await getCurrentSession();
  const task = await getTaskById(taskId);

  if (!task) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {error ? (
        <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {error === "confirm" ? t("deleteConfirmError") : t("deleteError")}
        </p>
      ) : null}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.3em] text-coral">{t("eyebrow")}</p>
          <h2 className="text-3xl font-semibold text-ink">{task.notes || t("noNotes")}</h2>
          <p className="max-w-3xl text-sm leading-7 text-slate-600">{t("subtitle")}</p>
        </div>
        {session && canEditRecords(session.role) ? (
          <div className="space-y-2">
            <Link
              className="inline-flex rounded-full border border-slate-300 px-5 py-3 text-sm font-medium text-slate-700"
              href={`/tasks/${task.id}/edit`}
              locale={locale}
            >
              {t("edit")}
            </Link>
            <form action={deleteTaskAction.bind(null, locale)} className="space-y-2">
              <input name="taskId" type="hidden" value={task.id} />
              <label className="flex items-center gap-2 text-xs text-slate-600">
                <input name="confirm" type="checkbox" value="1" />
                {t("deleteConfirm")}
              </label>
              <button
                className="inline-flex rounded-full bg-rose-700 px-5 py-3 text-sm font-medium text-white"
                type="submit"
              >
                {t("delete")}
              </button>
            </form>
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
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">{t("dueDate")}</p>
          <p className="mt-3 text-sm text-slate-700">{formatDate(locale, task.dueDate)}</p>
        </article>
        <article className="rounded-[24px] border border-slate-200 bg-white p-5">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">{t("status")}</p>
          <p className="mt-3 text-sm text-slate-700">
            {labelForLocale(locale, {
              en: task.statusLabelEn,
              he: task.statusLabelHe
            })}
          </p>
        </article>
        <article className="rounded-[24px] border border-slate-200 bg-white p-5">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">{t("priority")}</p>
          <p className="mt-3 text-sm text-slate-700">
            {labelForLocale(locale, {
              en: task.priorityLabelEn,
              he: task.priorityLabelHe
            })}
          </p>
        </article>
        <article className="rounded-[24px] border border-slate-200 bg-white p-5">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">{t("type")}</p>
          <p className="mt-3 text-sm text-slate-700">
            {labelForLocale(locale, {
              en: task.taskTypeLabelEn,
              he: task.taskTypeLabelHe
            })}
          </p>
        </article>
      </div>

      <section className="grid gap-4 lg:grid-cols-3">
        <article className="rounded-[24px] border border-slate-200 bg-white p-5">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">{t("company")}</p>
          <p className="mt-3 text-sm text-slate-700">{task.companyName || t("noCompany")}</p>
        </article>
        <article className="rounded-[24px] border border-slate-200 bg-white p-5">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">{t("contact")}</p>
          <p className="mt-3 text-sm text-slate-700">{task.contactName || t("noContact")}</p>
        </article>
        <article className="rounded-[24px] border border-slate-200 bg-white p-5">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">{t("completedAt")}</p>
          <p className="mt-3 text-sm text-slate-700">{formatDate(locale, task.completedAt)}</p>
        </article>
      </section>

      <section className="rounded-[24px] border border-slate-200 bg-white p-5">
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
        <p className="mt-4 text-sm text-slate-600">{task.interactionSubject || t("noInteraction")}</p>
      </section>
    </div>
  );
}
