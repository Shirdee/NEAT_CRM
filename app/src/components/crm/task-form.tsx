import type {AppLocale} from "@/i18n/routing";
import type {LookupOption} from "@/lib/data/crm";

import {CompanyContactLinkFields} from "./company-contact-link-fields";
import {SearchableOptionField} from "./searchable-option-field";

type TaskFormValues = {
  companyId: string;
  contactId: string;
  relatedInteractionId: string;
  taskTypeValueId: string;
  dueDate: string;
  priorityValueId: string;
  statusValueId: string;
  notes: string;
  followUpEmail: string;
};

type TaskFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  companies: Array<{id: string; companyName: string}>;
  compact?: boolean;
  contacts: Array<{id: string; fullName: string; companyId: string | null}>;
  hiddenFields?: Record<string, string>;
  invalidFields?: string[];
  interactions: Array<{id: string; subject: string}>;
  locale: AppLocale;
  mode: "create" | "edit";
  priorityOptions: LookupOption[];
  statusOptions: LookupOption[];
  taskTypeOptions: LookupOption[];
  values?: Partial<TaskFormValues>;
};

function lookupLabel(option: LookupOption, locale: AppLocale) {
  return locale === "he" ? option.labelHe : option.labelEn;
}

export function TaskForm({
  action,
  companies,
  compact,
  contacts,
  hiddenFields,
  invalidFields,
  interactions,
  locale,
  mode,
  priorityOptions,
  statusOptions,
  taskTypeOptions,
  values
}: TaskFormProps) {
  const defaults: TaskFormValues = {
    companyId: values?.companyId ?? "",
    contactId: values?.contactId ?? "",
    relatedInteractionId: values?.relatedInteractionId ?? "",
    taskTypeValueId: values?.taskTypeValueId ?? "",
    dueDate: values?.dueDate ?? "",
    priorityValueId: values?.priorityValueId ?? "",
    statusValueId: values?.statusValueId ?? "",
    notes: values?.notes ?? "",
    followUpEmail: values?.followUpEmail ?? ""
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
        <label className="space-y-2 text-sm text-ink/70">
          <span className="font-medium">{locale === "he" ? "תאריך יעד" : "Due date"}</span>
          <input
            className={`w-full rounded-2xl border px-4 py-3 ${isInvalid("dueDate") ? "border-coral bg-sand/70 ring-1 ring-coral/25" : "border-sand/70 bg-white"}`}
            defaultValue={defaults.dueDate}
            name="dueDate"
            required
            type="datetime-local"
          />
        </label>
        <label className="space-y-2 text-sm text-ink/70">
          <span className="font-medium">{locale === "he" ? "סוג משימה" : "Task type"}</span>
          <select
            className={`w-full rounded-2xl border px-4 py-3 ${isInvalid("taskTypeValueId") ? "border-coral bg-sand/70 ring-1 ring-coral/25" : "border-sand/70 bg-white"}`}
            defaultValue={defaults.taskTypeValueId}
            name="taskTypeValueId"
            required
          >
            <option value="">{locale === "he" ? "בחירה" : "Select type"}</option>
            {taskTypeOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {lookupLabel(option, locale)}
              </option>
            ))}
          </select>
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
        <label className="space-y-2 text-sm text-ink/70">
          <span className="font-medium">{locale === "he" ? "עדיפות" : "Priority"}</span>
          <select
            className={`w-full rounded-2xl border px-4 py-3 ${isInvalid("priorityValueId") ? "border-coral bg-sand/70 ring-1 ring-coral/25" : "border-sand/70 bg-white"}`}
            defaultValue={defaults.priorityValueId}
            name="priorityValueId"
            required
          >
            <option value="">{locale === "he" ? "בחירה" : "Select priority"}</option>
            {priorityOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {lookupLabel(option, locale)}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-2 text-sm text-ink/70">
          <span className="font-medium">{locale === "he" ? "סטטוס" : "Status"}</span>
          <select
            className={`w-full rounded-2xl border px-4 py-3 ${isInvalid("statusValueId") ? "border-coral bg-sand/70 ring-1 ring-coral/25" : "border-sand/70 bg-white"}`}
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
      </div>
      {compact ? (
        <details className="rounded-[24px] bg-white/85 px-4 py-4">
          <summary className="cursor-pointer text-sm font-medium text-ink/70">
            {locale === "he" ? "שדות נוספים" : "More details"}
          </summary>
          <div className="mt-4 space-y-5">
            <SearchableOptionField
              emptyLabel={locale === "he" ? "ללא אינטראקציה" : "No interaction"}
              label={locale === "he" ? "אינטראקציה קשורה" : "Related interaction"}
              name="relatedInteractionId"
              noResultsLabel={locale === "he" ? "לא נמצאו אינטראקציות" : "No interactions found"}
              options={interactions.map((i) => ({id: i.id, label: i.subject}))}
              placeholder={locale === "he" ? "חיפוש אינטראקציה" : "Search interaction"}
              searchPlaceholder={locale === "he" ? "חיפוש אינטראקציה אחרת" : "Search another interaction"}
              value={defaults.relatedInteractionId}
            />
          </div>
        </details>
      ) : (
        <>
          <SearchableOptionField
            emptyLabel={locale === "he" ? "ללא אינטראקציה" : "No interaction"}
            label={locale === "he" ? "אינטראקציה קשורה" : "Related interaction"}
            name="relatedInteractionId"
            noResultsLabel={locale === "he" ? "לא נמצאו אינטראקציות" : "No interactions found"}
            options={interactions.map((i) => ({id: i.id, label: i.subject}))}
            placeholder={locale === "he" ? "חיפוש אינטראקציה" : "Search interaction"}
            searchPlaceholder={locale === "he" ? "חיפוש אינטראקציה אחרת" : "Search another interaction"}
            value={defaults.relatedInteractionId}
          />
        </>
      )}
      <label className="block space-y-2 text-sm text-ink/70">
        <span className="font-medium">{locale === "he" ? "אימייל למעקב" : "Follow-up email"}</span>
        <input
          className="w-full rounded-2xl border border-sand/70 bg-white px-4 py-3"
          defaultValue={defaults.followUpEmail}
          name="followUpEmail"
          placeholder={locale === "he" ? "אימייל נוסף להקשר" : "Optional email context"}
          type="email"
        />
      </label>
      <label className="block space-y-2 text-sm text-ink/70">
        <span className="font-medium">{locale === "he" ? "הערות" : "Notes"}</span>
        <textarea
          className={`w-full rounded-2xl border border-sand/70 bg-white px-4 py-3 ${compact ? "min-h-24" : "min-h-32"}`}
          defaultValue={defaults.notes}
          name="notes"
        />
      </label>
      <button
        className={`inline-flex rounded-full bg-ink px-5 py-3 text-sm font-medium text-white ${compact ? "w-full items-center justify-center" : ""}`}
        type="submit"
      >
        {mode === "create"
          ? locale === "he"
            ? "יצירת מעקב"
            : "Create follow-up"
          : locale === "he"
            ? "שמירת שינויים"
            : "Save changes"}
      </button>
    </form>
  );
}
