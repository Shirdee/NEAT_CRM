import type {AppLocale} from "@/i18n/routing";
import type {LookupOption} from "@/lib/data/crm";

import {CompanyContactLinkFields} from "./company-contact-link-fields";

type OpportunityFormValues = {
  companyId: string;
  contactId: string;
  opportunityName: string;
  opportunityStageValueId: string;
  opportunityTypeValueId: string;
  estimatedValue: string;
  statusValueId: string;
  targetCloseDate: string;
  notes: string;
};

type OpportunityFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  companies: Array<{id: string; companyName: string}>;
  compact?: boolean;
  contacts: Array<{id: string; fullName: string; companyId: string | null}>;
  hiddenFields?: Record<string, string>;
  invalidFields?: string[];
  locale: AppLocale;
  mode: "create" | "edit";
  stageOptions: LookupOption[];
  statusOptions: LookupOption[];
  typeOptions: LookupOption[];
  values?: Partial<OpportunityFormValues>;
};

function lookupLabel(option: LookupOption, locale: AppLocale) {
  return locale === "he" ? option.labelHe : option.labelEn;
}

export function OpportunityForm({
  action,
  companies,
  compact,
  contacts,
  hiddenFields,
  invalidFields,
  locale,
  mode,
  stageOptions,
  statusOptions,
  typeOptions,
  values
}: OpportunityFormProps) {
  const defaults: OpportunityFormValues = {
    companyId: values?.companyId ?? "",
    contactId: values?.contactId ?? "",
    opportunityName: values?.opportunityName ?? "",
    opportunityStageValueId: values?.opportunityStageValueId ?? "",
    opportunityTypeValueId: values?.opportunityTypeValueId ?? "",
    estimatedValue: values?.estimatedValue ?? "",
    statusValueId: values?.statusValueId ?? "",
    targetCloseDate: values?.targetCloseDate ?? "",
    notes: values?.notes ?? ""
  };
  const isInvalid = (field: string) => invalidFields?.includes(field) ?? false;

  return (
    <form action={action} className={`space-y-5 ${compact ? "space-y-4" : ""}`}>
      {hiddenFields
        ? Object.entries(hiddenFields).map(([name, value]) => (
            <input key={name} name={name} type="hidden" value={value} />
          ))
        : null}

      <div className={`grid gap-5 ${compact ? "" : "lg:grid-cols-2"}`}>
        <label className={`space-y-2 text-sm text-slate-700 ${compact ? "" : "lg:col-span-2"}`}>
          <span className="font-medium">{locale === "he" ? "שם הזדמנות" : "Opportunity name"}</span>
          <input
            className={`w-full rounded-2xl border px-4 py-3 ${isInvalid("opportunityName") ? "border-amber-500 bg-amber-50" : "border-slate-200"}`}
            defaultValue={defaults.opportunityName}
            name="opportunityName"
            required
          />
        </label>

        <CompanyContactLinkFields
          companies={companies}
          companyFieldName="companyId"
          companyInvalid={isInvalid("companyId")}
          contactFieldName="contactId"
          contactInvalid={isInvalid("contactId")}
          contacts={contacts}
          locale={locale}
          value={{companyId: defaults.companyId, contactId: defaults.contactId}}
        />

        <label className="space-y-2 text-sm text-slate-700">
          <span className="font-medium">{locale === "he" ? "שלב" : "Stage"}</span>
          <select
            className={`w-full rounded-2xl border px-4 py-3 ${isInvalid("opportunityStageValueId") ? "border-amber-500 bg-amber-50" : "border-slate-200"}`}
            defaultValue={defaults.opportunityStageValueId}
            name="opportunityStageValueId"
            required
          >
            <option value="">{locale === "he" ? "בחירה" : "Select stage"}</option>
            {stageOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {lookupLabel(option, locale)}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2 text-sm text-slate-700">
          <span className="font-medium">{locale === "he" ? "סוג" : "Type"}</span>
          <select
            className={`w-full rounded-2xl border px-4 py-3 ${isInvalid("opportunityTypeValueId") ? "border-amber-500 bg-amber-50" : "border-slate-200"}`}
            defaultValue={defaults.opportunityTypeValueId}
            name="opportunityTypeValueId"
            required
          >
            <option value="">{locale === "he" ? "בחירה" : "Select type"}</option>
            {typeOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {lookupLabel(option, locale)}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2 text-sm text-slate-700">
          <span className="font-medium">{locale === "he" ? "סטטוס" : "Status"}</span>
          <select
            className={`w-full rounded-2xl border px-4 py-3 ${isInvalid("statusValueId") ? "border-amber-500 bg-amber-50" : "border-slate-200"}`}
            defaultValue={defaults.statusValueId}
            name="statusValueId"
            required
          >
            <option value="">{locale === "he" ? "בחירה" : "Select status"}</option>
            {statusOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {lookupLabel(option, locale)}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2 text-sm text-slate-700">
          <span className="font-medium">{locale === "he" ? "שווי משוער" : "Estimated value"}</span>
          <input
            className={`w-full rounded-2xl border px-4 py-3 ${isInvalid("estimatedValue") ? "border-amber-500 bg-amber-50" : "border-slate-200"}`}
            defaultValue={defaults.estimatedValue}
            inputMode="decimal"
            name="estimatedValue"
            placeholder={locale === "he" ? "לדוגמה 45000" : "e.g. 45000"}
          />
        </label>

        <label className="space-y-2 text-sm text-slate-700">
          <span className="font-medium">{locale === "he" ? "תאריך יעד לסגירה" : "Target close date"}</span>
          <input
            className={`w-full rounded-2xl border px-4 py-3 ${isInvalid("targetCloseDate") ? "border-amber-500 bg-amber-50" : "border-slate-200"}`}
            defaultValue={defaults.targetCloseDate}
            name="targetCloseDate"
            type="date"
          />
        </label>
      </div>

      <label className="block space-y-2 text-sm text-slate-700">
        <span className="font-medium">{locale === "he" ? "הערות" : "Notes"}</span>
        <textarea
          className="min-h-32 w-full rounded-2xl border border-slate-200 px-4 py-3"
          defaultValue={defaults.notes}
          name="notes"
        />
      </label>

      <button className="inline-flex rounded-full bg-ink px-5 py-3 text-sm font-medium text-white" type="submit">
        {mode === "create"
          ? locale === "he"
            ? "יצירת הזדמנות"
            : "Create opportunity"
          : locale === "he"
            ? "שמירת שינויים"
            : "Save changes"}
      </button>
    </form>
  );
}
