import {getTranslations} from "next-intl/server";

import {Link} from "@/i18n/navigation";
import {canEditRecords, getCurrentSession} from "@/lib/auth/session";
import {getTaskListFilterOptions, listTasks} from "@/lib/data/crm";
import {listSavedViews, resolveSavedViewFilters} from "@/lib/data/saved-views";
import {TaskListClient} from "@/components/tasks/task-list-client";
import {FilterShell} from "@/components/ui/filter-shell";
import {LiveFilterForm} from "@/components/ui/live-filter-form";
import {SurfaceCard} from "@/components/ui/surface-card";
import {SavedViewBar} from "@/components/ui/saved-view-bar";

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

  return (
    <div className="space-y-6">
      <SurfaceCard className="space-y-4 bg-[linear-gradient(180deg,rgba(255,255,255,0.97),rgba(249,235,231,0.92))]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.3em] text-coral">{t("title")}</p>
            <h2 className="font-display text-3xl font-semibold tracking-tight text-ink">{t("title")}</h2>
            <p className="max-w-3xl text-sm leading-7 text-slate-600">{t("subtitle")}</p>
          </div>
          {session && canEditRecords(session.role) ? (
            <Link
              className="inline-flex w-full items-center justify-center rounded-full bg-ink px-5 py-3 text-sm font-medium text-white shadow-[0_10px_30px_rgba(16,36,63,0.18)] transition hover:-translate-y-0.5 sm:w-auto"
              href="/tasks/new"
              locale={locale}
            >
              {t("create")}
            </Link>
          ) : null}
        </div>
      </SurfaceCard>

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

      <FilterShell>
        <LiveFilterForm className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <input name="view" type="hidden" value={savedViewState.selectedViewId ?? ""} />
          <input
            className="rounded-[22px] bg-[rgba(244,229,225,0.82)] px-4 py-3 text-slate-700"
            defaultValue={filters.q ?? ""}
            name="q"
            placeholder={t("filters.query")}
          />
          <select
            className="rounded-[22px] bg-[rgba(244,229,225,0.82)] px-4 py-3 text-slate-700"
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
            className="rounded-[22px] bg-[rgba(244,229,225,0.82)] px-4 py-3 text-slate-700"
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
            className="rounded-[22px] bg-[rgba(244,229,225,0.82)] px-4 py-3 text-slate-700"
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
            className="rounded-full bg-coral px-5 py-3 text-sm font-medium text-white shadow-[0_10px_30px_rgba(221,107,77,0.22)] sm:col-span-2 xl:col-span-4 xl:justify-self-start"
            type="submit"
          >
            {t("filters.apply")}
          </button>
        </LiveFilterForm>
      </FilterShell>

      <SurfaceCard className="space-y-4 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(249,235,231,0.9))]">
        <TaskListClient
          groups={groups}
          locale={locale}
          noCompanyLabel={t("labels.noCompany")}
          noContactLabel={t("labels.noContact")}
          noNotesLabel={t("labels.noNotes")}
          noTasksLabel={t("empty")}
        />
      </SurfaceCard>
    </div>
  );
}
