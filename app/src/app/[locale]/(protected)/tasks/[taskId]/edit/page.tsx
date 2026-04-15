import {getTranslations} from "next-intl/server";
import {notFound, redirect} from "next/navigation";

import {TaskForm} from "@/components/crm/task-form";
import {Link} from "@/i18n/navigation";
import {canEditRecords, getCurrentSession} from "@/lib/auth/session";
import {getTaskById, getTaskFormOptions} from "@/lib/data/crm";

import {deleteTaskAction, updateTaskAction} from "../../actions";

type EditTaskPageProps = {
  params: Promise<{locale: "en" | "he"; taskId: string}>;
  searchParams: Promise<{error?: string}>;
};

function toInputDateTime(value: Date | string) {
  return new Date(value).toISOString().slice(0, 16);
}

export default async function EditTaskPage({params, searchParams}: EditTaskPageProps) {
  const {locale, taskId} = await params;
  const {error} = await searchParams;
  const session = await getCurrentSession();
  const t = await getTranslations("TaskForm");
  const tDetail = await getTranslations("TaskDetail");

  if (!session || !canEditRecords(session.role)) {
    redirect(`/${locale}/access-denied`);
  }

  const [task, options] = await Promise.all([getTaskById(taskId), getTaskFormOptions()]);

  if (!task) {
    notFound();
  }

  const action = updateTaskAction.bind(null, locale);

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h2 className="text-3xl font-semibold text-ink">{t("editTitle")}</h2>
        <p className="max-w-2xl text-sm leading-7 text-ink/60">{t("subtitle")}</p>
      </div>
      {error === "validation" ? (
        <p className="rounded-2xl bg-amber/10 px-4 py-3 text-sm text-ink">{t("error")}</p>
      ) : null}
      {error && error !== "validation" ? (
        <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {error === "confirm" ? tDetail("deleteConfirmError") : tDetail("deleteError")}
        </p>
      ) : null}
      <section className="rounded-[24px] border border-ink/8 bg-white p-6">
        <TaskForm
          action={action}
          companies={options.companies}
          contacts={options.contacts}
          hiddenFields={{taskId: task.id}}
          interactions={options.interactions}
          locale={locale}
          mode="edit"
          priorityOptions={options.priorityOptions}
          statusOptions={options.statusOptions}
          taskTypeOptions={options.taskTypeOptions}
          values={{
            companyId: task.companyId ?? "",
            contactId: task.contactId ?? "",
            relatedInteractionId: task.relatedInteractionId ?? "",
            taskTypeValueId: task.taskTypeValueId,
            dueDate: toInputDateTime(task.dueDate),
            priorityValueId: task.priorityValueId,
            statusValueId: task.statusValueId,
            notes: task.notes ?? ""
          }}
        />
      </section>
      <section className="rounded-[24px] border border-rose-200 bg-rose-50/70 p-4">
        <form action={deleteTaskAction.bind(null, locale)} className="space-y-3">
          <input name="taskId" type="hidden" value={task.id} />
          <label className="flex items-center gap-2 text-xs text-ink/60">
            <input name="confirm" type="checkbox" value="1" />
            {tDetail("deleteConfirm")}
          </label>
          <button
            className="inline-flex items-center justify-center rounded-full bg-rose-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose-800"
            type="submit"
          >
            {tDetail("delete")}
          </button>
        </form>
      </section>
      <Link className="inline-flex text-sm font-medium text-ink/70" href={`/tasks/${task.id}`} locale={locale}>
        {t("back")}
      </Link>
    </div>
  );
}
