import {getTranslations} from "next-intl/server";

import {Link} from "@/i18n/navigation";
import {canEditRecords, getCurrentSession} from "@/lib/auth/session";
import {getTaskListFilterOptions, listTasks} from "@/lib/data/crm";
import {listSavedViews, resolveSavedViewFilters} from "@/lib/data/saved-views";
import {TaskListClient} from "@/components/tasks/task-list-client";
import {LiveFilterForm} from "@/components/ui/live-filter-form";
import {SavedViewBar} from "@/components/ui/saved-view-bar";
import {SurfaceCard} from "@/components/ui/surface-card";

type TasksPageProps = {
  params: Promise<{locale: "en" | "he"}>;
  searchParams: Promise<{
    q?: string;
    companyId?: string;
    contactId?: string;
    statusValueId?: string;
    view?: string;
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
  const savedViews = session ? await listSavedViews({userId: session.id, module: "tasks"}) : [];
  const savedViewState = await resolveSavedViewFilters({
    module: "tasks",
    userId: session?.id,
    searchParams: query
  });
  const filters = savedViewState.filters;
  const [{companies, contacts, statusOptions}, tasks] = await Promise.all([
    getTaskListFilterOptions(),
    listTasks({
      query: filters.q,
      companyId: filters.companyId,
      contactId: filters.contactId,
      statusValueId: filters.statusValueId
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

  const totalCount = tasks.length;

  return (
    <div className="flex flex-col gap-5 px-4 py-4 lg:max-w-[860px] lg:px-8 lg:py-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="font-display text-2xl font-bold text-ink">{t("title")}</h1>
          <span className="rounded-full bg-mist px-3 py-0.5 text-[13px] font-medium text-ink/50">
            {totalCount}
          </span>
        </div>
        {session && canEditRecords(session.role) ? (
          <Link
            className="inline-flex items-center justify-center rounded-full bg-coral px-5 py-2.5 text-[13.5px] font-semibold text-white transition hover:bg-coral/90"
            href="/tasks/new"
            locale={locale}
          >
            {t("create")}
          </Link>
        ) : null}
      </div>

      <SurfaceCard className="space-y-4">
        {session ? (
          <SavedViewBar
            activeFilters={filters}
            locale={locale}
            module="tasks"
            selectedViewId={savedViewState.selectedViewId}
            selectedViewName={savedViewState.selectedView?.name ?? null}
            views={savedViews.map((view) => ({id: view.id, name: view.name}))}
          />
        ) : null}

        <LiveFilterForm className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <input name="view" type="hidden" value={savedViewState.selectedViewId ?? ""} />
          <input
            className="rounded-[12px] bg-mist px-4 py-3 text-ink/70 placeholder:text-ink/30"
            defaultValue={filters.q ?? ""}
            name="q"
            placeholder={t("filters.query")}
          />
          <select
            className="rounded-[12px] bg-mist px-4 py-3 text-ink/70"
            defaultValue={filters.companyId ?? ""}
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
            className="rounded-[12px] bg-mist px-4 py-3 text-ink/70"
            defaultValue={filters.contactId ?? ""}
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
            className="rounded-[12px] bg-mist px-4 py-3 text-ink/70"
            defaultValue={filters.statusValueId ?? ""}
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
            className="rounded-full bg-ink px-5 py-3 text-sm font-medium text-white transition hover:bg-ink/95 sm:col-span-2 xl:col-span-4 xl:justify-self-start"
            type="submit"
          >
            {t("filters.apply")}
          </button>
        </LiveFilterForm>
      </SurfaceCard>

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
