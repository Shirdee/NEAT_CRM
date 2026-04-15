import {getTranslations} from "next-intl/server";
import {redirect} from "next/navigation";

import {OpportunityForm} from "@/components/crm/opportunity-form";
import {Link} from "@/i18n/navigation";
import {canEditRecords, getCurrentSession} from "@/lib/auth/session";
import {getOpportunityFormOptions} from "@/lib/data/crm";
import {SurfaceCard} from "@/components/ui/surface-card";

import {createOpportunityAction} from "../actions";

type NewOpportunityPageProps = {
  params: Promise<{locale: "en" | "he"}>;
  searchParams: Promise<{
    compact?: string;
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
  const compactMode = query.compact === "1";
  const lockedCompany = query.companyId
    ? options.companies.find((company) => company.id === query.companyId) ?? null
    : null;
  const lockedContact = query.contactId
    ? options.contacts.find((contact) => contact.id === query.contactId) ?? null
    : null;

  return (
    <div className="space-y-6">
      <SurfaceCard className="space-y-3 bg-[linear-gradient(180deg,rgba(255,255,255,0.97),rgba(249,235,231,0.92))]">
        <p className="text-xs uppercase tracking-[0.3em] text-coral">
          {compactMode ? (locale === "he" ? "הזדמנות מהירה" : "Quick deal") : t("createTitle")}
        </p>
        <h2 className="text-3xl font-semibold tracking-tight text-ink">{t("createTitle")}</h2>
        <p className="max-w-2xl text-sm leading-7 text-slate-600">{t("subtitle")}</p>
      </SurfaceCard>
      {query.error ? (
        <p className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800">{t("error")}</p>
      ) : null}
      {(lockedCompany || lockedContact) && compactMode ? (
        <div className="rounded-[24px] bg-[linear-gradient(180deg,rgba(223,247,241,0.88),rgba(255,255,255,0.92))] px-4 py-3 text-sm text-slate-700">
          <div className="flex flex-wrap gap-2">
            {lockedCompany ? (
              <span className="rounded-full bg-white px-3 py-1 font-medium text-ink">
                {locale === "he" ? "חברה: " : "Company: "}
                {lockedCompany.companyName}
              </span>
            ) : null}
            {lockedContact ? (
              <span className="rounded-full bg-white px-3 py-1 font-medium text-ink">
                {locale === "he" ? "איש קשר: " : "Contact: "}
                {lockedContact.fullName}
              </span>
            ) : null}
          </div>
        </div>
      ) : null}
      <SurfaceCard
        className={
          compactMode
            ? "rounded-[32px] bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(249,235,231,0.92))] p-4 sm:p-5"
            : "rounded-[30px] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(249,235,231,0.88))] p-5 sm:p-6"
        }
      >
        <OpportunityForm
          action={action}
          compact={compactMode}
          companies={options.companies}
          contacts={options.contacts}
          invalidFields={query.invalidFields?.split(",").filter(Boolean) ?? []}
          hiddenFields={compactMode ? {compact: "1"} : undefined}
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
      </SurfaceCard>
      <Link className="inline-flex text-sm font-medium text-slate-700" href="/opportunities" locale={locale}>
        {t("back")}
      </Link>
    </div>
  );
}
