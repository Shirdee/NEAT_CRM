import type {AppLocale} from "@/i18n/routing";

import {SearchableOptionField} from "./searchable-option-field";

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
        <label className="space-y-2 text-sm text-ink/70">
          <span className="font-medium">{locale === "he" ? "שם פרטי" : "First name"}</span>
          <input
            className={`w-full rounded-2xl border px-4 py-3 ${isInvalid("firstName") ? "border-coral bg-sand/70 ring-1 ring-coral/25" : "border-sand/70 bg-white"}`}
            defaultValue={defaults.firstName}
            name="firstName"
            required
          />
        </label>
        <label className="space-y-2 text-sm text-ink/70">
          <span className="font-medium">{locale === "he" ? "שם משפחה" : "Last name"}</span>
          <input
            className={`w-full rounded-2xl border px-4 py-3 ${isInvalid("lastName") ? "border-coral bg-sand/70 ring-1 ring-coral/25" : "border-sand/70 bg-white"}`}
            defaultValue={defaults.lastName}
            name="lastName"
            required
          />
        </label>
        <label className="space-y-2 text-sm text-ink/70">
          <span className="font-medium">{locale === "he" ? "תפקיד" : "Role title"}</span>
          <input
            className="w-full rounded-2xl border border-sand/70 bg-white px-4 py-3"
            defaultValue={defaults.roleTitle}
            name="roleTitle"
          />
        </label>
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
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <label className="space-y-2 text-sm text-ink/70">
          <span className="font-medium">
            {locale === "he" ? "אימיילים, שורה לכל ערך" : "Emails, one per line"}
          </span>
          <textarea
            className={`min-h-32 w-full rounded-2xl border px-4 py-3 ${isInvalid("emailsText") ? "border-coral bg-sand/70 ring-1 ring-coral/25" : "border-sand/70 bg-white"}`}
            defaultValue={defaults.emailsText}
            name="emailsText"
          />
        </label>
        <label className="space-y-2 text-sm text-ink/70">
          <span className="font-medium">
            {locale === "he" ? "טלפונים, שורה לכל ערך" : "Phones, one per line"}
          </span>
          <textarea
            className={`min-h-32 w-full rounded-2xl border px-4 py-3 ${isInvalid("phonesText") ? "border-coral bg-sand/70 ring-1 ring-coral/25" : "border-sand/70 bg-white"}`}
            defaultValue={defaults.phonesText}
            name="phonesText"
          />
        </label>
        <label className="space-y-2 text-sm text-ink/70">
          <span className="font-medium">
            {locale === "he" ? "אימייל ראשי" : "Primary email"}
          </span>
          <input
            className="w-full rounded-2xl border border-sand/70 bg-white px-4 py-3"
            defaultValue={defaults.primaryEmail}
            name="primaryEmail"
          />
        </label>
        <label className="space-y-2 text-sm text-ink/70">
          <span className="font-medium">
            {locale === "he" ? "טלפון ראשי" : "Primary phone"}
          </span>
          <input
            className="w-full rounded-2xl border border-sand/70 bg-white px-4 py-3"
            defaultValue={defaults.primaryPhone}
            name="primaryPhone"
          />
        </label>
      </div>
      <label className="block space-y-2 text-sm text-ink/70">
        <span className="font-medium">{locale === "he" ? "הערות" : "Notes"}</span>
        <textarea
          className="min-h-32 w-full rounded-2xl border border-sand/70 bg-white px-4 py-3"
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
