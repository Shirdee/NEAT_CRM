import {getTranslations} from "next-intl/server";

import {Link} from "@/i18n/navigation";
import {canEditRecords, getCurrentSession} from "@/lib/auth/session";
import {getTaskFormOptions, listTasks} from "@/lib/data/crm";

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-3">
          <h2 className="text-3xl font-semibold text-ink">{t("title")}</h2>
          <p className="max-w-3xl text-sm leading-7 text-slate-600">{t("subtitle")}</p>
        </div>
        {session && canEditRecords(session.role) ? (
          <Link
            className="inline-flex rounded-full bg-ink px-5 py-3 text-sm font-medium text-white"
            href="/tasks/new"
            locale={locale}
          >
            {t("create")}
          </Link>
        ) : null}
      </div>

      <form className="grid gap-4 rounded-[24px] border border-slate-200 bg-white p-5 lg:grid-cols-4">
        <input
          className="rounded-2xl border border-slate-200 px-4 py-3"
          defaultValue={query.q ?? ""}
          name="q"
          placeholder={t("filters.query")}
        />
        <select
          className="rounded-2xl border border-slate-200 px-4 py-3"
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
          className="rounded-2xl border border-slate-200 px-4 py-3"
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
          className="rounded-2xl border border-slate-200 px-4 py-3"
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
          className="rounded-full bg-coral px-5 py-3 text-sm font-medium text-white lg:col-span-4 lg:justify-self-start"
          type="submit"
        >
          {t("filters.apply")}
        </button>
      </form>

      {tasks.length === 0 ? (
        <section className="rounded-[24px] border border-dashed border-slate-300 bg-white p-8 text-sm text-slate-600">
          {t("empty")}
        </section>
      ) : (
        <div className="space-y-4">
          {tasks.map((task) => (
            <Link
              className="block rounded-[24px] border border-slate-200 bg-white p-5 transition hover:border-coral/50 hover:shadow-soft"
              href={`/tasks/${task.id}`}
              key={task.id}
              locale={locale}
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-2">
                  <p className="text-lg font-semibold text-ink">{task.notes || t("labels.noNotes")}</p>
                  <div className="flex flex-wrap gap-2 text-xs uppercase tracking-[0.2em] text-slate-500">
                    <span>
                      {labelForLocale(locale, {
                        en: task.taskTypeLabelEn,
                        he: task.taskTypeLabelHe
                      })}
                    </span>
                    <span>{task.companyName || t("labels.noCompany")}</span>
                    <span>{task.contactName || t("labels.noContact")}</span>
                  </div>
                </div>
                <div className="space-y-2 text-sm text-slate-600 lg:text-end">
                  <p>{formatDate(locale, task.dueDate)}</p>
                  <p>
                    {labelForLocale(locale, {
                      en: task.priorityLabelEn,
                      he: task.priorityLabelHe
                    })}
                  </p>
                  <p>
                    {labelForLocale(locale, {
                      en: task.statusLabelEn,
                      he: task.statusLabelHe
                    })}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
