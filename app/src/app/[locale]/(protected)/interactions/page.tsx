import {getTranslations} from "next-intl/server";

import {Link} from "@/i18n/navigation";
import {canEditRecords, getCurrentSession} from "@/lib/auth/session";
import {getInteractionFormOptions, listInteractions} from "@/lib/data/crm";

type InteractionsPageProps = {
  params: Promise<{locale: "en" | "he"}>;
  searchParams: Promise<{
    q?: string;
    companyId?: string;
    contactId?: string;
    interactionTypeValueId?: string;
  }>;
};

function labelForLocale(
  locale: "en" | "he",
  values: {en?: string | null; he?: string | null}
) {
  return locale === "he" ? values.he || values.en || "—" : values.en || values.he || "—";
}

function formatDate(locale: "en" | "he", value: Date | string) {
  return new Intl.DateTimeFormat(locale === "he" ? "he-IL" : "en-US", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

export default async function InteractionsPage({
  params,
  searchParams
}: InteractionsPageProps) {
  const {locale} = await params;
  const query = await searchParams;
  const t = await getTranslations("Interactions");
  const session = await getCurrentSession();
  const [{companies, contacts, interactionTypeOptions}, interactions] = await Promise.all([
    getInteractionFormOptions(),
    listInteractions({
      query: query.q,
      companyId: query.companyId,
      contactId: query.contactId,
      interactionTypeValueId: query.interactionTypeValueId
    })
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-3">
          <h2 className="text-3xl font-semibold text-ink">{t("title")}</h2>
          <p className="max-w-3xl text-sm leading-7 text-slate-600">{t("subtitle")}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {session ? (
            <span className="rounded-full bg-mist px-4 py-2 text-sm text-slate-700">{t("readiness")}</span>
          ) : null}
          {session && canEditRecords(session.role) ? (
            <Link
              className="inline-flex rounded-full bg-ink px-5 py-3 text-sm font-medium text-white"
              href="/interactions/new"
              locale={locale}
            >
              {t("create")}
            </Link>
          ) : null}
        </div>
      </div>

      <form className="grid gap-4 rounded-[24px] border border-slate-200 bg-white p-5 lg:grid-cols-4">
        <input
          className="rounded-2xl border border-slate-200 px-4 py-3"
          defaultValue={query.q ?? ""}
          name="q"
          placeholder={t("filters.query")}
        />
        <select
          className="rounded-2xl border border-slate-200 px-4 py-3"
          defaultValue={query.companyId ?? ""}
          name="companyId"
        >
          <option value="">{t("filters.allCompanies")}</option>
          {companies.map((company) => (
            <option key={company.id} value={company.id}>
              {company.companyName}
            </option>
          ))}
        </select>
        <select
          className="rounded-2xl border border-slate-200 px-4 py-3"
          defaultValue={query.contactId ?? ""}
          name="contactId"
        >
          <option value="">{t("filters.allContacts")}</option>
          {contacts.map((contact) => (
            <option key={contact.id} value={contact.id}>
              {contact.fullName}
            </option>
          ))}
        </select>
        <select
          className="rounded-2xl border border-slate-200 px-4 py-3"
          defaultValue={query.interactionTypeValueId ?? ""}
          name="interactionTypeValueId"
        >
          <option value="">{t("filters.allTypes")}</option>
          {interactionTypeOptions.map((option) => (
            <option key={option.id} value={option.id}>
              {locale === "he" ? option.labelHe : option.labelEn}
            </option>
          ))}
        </select>
        <button
          className="rounded-full bg-coral px-5 py-3 text-sm font-medium text-white lg:col-span-4 lg:justify-self-start"
          type="submit"
        >
          {t("filters.apply")}
        </button>
      </form>

      {interactions.length === 0 ? (
        <section className="rounded-[24px] border border-dashed border-slate-300 bg-white p-8 text-sm text-slate-600">
          {t("empty")}
        </section>
      ) : (
        <div className="space-y-4">
          {interactions.map((interaction) => (
            <Link
              className="block rounded-[24px] border border-slate-200 bg-white p-5 transition hover:border-coral/50 hover:shadow-soft"
              href={`/interactions/${interaction.id}`}
              key={interaction.id}
              locale={locale}
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-2">
                  <p className="text-lg font-semibold text-ink">{interaction.subject}</p>
                  <p className="text-sm text-slate-600">{interaction.summary}</p>
                  <div className="flex flex-wrap gap-2 text-xs uppercase tracking-[0.2em] text-slate-500">
                    <span>
                      {labelForLocale(locale, {
                        en: interaction.interactionTypeLabelEn,
                        he: interaction.interactionTypeLabelHe
                      })}
                    </span>
                    <span>{interaction.companyName || t("labels.noCompany")}</span>
                    <span>{interaction.contactName || t("labels.noContact")}</span>
                  </div>
                </div>
                <div className="space-y-2 text-sm text-slate-600 lg:text-end">
                  <p>{formatDate(locale, interaction.interactionDate)}</p>
                  <p>
                    {labelForLocale(locale, {
                      en: interaction.outcomeLabelEn,
                      he: interaction.outcomeLabelHe
                    })}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
