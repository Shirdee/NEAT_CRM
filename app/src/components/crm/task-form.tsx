import type {AppLocale} from "@/i18n/routing";
import type {LookupOption} from "@/lib/data/crm";

type TaskFormValues = {
  companyId: string;
  contactId: string;
  relatedInteractionId: string;
  taskTypeValueId: string;
  dueDate: string;
  priorityValueId: string;
  statusValueId: string;
  notes: string;
};

type TaskFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  companies: Array<{id: string; companyName: string}>;
  contacts: Array<{id: string; fullName: string}>;
  hiddenFields?: Record<string, string>;
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
  contacts,
  hiddenFields,
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
    notes: values?.notes ?? ""
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
          <span className="font-medium">{locale === "he" ? "תאריך יעד" : "Due date"}</span>
          <input
            className="w-full rounded-2xl border border-slate-200 px-4 py-3"
            defaultValue={defaults.dueDate}
            name="dueDate"
            required
            type="datetime-local"
          />
        </label>
        <label className="space-y-2 text-sm text-slate-700">
          <span className="font-medium">{locale === "he" ? "סוג משימה" : "Task type"}</span>
          <select
            className="w-full rounded-2xl border border-slate-200 px-4 py-3"
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
        <label className="space-y-2 text-sm text-slate-700">
          <span className="font-medium">{locale === "he" ? "עדיפות" : "Priority"}</span>
          <select
            className="w-full rounded-2xl border border-slate-200 px-4 py-3"
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
        <label className="space-y-2 text-sm text-slate-700">
          <span className="font-medium">{locale === "he" ? "סטטוס" : "Status"}</span>
          <select
            className="w-full rounded-2xl border border-slate-200 px-4 py-3"
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
      <label className="block space-y-2 text-sm text-slate-700">
        <span className="font-medium">{locale === "he" ? "אינטראקציה קשורה" : "Related interaction"}</span>
        <select
          className="w-full rounded-2xl border border-slate-200 px-4 py-3"
          defaultValue={defaults.relatedInteractionId}
          name="relatedInteractionId"
        >
          <option value="">{locale === "he" ? "ללא אינטראקציה" : "No interaction"}</option>
          {interactions.map((interaction) => (
            <option key={interaction.id} value={interaction.id}>
              {interaction.subject}
            </option>
          ))}
        </select>
      </label>
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
            ? "יצירת מעקב"
            : "Create follow-up"
          : locale === "he"
            ? "שמירת שינויים"
            : "Save changes"}
      </button>
    </form>
  );
}
