import {getTranslations} from "next-intl/server";
import {redirect} from "next/navigation";

import {OpportunityForm} from "@/components/crm/opportunity-form";
import {Link} from "@/i18n/navigation";
import {canEditRecords, getCurrentSession} from "@/lib/auth/session";
import {getOpportunityFormOptions} from "@/lib/data/crm";

import {createOpportunityAction} from "../actions";

type NewOpportunityPageProps = {
  params: Promise<{locale: "en" | "he"}>;
  searchParams: Promise<{
    error?: string;
    invalidFields?: string;
    companyId?: string;
    contactId?: string;
    opportunityName?: string;
    opportunityStageValueId?: string;
    opportunityTypeValueId?: string;
    estimatedValue?: string;
    statusValueId?: string;
    targetCloseDate?: string;
    notes?: string;
  }>;
};

export default async function NewOpportunityPage({params, searchParams}: NewOpportunityPageProps) {
  const {locale} = await params;
  const query = await searchParams;
  const session = await getCurrentSession();
  const t = await getTranslations("OpportunityForm");

  if (!session || !canEditRecords(session.role)) {
    redirect(`/${locale}/access-denied`);
  }

  const options = await getOpportunityFormOptions();
  const action = createOpportunityAction.bind(null, locale);
  const defaultStage = options.stageOptions.find((option) => option.key === "qualified")?.id ?? "";
  const defaultType = options.typeOptions.find((option) => option.key === "new_business")?.id ?? "";
  const defaultStatus = options.statusOptions.find((option) => option.key === "open")?.id ?? "";

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h2 className="text-3xl font-semibold text-ink">{t("createTitle")}</h2>
        <p className="max-w-2xl text-sm leading-7 text-slate-600">{t("subtitle")}</p>
      </div>
      {query.error ? (
        <p className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800">{t("error")}</p>
      ) : null}
      <section className="rounded-[24px] border border-slate-200 bg-white p-6">
        <OpportunityForm
          action={action}
          companies={options.companies}
          contacts={options.contacts}
          invalidFields={query.invalidFields?.split(",").filter(Boolean) ?? []}
          locale={locale}
          mode="create"
          stageOptions={options.stageOptions}
          statusOptions={options.statusOptions}
          typeOptions={options.typeOptions}
          values={{
            companyId: query.companyId ?? "",
            contactId: query.contactId ?? "",
            opportunityName: query.opportunityName ?? "",
            opportunityStageValueId: query.opportunityStageValueId ?? defaultStage,
            opportunityTypeValueId: query.opportunityTypeValueId ?? defaultType,
            estimatedValue: query.estimatedValue ?? "",
            statusValueId: query.statusValueId ?? defaultStatus,
            targetCloseDate: query.targetCloseDate ?? "",
            notes: query.notes ?? ""
          }}
        />
      </section>
      <Link className="inline-flex text-sm font-medium text-slate-700" href="/opportunities" locale={locale}>
        {t("back")}
      </Link>
    </div>
  );
}

