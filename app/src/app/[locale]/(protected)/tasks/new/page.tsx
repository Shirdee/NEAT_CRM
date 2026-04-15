import {getTranslations} from "next-intl/server";
import {redirect} from "next/navigation";

import {TaskForm} from "@/components/crm/task-form";
import {Link} from "@/i18n/navigation";
import {canEditRecords, getCurrentSession} from "@/lib/auth/session";
import {getInteractionById, getTaskFormOptions} from "@/lib/data/crm";
import {SurfaceCard} from "@/components/ui/surface-card";

import {createTaskAction} from "../actions";

type NewTaskPageProps = {
  params: Promise<{locale: "en" | "he"}>;
  searchParams: Promise<{
    compact?: string;
    error?: string;
    invalidFields?: string;
    companyId?: string;
    contactId?: string;
    dueDate?: string;
    taskTypeValueId?: string;
    priorityValueId?: string;
    statusValueId?: string;
    notes?: string;
    relatedInteractionId?: string;
  }>;
};

function defaultDueDate() {
  const date = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

export default async function NewTaskPage({params, searchParams}: NewTaskPageProps) {
  const {locale} = await params;
  const {
    compact,
    error,
    invalidFields,
    companyId,
    contactId,
    dueDate,
    taskTypeValueId,
    priorityValueId,
    statusValueId,
    notes,
    relatedInteractionId
  } = await searchParams;
  const session = await getCurrentSession();
  const t = await getTranslations("TaskForm");

  if (!session || !canEditRecords(session.role)) {
    redirect(`/${locale}/access-denied`);
  }

  const options = await getTaskFormOptions();
  const relatedInteraction = relatedInteractionId ? await getInteractionById(relatedInteractionId) : null;
  const action = createTaskAction.bind(null, locale);
  const defaultStatus = options.statusOptions.find((option) => option.key === "open")?.id ?? "";
  const defaultPriority = options.priorityOptions.find((option) => option.key === "medium")?.id ?? "";
  const compactMode = compact === "1";

  return (
    <div className="space-y-6">
      <SurfaceCard className="space-y-3 bg-[linear-gradient(180deg,rgba(255,255,255,0.97),rgba(249,235,231,0.92))]">
        <p className="text-xs uppercase tracking-[0.3em] text-coral">
          {compactMode ? t("quickAddTitle") : t("createTitle")}
        </p>
        <h2 className="text-3xl font-semibold tracking-tight text-ink">
          {compactMode ? t("quickAddTitle") : t("createTitle")}
        </h2>
        <p className="max-w-2xl text-sm leading-7 text-slate-600">
          {compactMode ? t("quickAddSubtitle") : t("subtitle")}
        </p>
      </SurfaceCard>
      {error ? (
        <p className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800">{t("error")}</p>
      ) : null}
      <section
        className={
          compactMode
            ? "rounded-[32px] bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(249,235,231,0.92))] p-4 shadow-[0_12px_40px_rgba(58,48,45,0.08)] sm:p-5"
            : "rounded-[30px] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(249,235,231,0.88))] p-5 sm:p-6"
        }
      >
        <TaskForm
          action={action}
          companies={options.companies}
          compact={compactMode}
          contacts={options.contacts}
          hiddenFields={compactMode ? {compact: "1"} : undefined}
          invalidFields={invalidFields?.split(",").filter(Boolean) ?? []}
          interactions={options.interactions}
          locale={locale}
          mode="create"
          priorityOptions={options.priorityOptions}
          statusOptions={options.statusOptions}
          taskTypeOptions={options.taskTypeOptions}
          values={{
            companyId: relatedInteraction?.companyId ?? companyId ?? "",
            contactId: relatedInteraction?.contactId ?? contactId ?? "",
            relatedInteractionId: relatedInteractionId ?? "",
            dueDate: dueDate ?? defaultDueDate(),
            taskTypeValueId: taskTypeValueId ?? "",
            statusValueId: statusValueId ?? defaultStatus,
            priorityValueId: priorityValueId ?? defaultPriority,
            notes: notes ?? (relatedInteraction ? `${relatedInteraction.subject}: ` : "")
          }}
        />
      </section>
      <Link className="inline-flex text-sm font-medium text-slate-700" href="/tasks" locale={locale}>
        {t("back")}
      </Link>
    </div>
  );
}
