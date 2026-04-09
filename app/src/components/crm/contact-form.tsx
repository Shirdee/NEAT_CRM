import type {AppLocale} from "@/i18n/routing";

type ContactFormValues = {
  firstName: string;
  lastName: string;
  roleTitle: string;
  companyId: string;
  notes: string;
  emailsText: string;
  primaryEmail: string;
  phonesText: string;
  primaryPhone: string;
};

type ContactFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  companies: Array<{id: string; companyName: string}>;
  hiddenFields?: Record<string, string>;
  invalidFields?: string[];
  locale: AppLocale;
  mode: "create" | "edit";
  values?: Partial<ContactFormValues>;
};

export function ContactForm({
  action,
  companies,
  hiddenFields,
  invalidFields,
  locale,
  mode,
  values
}: ContactFormProps) {
  const defaults: ContactFormValues = {
    firstName: values?.firstName ?? "",
    lastName: values?.lastName ?? "",
    roleTitle: values?.roleTitle ?? "",
    companyId: values?.companyId ?? "",
    notes: values?.notes ?? "",
    emailsText: values?.emailsText ?? "",
    primaryEmail: values?.primaryEmail ?? "",
    phonesText: values?.phonesText ?? "",
    primaryPhone: values?.primaryPhone ?? ""
  };
  const isInvalid = (field: string) => invalidFields?.includes(field) ?? false;

  return (
    <form action={action} className="space-y-5">
      {hiddenFields
        ? Object.entries(hiddenFields).map(([name, value]) => (
            <input key={name} name={name} type="hidden" value={value} />
          ))
        : null}
      <div className="grid gap-5 lg:grid-cols-2">
        <label className="space-y-2 text-sm text-slate-700">
          <span className="font-medium">{locale === "he" ? "שם פרטי" : "First name"}</span>
          <input
            className={`w-full rounded-2xl border px-4 py-3 ${isInvalid("firstName") ? "border-amber-500 bg-amber-50" : "border-slate-200"}`}
            defaultValue={defaults.firstName}
            name="firstName"
            required
          />
        </label>
        <label className="space-y-2 text-sm text-slate-700">
          <span className="font-medium">{locale === "he" ? "שם משפחה" : "Last name"}</span>
          <input
            className={`w-full rounded-2xl border px-4 py-3 ${isInvalid("lastName") ? "border-amber-500 bg-amber-50" : "border-slate-200"}`}
            defaultValue={defaults.lastName}
            name="lastName"
            required
          />
        </label>
        <label className="space-y-2 text-sm text-slate-700">
          <span className="font-medium">{locale === "he" ? "תפקיד" : "Role title"}</span>
          <input
            className="w-full rounded-2xl border border-slate-200 px-4 py-3"
            defaultValue={defaults.roleTitle}
            name="roleTitle"
          />
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
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <label className="space-y-2 text-sm text-slate-700">
          <span className="font-medium">
            {locale === "he" ? "אימיילים, שורה לכל ערך" : "Emails, one per line"}
          </span>
          <textarea
            className={`min-h-32 w-full rounded-2xl border px-4 py-3 ${isInvalid("emailsText") ? "border-amber-500 bg-amber-50" : "border-slate-200"}`}
            defaultValue={defaults.emailsText}
            name="emailsText"
          />
        </label>
        <label className="space-y-2 text-sm text-slate-700">
          <span className="font-medium">
            {locale === "he" ? "טלפונים, שורה לכל ערך" : "Phones, one per line"}
          </span>
          <textarea
            className={`min-h-32 w-full rounded-2xl border px-4 py-3 ${isInvalid("phonesText") ? "border-amber-500 bg-amber-50" : "border-slate-200"}`}
            defaultValue={defaults.phonesText}
            name="phonesText"
          />
        </label>
        <label className="space-y-2 text-sm text-slate-700">
          <span className="font-medium">
            {locale === "he" ? "אימייל ראשי" : "Primary email"}
          </span>
          <input
            className="w-full rounded-2xl border border-slate-200 px-4 py-3"
            defaultValue={defaults.primaryEmail}
            name="primaryEmail"
          />
        </label>
        <label className="space-y-2 text-sm text-slate-700">
          <span className="font-medium">
            {locale === "he" ? "טלפון ראשי" : "Primary phone"}
          </span>
          <input
            className="w-full rounded-2xl border border-slate-200 px-4 py-3"
            defaultValue={defaults.primaryPhone}
            name="primaryPhone"
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
      <button
        className="inline-flex rounded-full bg-ink px-5 py-3 text-sm font-medium text-white"
        type="submit"
      >
        {mode === "create"
          ? locale === "he"
            ? "יצירת איש קשר"
            : "Create contact"
          : locale === "he"
            ? "שמירת שינויים"
            : "Save changes"}
      </button>
    </form>
  );
}
