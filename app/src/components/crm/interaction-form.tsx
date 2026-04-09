import type {AppLocale} from "@/i18n/routing";
import type {LookupOption} from "@/lib/data/crm";

import {InteractionTypeField} from "./interaction-type-field";
import {SearchableOptionField} from "./searchable-option-field";

type InteractionFormValues = {
  interactionDate: string;
  companyId: string;
  contactId: string;
  interactionTypeValueId: string;
  subject: string;
  summary: string;
  outcomeStatusValueId: string;
};

type InteractionFormProps = {
  allowFollowUpAfterCreate?: boolean;
  action: (formData: FormData) => void | Promise<void>;
  companies: Array<{id: string; companyName: string}>;
  compact?: boolean;
  contacts: Array<{id: string; fullName: string}>;
  hiddenFields?: Record<string, string>;
  interactionTypeOptions: LookupOption[];
  lockedCompany?: {id: string; companyName: string} | null;
  lockedContact?: {id: string; fullName: string} | null;
  locale: AppLocale;
  mode: "create" | "edit";
  outcomeOptions: LookupOption[];
  values?: Partial<InteractionFormValues>;
};

function lookupLabel(option: LookupOption, locale: AppLocale) {
  return locale === "he" ? option.labelHe : option.labelEn;
}

export function InteractionForm({
  allowFollowUpAfterCreate,
  action,
  companies,
  compact,
  contacts,
  hiddenFields,
  interactionTypeOptions,
  lockedCompany,
  lockedContact,
  locale,
  mode,
  outcomeOptions,
  values
}: InteractionFormProps) {
  const defaults: InteractionFormValues = {
    interactionDate: values?.interactionDate ?? "",
    companyId: values?.companyId ?? "",
    contactId: values?.contactId ?? "",
    interactionTypeValueId: values?.interactionTypeValueId ?? "",
    subject: values?.subject ?? "",
    summary: values?.summary ?? "",
    outcomeStatusValueId: values?.outcomeStatusValueId ?? ""
  };

  return (
    <form action={action} className="space-y-5">
      {hiddenFields
        ? Object.entries(hiddenFields).map(([name, value]) => (
            <input key={name} name={name} type="hidden" value={value} />
          ))
        : null}
      {lockedCompany ? <input name="companyId" type="hidden" value={lockedCompany.id} /> : null}
      {lockedContact ? <input name="contactId" type="hidden" value={lockedContact.id} /> : null}
      {(lockedCompany || lockedContact) && mode === "create" ? (
        <div className="rounded-[20px] border border-slate-200 bg-mist px-4 py-3 text-sm text-slate-700">
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
      <div className={`grid gap-5 ${compact ? "" : "lg:grid-cols-2"}`}>
        <label className="space-y-2 text-sm text-slate-700">
          <span className="font-medium">{locale === "he" ? "תאריך ושעה" : "Date and time"}</span>
          <input
            className="w-full rounded-2xl border border-slate-200 px-4 py-3"
            defaultValue={defaults.interactionDate}
            name="interactionDate"
            required
            type="datetime-local"
          />
        </label>
        <div className={`space-y-2 text-sm text-slate-700 ${compact ? "" : "lg:col-span-2"}`}>
          <span className="font-medium">{locale === "he" ? "סוג אינטראקציה" : "Interaction type"}</span>
          <InteractionTypeField
            locale={locale}
            name="interactionTypeValueId"
            options={interactionTypeOptions}
            value={defaults.interactionTypeValueId}
          />
        </div>
        {lockedCompany ? null : (
          <SearchableOptionField
            emptyLabel={locale === "he" ? "ללא חברה" : "No company"}
            label={locale === "he" ? "חברה" : "Company"}
            name="companyId"
            noResultsLabel={locale === "he" ? "לא נמצאו חברות" : "No companies found"}
            options={companies.map((company) => ({id: company.id, label: company.companyName}))}
            placeholder={locale === "he" ? "חיפוש חברה" : "Search company"}
            searchPlaceholder={locale === "he" ? "חיפוש חברה אחרת" : "Search another company"}
            value={defaults.companyId}
          />
        )}
        {lockedContact ? null : (
          <SearchableOptionField
            emptyLabel={locale === "he" ? "ללא איש קשר" : "No contact"}
            label={locale === "he" ? "איש קשר" : "Contact"}
            name="contactId"
            noResultsLabel={locale === "he" ? "לא נמצאו אנשי קשר" : "No contacts found"}
            options={contacts.map((contact) => ({id: contact.id, label: contact.fullName}))}
            placeholder={locale === "he" ? "חיפוש איש קשר" : "Search contact"}
            searchPlaceholder={locale === "he" ? "חיפוש איש קשר אחר" : "Search another contact"}
            value={defaults.contactId}
          />
        )}
      </div>
      <label className="block space-y-2 text-sm text-slate-700">
        <span className="font-medium">{locale === "he" ? "נושא" : "Subject"}</span>
        <input
          className="w-full rounded-2xl border border-slate-200 px-4 py-3"
          defaultValue={defaults.subject}
          name="subject"
          required
        />
      </label>
      <label className="block space-y-2 text-sm text-slate-700">
        <span className="font-medium">{locale === "he" ? "סיכום" : "Summary"}</span>
        <textarea
          className={`w-full rounded-2xl border border-slate-200 px-4 py-3 ${compact ? "min-h-24" : "min-h-32"}`}
          defaultValue={defaults.summary}
          name="summary"
          required
        />
      </label>
      <label className="block space-y-2 text-sm text-slate-700">
        <span className="font-medium">{locale === "he" ? "תוצאה" : "Outcome"}</span>
        <select
          className="w-full rounded-2xl border border-slate-200 px-4 py-3"
          defaultValue={defaults.outcomeStatusValueId}
          name="outcomeStatusValueId"
        >
          <option value="">{locale === "he" ? "ללא" : "None"}</option>
          {outcomeOptions.map((option) => (
            <option key={option.id} value={option.id}>
              {lookupLabel(option, locale)}
            </option>
          ))}
        </select>
      </label>
      <div className="flex flex-wrap gap-3">
        <button className="inline-flex rounded-full bg-ink px-5 py-3 text-sm font-medium text-white" type="submit">
          {mode === "create"
            ? locale === "he"
              ? "יצירת אינטראקציה"
              : "Create interaction"
            : locale === "he"
              ? "שמירת שינויים"
              : "Save changes"}
        </button>
        {mode === "create" && allowFollowUpAfterCreate ? (
          <button
            className="inline-flex rounded-full border border-slate-300 px-5 py-3 text-sm font-medium text-slate-700"
            name="intent"
            type="submit"
            value="create-and-add-follow-up"
          >
            {locale === "he" ? "יצירה והוספת מעקב" : "Create and add follow-up"}
          </button>
        ) : null}
      </div>
    </form>
  );
}
