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
          <div className={`grid gap-3 sm:grid-cols-2 ${compact ? "" : "lg:grid-cols-3"}`}>
            {interactionTypeOptions.map((option) => (
              <label
                className="cursor-pointer rounded-[20px] border border-slate-200 bg-white p-4 transition hover:border-coral/50 hover:bg-mist"
                key={option.id}
              >
                <input
                  className="sr-only"
                  defaultChecked={defaults.interactionTypeValueId === option.id}
                  name="interactionTypeValueId"
                  required
                  type="radio"
                  value={option.id}
                />
                <span className="text-sm font-medium text-ink">{lookupLabel(option, locale)}</span>
              </label>
            ))}
          </div>
        </div>
        {lockedCompany ? null : (
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
        )}
        {lockedContact ? null : (
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
