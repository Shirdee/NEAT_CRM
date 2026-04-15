import {getTranslations} from "next-intl/server";
import {notFound} from "next/navigation";

import {Link} from "@/i18n/navigation";
import {canEditRecords, getCurrentSession} from "@/lib/auth/session";
import {getOpportunityById} from "@/lib/data/crm";

type OpportunityDetailPageProps = {
  params: Promise<{locale: "en" | "he"; opportunityId: string}>;
  searchParams: Promise<{success?: string}>;
};

function labelForLocale(locale: "en" | "he", values: {en?: string | null; he?: string | null}) {
  return locale === "he" ? values.he || values.en || "—" : values.en || values.he || "—";
}

function formatDate(locale: "en" | "he", value: Date | string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat(locale === "he" ? "he-IL" : "en-US", {dateStyle: "medium"}).format(new Date(value));
}

function formatMoney(value: unknown) {
  const numeric = Number(String(value ?? "").trim());
  if (!Number.isFinite(numeric)) return "—";
  return new Intl.NumberFormat(undefined, {maximumFractionDigits: 0}).format(numeric);
}

export default async function OpportunityDetailPage({params, searchParams}: OpportunityDetailPageProps) {
  const {locale, opportunityId} = await params;
  const {success} = await searchParams;
  const t = await getTranslations("OpportunityDetail");
  const session = await getCurrentSession();
  const opportunity = await getOpportunityById(opportunityId);

  if (!opportunity) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.3em] text-coral">{t("eyebrow")}</p>
          <h2 className="text-3xl font-semibold text-ink">{opportunity.opportunityName}</h2>
          <p className="max-w-3xl text-sm leading-7 text-ink/60">{t("subtitle")}</p>
        </div>
        {session && canEditRecords(session.role) ? (
          <div>
            <Link
              className="inline-flex rounded-full border border-ink/10 px-5 py-3 text-sm font-medium text-ink/70"
              href={`/opportunities/${opportunity.id}/edit`}
              locale={locale}
            >
              {t("edit")}
            </Link>
          </div>
        ) : null}
      </div>

      {success ? (
        <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {success === "created" ? t("created") : t("updated")}
        </p>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-4">
        <article className="rounded-[24px] border border-ink/8 bg-white p-5">
          <p className="text-xs uppercase tracking-[0.24em] text-ink/50">{t("value")}</p>
          <p className="mt-3 text-sm text-ink/70">{formatMoney(opportunity.estimatedValue)}</p>
        </article>
        <article className="rounded-[24px] border border-ink/8 bg-white p-5">
          <p className="text-xs uppercase tracking-[0.24em] text-ink/50">{t("status")}</p>
          <p className="mt-3 text-sm text-ink/70">
            {labelForLocale(locale, {en: opportunity.statusLabelEn, he: opportunity.statusLabelHe})}
          </p>
        </article>
        <article className="rounded-[24px] border border-ink/8 bg-white p-5">
          <p className="text-xs uppercase tracking-[0.24em] text-ink/50">{t("stage")}</p>
          <p className="mt-3 text-sm text-ink/70">
            {labelForLocale(locale, {en: opportunity.stageLabelEn, he: opportunity.stageLabelHe})}
          </p>
        </article>
        <article className="rounded-[24px] border border-ink/8 bg-white p-5">
          <p className="text-xs uppercase tracking-[0.24em] text-ink/50">{t("closeDate")}</p>
          <p className="mt-3 text-sm text-ink/70">{formatDate(locale, opportunity.targetCloseDate ?? null)}</p>
        </article>
      </div>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-[24px] border border-ink/8 bg-white p-5">
          <p className="text-xs uppercase tracking-[0.24em] text-ink/50">{t("company")}</p>
          <p className="mt-3 text-sm text-ink/70">{opportunity.companyName}</p>
        </article>
        <article className="rounded-[24px] border border-ink/8 bg-white p-5">
          <p className="text-xs uppercase tracking-[0.24em] text-ink/50">{t("contact")}</p>
          <p className="mt-3 text-sm text-ink/70">{opportunity.contactName || t("noContact")}</p>
        </article>
      </section>

      <section className="rounded-[24px] border border-ink/8 bg-white p-5">
        <p className="text-xs uppercase tracking-[0.24em] text-ink/50">{t("notes")}</p>
        <p className="mt-4 text-sm leading-7 text-ink/70">{opportunity.notes || t("noNotes")}</p>
      </section>

      <Link className="inline-flex text-sm font-medium text-ink/70" href="/opportunities" locale={locale}>
        {t("back")}
      </Link>
    </div>
  );
}
