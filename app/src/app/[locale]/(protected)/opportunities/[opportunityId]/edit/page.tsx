import {getTranslations} from "next-intl/server";
import {notFound, redirect} from "next/navigation";

import {OpportunityForm} from "@/components/crm/opportunity-form";
import {Link} from "@/i18n/navigation";
import {canEditRecords, getCurrentSession} from "@/lib/auth/session";
import {getOpportunityById, getOpportunityFormOptions} from "@/lib/data/crm";

import {deleteOpportunityAction, updateOpportunityAction} from "../../actions";

type EditOpportunityPageProps = {
  params: Promise<{locale: "en" | "he"; opportunityId: string}>;
  searchParams: Promise<{error?: string; invalidFields?: string}>;
};

function dateOnly(value: Date | string | null | undefined) {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
}

export default async function EditOpportunityPage({params, searchParams}: EditOpportunityPageProps) {
  const {locale, opportunityId} = await params;
  const query = await searchParams;
  const session = await getCurrentSession();
  const t = await getTranslations("OpportunityForm");
  const tDetail = await getTranslations("OpportunityDetail");

  if (!session || !canEditRecords(session.role)) {
    redirect(`/${locale}/access-denied`);
  }

  const [options, opportunity] = await Promise.all([
    getOpportunityFormOptions(),
    getOpportunityById(opportunityId)
  ]);

  if (!opportunity) {
    notFound();
  }

  const action = updateOpportunityAction.bind(null, locale);

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h2 className="text-3xl font-semibold text-ink">{t("editTitle")}</h2>
        <p className="max-w-2xl text-sm leading-7 text-ink/60">{t("subtitle")}</p>
      </div>
      {query.error === "validation" ? (
        <p className="rounded-2xl bg-amber/10 px-4 py-3 text-sm text-ink">{t("error")}</p>
      ) : null}
      {query.error && query.error !== "validation" ? (
        <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {query.error === "confirm" ? tDetail("deleteConfirmError") : tDetail("deleteError")}
        </p>
      ) : null}
      <section className="rounded-[24px] border border-ink/8 bg-white p-6">
        <OpportunityForm
          action={action}
          companies={options.companies}
          contacts={options.contacts}
          hiddenFields={{opportunityId: opportunity.id}}
          invalidFields={query.invalidFields?.split(",").filter(Boolean) ?? []}
          locale={locale}
          mode="edit"
          stageOptions={options.stageOptions}
          statusOptions={options.statusOptions}
          typeOptions={options.typeOptions}
          values={{
            companyId: opportunity.companyId,
            contactId: opportunity.contactId ?? "",
            opportunityName: opportunity.opportunityName,
            opportunityStageValueId: opportunity.opportunityStageValueId,
            opportunityTypeValueId: opportunity.opportunityTypeValueId,
            estimatedValue: opportunity.estimatedValue ? String(opportunity.estimatedValue) : "",
            statusValueId: opportunity.statusValueId,
            targetCloseDate: dateOnly(opportunity.targetCloseDate),
            notes: opportunity.notes ?? ""
          }}
        />
      </section>
      <section className="rounded-[24px] border border-rose-200 bg-rose-50/70 p-4">
        <form action={deleteOpportunityAction.bind(null, locale)} className="space-y-3">
          <input name="opportunityId" type="hidden" value={opportunity.id} />
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
      <Link className="inline-flex text-sm font-medium text-ink/70" href={`/opportunities/${opportunity.id}`} locale={locale}>
        {t("backToDetail")}
      </Link>
    </div>
  );
}
