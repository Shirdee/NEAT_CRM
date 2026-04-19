import {getTranslations} from "next-intl/server";

import {Link} from "@/i18n/navigation";
import {canEditRecords, getCurrentSession} from "@/lib/auth/session";
import {getInteractionListFilterOptions, listInteractions} from "@/lib/data/crm";
import {LiveFilterForm} from "@/components/ui/live-filter-form";
import {StatusChip} from "@/components/ui/status-chip";
import {SurfaceCard} from "@/components/ui/surface-card";

type InteractionsPageProps = {
  params: Promise<{locale: "en" | "he"}>;
  searchParams: Promise<{
    q?: string;
    companyId?: string;
    contactId?: string;
    interactionTypeValueId?: string;
  }>;
};

function labelForLocale(locale: "en" | "he", values: {en?: string | null; he?: string | null}) {
  return locale === "he" ? values.he || values.en || "—" : values.en || values.he || "—";
}

function formatDate(locale: "en" | "he", value: Date | string) {
  return new Intl.DateTimeFormat(locale === "he" ? "he-IL" : "en-US", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

function firstNameFromFullName(fullName: string | null) {
  if (!fullName) {
    return null;
  }

  return fullName.trim().split(/\s+/)[0] || null;
}

function buildLineOne(firstName: string | null, companyName: string | null) {
  const parts = [firstName, companyName].filter((value): value is string => Boolean(value));
  return parts.join(" + ");
}

export default async function InteractionsPage({params, searchParams}: InteractionsPageProps) {
  const {locale} = await params;
  const query = await searchParams;
  const t = await getTranslations("Interactions");
  const session = await getCurrentSession();
  const [{companies, contacts, interactionTypeOptions}, interactions] = await Promise.all([
    getInteractionListFilterOptions(),
    listInteractions({
      query: query.q,
      companyId: query.companyId,
      contactId: query.contactId,
      interactionTypeValueId: query.interactionTypeValueId
    })
  ]);
  const totalInteractions = interactions.length;

  return (
    <div className="space-y-4 lg:space-y-5">
      <SurfaceCard className="overflow-hidden bg-white/95">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.3em] text-coral">{t("title")}</p>
            <h2 className="font-display text-3xl font-semibold tracking-tight text-ink">{t("title")}</h2>
            <p className="max-w-3xl text-sm leading-7 text-ink/70">{t("subtitle")}</p>
            <div className="flex flex-wrap gap-2">
              {session ? <StatusChip tone="teal">{t("readiness")}</StatusChip> : null}
              <StatusChip tone="ink">
                {locale === "he" ? `${totalInteractions} תוצאות` : `${totalInteractions} results`}
              </StatusChip>
            </div>
          </div>
          <div className="flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end lg:w-auto">
            {session && canEditRecords(session.role) ? (
              <Link
                className="inline-flex items-center justify-center rounded-full bg-coral px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-coral/90"
                href="/interactions/new"
                locale={locale}
              >
                {t("create")}
              </Link>
            ) : null}
          </div>
        </div>
      </SurfaceCard>

      <SurfaceCard className="space-y-4 bg-white/95">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.24em] text-coral">
            {locale === "he" ? "סינון אינטראקציות" : "Interaction filters"}
          </p>
          <h3 className="text-lg font-semibold text-ink">{t("title")}</h3>
        </div>
        <LiveFilterForm className="grid gap-4 lg:grid-cols-4">
          <input
            className="rounded-[22px] bg-mist px-4 py-3 text-ink/70 shadow-inner shadow-white/60 outline-none ring-1 ring-transparent transition placeholder:text-ink/50 focus:ring-coral/30"
            defaultValue={query.q ?? ""}
            name="q"
            placeholder={t("filters.query")}
          />
          <select
            className="rounded-[22px] bg-mist px-4 py-3 text-ink/70 shadow-inner shadow-white/60 outline-none ring-1 ring-transparent transition focus:ring-coral/30"
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
            className="rounded-[22px] bg-mist px-4 py-3 text-ink/70 shadow-inner shadow-white/60 outline-none ring-1 ring-transparent transition focus:ring-coral/30"
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
            className="rounded-[22px] bg-mist px-4 py-3 text-ink/70 shadow-inner shadow-white/60 outline-none ring-1 ring-transparent transition focus:ring-coral/30"
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
            data-live-submit="off"
            className="rounded-full bg-coral px-5 py-3 text-sm font-medium text-white lg:col-span-4 lg:justify-self-start"
            type="submit"
          >
            {t("filters.apply")}
          </button>
        </LiveFilterForm>
      </SurfaceCard>

      {interactions.length === 0 ? (
        <SurfaceCard className="bg-white/95 text-sm text-ink/60">{t("empty")}</SurfaceCard>
      ) : (
        <SurfaceCard className="space-y-3 bg-white/95">
          {interactions.map((interaction) => (
            <Link
              className="block rounded-[24px] border border-ink/10 bg-white/80 px-4 py-4 shadow-[0_8px_24px_rgba(58,48,45,0.04)] transition hover:-translate-y-0.5 hover:border-coral/30 hover:bg-sand/70 sm:px-5 sm:py-5"
              href={`/interactions/${interaction.id}`}
              key={interaction.id}
              locale={locale}
            >
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-1">
                  {(() => {
                    const firstName = firstNameFromFullName(interaction.contactName);
                    const lineOne = buildLineOne(firstName, interaction.companyName);
                    const lineTwo = `${interaction.subject} + ${formatDate(locale, interaction.interactionDate)}`;

                    return (
                      <>
                        <p className="font-display text-xl font-semibold tracking-tight text-ink">
                          {lineOne || interaction.subject}
                        </p>
                        <p className="text-sm leading-7 text-ink/60">{lineTwo}</p>
                      </>
                    );
                  })()}
                </div>
                <div className="flex flex-wrap gap-2 lg:justify-end">
                  <StatusChip tone="teal">
                    {labelForLocale(locale, {
                      en: interaction.interactionTypeLabelEn,
                      he: interaction.interactionTypeLabelHe
                    })}
                  </StatusChip>
                  <StatusChip tone="ink">
                    {labelForLocale(locale, {
                      en: interaction.outcomeLabelEn,
                      he: interaction.outcomeLabelHe
                    })}
                  </StatusChip>
                </div>
              </div>
            </Link>
          ))}
        </SurfaceCard>
      )}
    </div>
  );
}
