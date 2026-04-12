import {getTranslations} from "next-intl/server";

import {Link} from "@/i18n/navigation";
import {canEditRecords, getCurrentSession} from "@/lib/auth/session";
import {getTaskFormOptions, listTasks} from "@/lib/data/crm";
import {TaskListClient} from "@/components/tasks/task-list-client";
import {FilterShell} from "@/components/ui/filter-shell";

type TasksPageProps = {
  params: Promise<{locale: "en" | "he"}>;
  searchParams: Promise<{
    q?: string;
    companyId?: string;
    contactId?: string;
    statusValueId?: string;
  }>;
};

function startOfToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

function endOfToday() {
  const date = new Date();
  date.setHours(23, 59, 59, 999);
  return date.getTime();
}

export default async function TasksPage({params, searchParams}: TasksPageProps) {
  const {locale} = await params;
  const query = await searchParams;
  const t = await getTranslations("Tasks");
  const session = await getCurrentSession();
  const [{companies, contacts, statusOptions}, tasks] = await Promise.all([
    getTaskFormOptions(),
    listTasks({
      query: query.q,
      companyId: query.companyId,
      contactId: query.contactId,
      statusValueId: query.statusValueId
    })
  ]);
  const todayStart = startOfToday();
  const todayEnd = endOfToday();
  const groups = {
    overdue: tasks.filter(
      (task) => !task.completedAt && new Date(task.dueDate).getTime() < todayStart
    ),
    today: tasks.filter((task) => {
      if (task.completedAt) return false;
      const dueAt = new Date(task.dueDate).getTime();
      return dueAt >= todayStart && dueAt <= todayEnd;
    }),
    upcoming: tasks.filter(
      (task) => !task.completedAt && new Date(task.dueDate).getTime() > todayEnd
    ),
    done: tasks.filter((task) => Boolean(task.completedAt))
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.3em] text-coral">{t("title")}</p>
          <h2 className="font-display text-3xl font-semibold tracking-tight text-ink">{t("title")}</h2>
          <p className="max-w-3xl text-sm leading-7 text-slate-600">{t("subtitle")}</p>
        </div>
        {session && canEditRecords(session.role) ? (
          <Link
            className="inline-flex w-full items-center justify-center rounded-full bg-ink px-5 py-3 text-sm font-medium text-white sm:w-auto"
            href="/tasks/new"
            locale={locale}
          >
            {t("create")}
          </Link>
        ) : null}
      </div>

      <FilterShell>
        <form className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <input
            className="rounded-[22px] bg-[rgba(244,229,225,0.82)] px-4 py-3 text-slate-700"
            defaultValue={query.q ?? ""}
            name="q"
            placeholder={t("filters.query")}
          />
          <select
            className="rounded-[22px] bg-[rgba(244,229,225,0.82)] px-4 py-3 text-slate-700"
            defaultValue={query.companyId ?? ""}
            name="companyId"
          >
            <option value="">{t("filters.allCompanies")}</option>
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.companyName}
              </option>
            ))}
          </select>
          <select
            className="rounded-[22px] bg-[rgba(244,229,225,0.82)] px-4 py-3 text-slate-700"
            defaultValue={query.contactId ?? ""}
            name="contactId"
          >
            <option value="">{t("filters.allContacts")}</option>
            {contacts.map((contact) => (
              <option key={contact.id} value={contact.id}>
                {contact.fullName}
              </option>
            ))}
          </select>
          <select
            className="rounded-[22px] bg-[rgba(244,229,225,0.82)] px-4 py-3 text-slate-700"
            defaultValue={query.statusValueId ?? ""}
            name="statusValueId"
          >
            <option value="">{t("filters.allStatuses")}</option>
            {statusOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {locale === "he" ? option.labelHe : option.labelEn}
              </option>
            ))}
          </select>
          <button
            className="rounded-full bg-coral px-5 py-3 text-sm font-medium text-white sm:col-span-2 xl:col-span-4 xl:justify-self-start"
            type="submit"
          >
            {t("filters.apply")}
          </button>
        </form>
      </FilterShell>

      <TaskListClient
        groups={groups}
        locale={locale}
        noCompanyLabel={t("labels.noCompany")}
        noContactLabel={t("labels.noContact")}
        noNotesLabel={t("labels.noNotes")}
        noTasksLabel={t("empty")}
      />
    </div>
  );
}
