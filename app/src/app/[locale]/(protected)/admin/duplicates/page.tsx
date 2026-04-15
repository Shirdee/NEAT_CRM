import {getTranslations} from "next-intl/server";
import {redirect} from "next/navigation";

import {Link} from "@/i18n/navigation";
import {StatusChip} from "@/components/ui/status-chip";
import {SurfaceCard} from "@/components/ui/surface-card";
import {canManageAdminLists, getCurrentSession} from "@/lib/auth/session";
import {listDuplicateGroups} from "@/lib/data/maintenance";

import {mergeDuplicateRecordAction} from "./actions";

type AdminDuplicatesPageProps = {
  params: Promise<{locale: string}>;
  searchParams: Promise<{error?: string; success?: string}>;
};

function reasonLabel(reason: string, t: (key: string) => string) {
  switch (reason) {
    case "name":
      return t("reasons.name");
    case "website":
      return t("reasons.website");
    case "email":
      return t("reasons.email");
    case "phone":
      return t("reasons.phone");
    case "name-company":
      return t("reasons.name-company");
    default:
      return reason;
  }
}

export default async function AdminDuplicatesPage({params, searchParams}: AdminDuplicatesPageProps) {
  const {locale} = await params;
  const {error, success} = await searchParams;
  const t = await getTranslations("AdminDuplicates");
  const session = await getCurrentSession();

  if (!session || !canManageAdminLists(session.role)) {
    redirect(`/${locale}/access-denied`);
  }

  const groups = await listDuplicateGroups();
  const totalGroups = groups.companies.length + groups.contacts.length;

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <p className="text-xs uppercase tracking-[0.3em] text-coral">{t("eyebrow")}</p>
        <h2 className="font-display text-3xl font-semibold tracking-tight text-ink">{t("title")}</h2>
        <p className="max-w-3xl text-sm leading-7 text-ink/70">{t("subtitle")}</p>
      </div>

      {error ? (
        <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{decodeURIComponent(error)}</p>
      ) : null}
      {success ? (
        <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {t("messages.merged")}
        </p>
      ) : null}

      <SurfaceCard className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-coral">{t("summary.eyebrow")}</p>
            <h3 className="mt-2 text-lg font-semibold text-ink">{t("summary.title")}</h3>
            <p className="mt-2 text-sm text-ink/70">{t("summary.body")}</p>
          </div>
          <StatusChip tone="ink">{t("summary.count", {count: totalGroups})}</StatusChip>
        </div>
        {totalGroups === 0 ? (
          <p className="rounded-[24px] bg-mist px-4 py-4 text-sm text-ink/70">
            {t("summary.empty")}
          </p>
        ) : (
          <div className="space-y-5">
            {groups.companies.map((group) => (
              <article className="space-y-4 rounded-[24px] border border-mist bg-mist/70 p-4" key={group.key}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-ink/40">
                      {t("groups.companies")}
                    </p>
                    <h4 className="mt-2 text-lg font-semibold text-ink">{group.title}</h4>
                    <p className="mt-2 text-sm text-ink/70">{reasonLabel(group.reason, t)}</p>
                  </div>
                  <StatusChip tone="amber">{t("summary.records", {count: group.records.length})}</StatusChip>
                </div>
                <div className="grid gap-3 lg:grid-cols-2">
                  {group.records.map((record, index) => {
                    const isPrimary = index === 0;

                    return (
                      <div
                        className={`rounded-[24px] border p-4 ${isPrimary ? "border-emerald-200 bg-emerald-50/60" : "border-mist bg-white"}`}
                        key={record.id}
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-ink">
                              {isPrimary ? t("records.primary") : t("records.duplicate")}
                            </p>
                            <h5 className="mt-1 text-base font-semibold text-ink">{record.title}</h5>
                            {record.detail ? <p className="mt-1 text-sm text-ink/70">{record.detail}</p> : null}
                          </div>
                          {record.meta.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {record.meta.map((item) => (
                                <StatusChip key={item}>{item}</StatusChip>
                              ))}
                            </div>
                          ) : null}
                        </div>

                        {!isPrimary ? (
                          <form
                            action={mergeDuplicateRecordAction}
                            className="mt-4 flex flex-wrap items-center gap-3"
                          >
                            <input name="locale" type="hidden" value={locale} />
                            <input name="entity" type="hidden" value="companies" />
                            <input name="primaryId" type="hidden" value={group.records[0]?.id} />
                            <input name="duplicateId" type="hidden" value={record.id} />
                            <label className="flex items-center gap-2 text-sm text-ink/70">
                              <input name="confirm" type="checkbox" value="1" />
                              {t("actions.confirm")}
                            </label>
                            <button
                              className="rounded-full bg-ink px-4 py-2 text-sm font-medium text-white"
                              type="submit"
                            >
                              {t("actions.merge")}
                            </button>
                          </form>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </article>
            ))}

            {groups.contacts.map((group) => (
              <article className="space-y-4 rounded-[24px] border border-mist bg-mist/70 p-4" key={group.key}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-ink/40">
                      {t("groups.contacts")}
                    </p>
                    <h4 className="mt-2 text-lg font-semibold text-ink">{group.title}</h4>
                    <p className="mt-2 text-sm text-ink/70">{reasonLabel(group.reason, t)}</p>
                  </div>
                  <StatusChip tone="amber">{t("summary.records", {count: group.records.length})}</StatusChip>
                </div>
                <div className="grid gap-3 lg:grid-cols-2">
                  {group.records.map((record, index) => {
                    const isPrimary = index === 0;

                    return (
                      <div
                        className={`rounded-[24px] border p-4 ${isPrimary ? "border-emerald-200 bg-emerald-50/60" : "border-mist bg-white"}`}
                        key={record.id}
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-ink">
                              {isPrimary ? t("records.primary") : t("records.duplicate")}
                            </p>
                            <h5 className="mt-1 text-base font-semibold text-ink">{record.title}</h5>
                            {record.detail ? <p className="mt-1 text-sm text-ink/70">{record.detail}</p> : null}
                          </div>
                          {record.meta.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {record.meta.map((item) => (
                                <StatusChip key={item}>{item}</StatusChip>
                              ))}
                            </div>
                          ) : null}
                        </div>

                        {!isPrimary ? (
                          <form
                            action={mergeDuplicateRecordAction}
                            className="mt-4 flex flex-wrap items-center gap-3"
                          >
                            <input name="locale" type="hidden" value={locale} />
                            <input name="entity" type="hidden" value="contacts" />
                            <input name="primaryId" type="hidden" value={group.records[0]?.id} />
                            <input name="duplicateId" type="hidden" value={record.id} />
                            <label className="flex items-center gap-2 text-sm text-ink/70">
                              <input name="confirm" type="checkbox" value="1" />
                              {t("actions.confirm")}
                            </label>
                            <button
                              className="rounded-full bg-ink px-4 py-2 text-sm font-medium text-white"
                              type="submit"
                            >
                              {t("actions.merge")}
                            </button>
                          </form>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </article>
            ))}
          </div>
        )}
      </SurfaceCard>

      <div className="flex flex-wrap gap-3">
        <Link className="rounded-full border border-ink/10 px-4 py-2 text-sm font-medium text-ink/70" href="/admin/lists" locale={locale}>
          {t("backToAdmin")}
        </Link>
        <Link className="rounded-full border border-ink/10 px-4 py-2 text-sm font-medium text-ink/70" href="/dashboard" locale={locale}>
          {t("backToDashboard")}
        </Link>
      </div>
    </div>
  );
}
