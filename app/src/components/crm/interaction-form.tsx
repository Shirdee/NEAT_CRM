import type {AppLocale} from "@/i18n/routing";
import type {LookupOption} from "@/lib/data/crm";

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
  action: (formData: FormData) => void | Promise<void>;
  companies: Array<{id: string; companyName: string}>;
  contacts: Array<{id: string; fullName: string}>;
  hiddenFields?: Record<string, string>;
  interactionTypeOptions: LookupOption[];
  locale: AppLocale;
  mode: "create" | "edit";
  outcomeOptions: LookupOption[];
  values?: Partial<InteractionFormValues>;
};

function lookupLabel(option: LookupOption, locale: AppLocale) {
  return locale === "he" ? option.labelHe : option.labelEn;
}

export function InteractionForm({
  action,
  companies,
  contacts,
  hiddenFields,
  interactionTypeOptions,
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
      <div className="grid gap-5 lg:grid-cols-2">
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
        <label className="space-y-2 text-sm text-slate-700">
          <span className="font-medium">{locale === "he" ? "סוג אינטראקציה" : "Interaction type"}</span>
          <select
            className="w-full rounded-2xl border border-slate-200 px-4 py-3"
            defaultValue={defaults.interactionTypeValueId}
            name="interactionTypeValueId"
            required
          >
            <option value="">{locale === "he" ? "בחירה" : "Select type"}</option>
            {interactionTypeOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {lookupLabel(option, locale)}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-2 text-sm text-slate-700">
          <span className="font-medium">{locale === "he" ? "חברה" : "Company"}</span>
          <select
            className="w-full rounded-2xl border border-slate-200 px-4 py-3"
            defaultValue={defaults.companyId}
            name="companyId"
          >
            <option value="">{locale === "he" ? "ללא חברה" : "No company"}</option>
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.companyName}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-2 text-sm text-slate-700">
          <span className="font-medium">{locale === "he" ? "איש קשר" : "Contact"}</span>
          <select
            className="w-full rounded-2xl border border-slate-200 px-4 py-3"
            defaultValue={defaults.contactId}
            name="contactId"
          >
            <option value="">{locale === "he" ? "ללא איש קשר" : "No contact"}</option>
            {contacts.map((contact) => (
              <option key={contact.id} value={contact.id}>
                {contact.fullName}
              </option>
            ))}
          </select>
        </label>
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
          className="min-h-32 w-full rounded-2xl border border-slate-200 px-4 py-3"
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
      <button className="inline-flex rounded-full bg-ink px-5 py-3 text-sm font-medium text-white" type="submit">
        {mode === "create"
          ? locale === "he"
            ? "יצירת אינטראקציה"
            : "Create interaction"
          : locale === "he"
            ? "שמירת שינויים"
            : "Save changes"}
      </button>
    </form>
  );
}
