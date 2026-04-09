import {getTranslations} from "next-intl/server";

import {Link} from "@/i18n/navigation";
import {canEditRecords, getCurrentSession} from "@/lib/auth/session";
import {getTaskFormOptions, listTasks} from "@/lib/data/crm";
import {FilterShell} from "@/components/ui/filter-shell";
import {InfoPair} from "@/components/ui/info-pair";
import {StatusChip} from "@/components/ui/status-chip";
import {SurfaceCard} from "@/components/ui/surface-card";

type TasksPageProps = {
  params: Promise<{locale: "en" | "he"}>;
  searchParams: Promise<{
    q?: string;
    companyId?: string;
    contactId?: string;
    statusValueId?: string;
  }>;
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
  const sections = [
    {key: "overdue", items: groups.overdue, tone: "coral" as const},
    {key: "today", items: groups.today, tone: "amber" as const},
    {key: "upcoming", items: groups.upcoming, tone: "teal" as const},
    {key: "done", items: groups.done, tone: "default" as const}
  ];
  const sectionTitles = {
    overdue: locale === "he" ? "באיחור" : "Overdue",
    today: locale === "he" ? "היום" : "Today",
    upcoming: locale === "he" ? "קרוב" : "Upcoming",
    done: locale === "he" ? "הושלם" : "Done"
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

      {tasks.length === 0 ? (
        <SurfaceCard className="bg-[linear-gradient(180deg,rgba(255,255,255,0.9),rgba(249,235,231,0.92))] p-8 text-sm text-slate-600">
          {t("empty")}
        </SurfaceCard>
      ) : (
        <div className="space-y-6">
          {sections.map((section) =>
            section.items.length > 0 ? (
              <section className="space-y-3" key={section.key}>
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-display text-xl font-semibold text-ink">
                    {sectionTitles[section.key as keyof typeof sectionTitles]}
                  </h3>
                  <StatusChip tone={section.tone}>{section.items.length}</StatusChip>
                </div>
                <div className="space-y-3">
                  {section.items.map((task) => (
                    <Link
                      className="block rounded-[28px] bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(249,235,231,0.84))] p-4 shadow-[0_12px_32px_rgba(58,48,45,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_36px_rgba(58,48,45,0.1)] sm:p-5"
                      href={`/tasks/${task.id}`}
                      key={task.id}
                      locale={locale}
                    >
                      <div className="space-y-4">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="space-y-2">
                            <p className="text-lg font-semibold text-ink">
                              {task.notes || t("labels.noNotes")}
                            </p>
                            <div className="flex flex-wrap gap-2">
                              <StatusChip tone={section.tone}>
                                {labelForLocale(locale, {
                                  en: task.priorityLabelEn,
                                  he: task.priorityLabelHe
                                })}
                              </StatusChip>
                              <StatusChip>
                                {labelForLocale(locale, {
                                  en: task.statusLabelEn,
                                  he: task.statusLabelHe
                                })}
                              </StatusChip>
                            </div>
                          </div>
                          <div className="text-sm font-medium text-slate-600">
                            {formatDate(locale, task.dueDate)}
                          </div>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-3">
                          <InfoPair
                            label={locale === "he" ? "סוג" : "Type"}
                            value={labelForLocale(locale, {
                              en: task.taskTypeLabelEn,
                              he: task.taskTypeLabelHe
                            })}
                          />
                          <InfoPair label={locale === "he" ? "חברה" : "Company"} value={task.companyName || t("labels.noCompany")} />
                          <InfoPair label={locale === "he" ? "איש קשר" : "Contact"} value={task.contactName || t("labels.noContact")} />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            ) : null
          )}
        </div>
      )}
    </div>
  );
}
