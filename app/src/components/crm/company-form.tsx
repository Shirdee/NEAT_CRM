import type {AppLocale} from "@/i18n/routing";
import type {LookupOption} from "@/lib/data/crm";

type CompanyFormValues = {
  companyName: string;
  website: string;
  sourceValueId: string;
  stageValueId: string;
  notes: string;
};

type CompanyFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  hiddenFields?: Record<string, string>;
  invalidFields?: string[];
  locale: AppLocale;
  mode: "create" | "edit";
  sourceOptions: LookupOption[];
  stageOptions: LookupOption[];
  values?: Partial<CompanyFormValues>;
};

function lookupLabel(option: LookupOption, locale: AppLocale) {
  return locale === "he" ? option.labelHe : option.labelEn;
}

export function CompanyForm({
  action,
  hiddenFields,
  invalidFields,
  locale,
  mode,
  sourceOptions,
  stageOptions,
  values
}: CompanyFormProps) {
  const defaults: CompanyFormValues = {
    companyName: values?.companyName ?? "",
    website: values?.website ?? "",
    sourceValueId: values?.sourceValueId ?? "",
    stageValueId: values?.stageValueId ?? "",
    notes: values?.notes ?? ""
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
          <span className="font-medium">{locale === "he" ? "שם חברה" : "Company name"}</span>
          <input
            className={`w-full rounded-2xl border px-4 py-3 ${isInvalid("companyName") ? "border-coral bg-sand/70 ring-1 ring-coral/25" : "border-sand/70 bg-white"}`}
            defaultValue={defaults.companyName}
            name="companyName"
            required
          />
        </label>
        <label className="space-y-2 text-sm text-ink/70">
          <span className="font-medium">{locale === "he" ? "אתר" : "Website"}</span>
          <input
            className="w-full rounded-2xl border border-sand/70 bg-white px-4 py-3"
            defaultValue={defaults.website}
            name="website"
            placeholder="https://"
          />
        </label>
        <label className="space-y-2 text-sm text-ink/70">
          <span className="font-medium">{locale === "he" ? "מקור" : "Source"}</span>
          <select
            className="w-full rounded-2xl border border-sand/70 bg-white px-4 py-3"
            defaultValue={defaults.sourceValueId}
            name="sourceValueId"
          >
            <option value="">{locale === "he" ? "ללא" : "None"}</option>
            {sourceOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {lookupLabel(option, locale)}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-2 text-sm text-ink/70">
          <span className="font-medium">{locale === "he" ? "שלב" : "Stage"}</span>
          <select
            className="w-full rounded-2xl border border-sand/70 bg-white px-4 py-3"
            defaultValue={defaults.stageValueId}
            name="stageValueId"
          >
            <option value="">{locale === "he" ? "ללא" : "None"}</option>
            {stageOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {lookupLabel(option, locale)}
              </option>
            ))}
          </select>
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
            ? "יצירת חברה"
            : "Create company"
          : locale === "he"
            ? "שמירת שינויים"
            : "Save changes"}
      </button>
    </form>
  );
}
