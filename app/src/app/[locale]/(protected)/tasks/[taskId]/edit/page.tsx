import {getTranslations} from "next-intl/server";
import {notFound, redirect} from "next/navigation";

import {TaskForm} from "@/components/crm/task-form";
import {Link} from "@/i18n/navigation";
import {canEditRecords, getCurrentSession} from "@/lib/auth/session";
import {getTaskById, getTaskFormOptions} from "@/lib/data/crm";

import {updateTaskAction} from "../../actions";

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
        <p className="max-w-2xl text-sm leading-7 text-slate-600">{t("subtitle")}</p>
      </div>
      {error ? (
        <p className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800">{t("error")}</p>
      ) : null}
      <section className="rounded-[24px] border border-slate-200 bg-white p-6">
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
      <Link className="inline-flex text-sm font-medium text-slate-700" href={`/tasks/${task.id}`} locale={locale}>
        {t("back")}
      </Link>
    </div>
  );
}
