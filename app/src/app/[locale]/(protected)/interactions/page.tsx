import {getTranslations} from "next-intl/server";

import {Link} from "@/i18n/navigation";
import {canEditRecords, getCurrentSession} from "@/lib/auth/session";
import {getInteractionListFilterOptions, listInteractions} from "@/lib/data/crm";
import {LiveFilterForm} from "@/components/ui/live-filter-form";
import {LiveSearchSelect} from "@/components/ui/live-search-select";
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
  return parts.join(" - ");
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
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="font-display text-2xl font-bold text-ink">{t("title")}</h1>
          <span className="rounded-full bg-mist px-3 py-0.5 text-[13px] font-medium text-ink/50">
            {totalInteractions}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {session ? <StatusChip tone="teal">{t("readiness")}</StatusChip> : null}
          <StatusChip tone="ink">
            {locale === "he" ? `${totalInteractions} תוצאות` : `${totalInteractions} results`}
          </StatusChip>
          {session && canEditRecords(session.role) ? (
            <Link
              className="inline-flex items-center justify-center rounded-full bg-coral px-5 py-2.5 text-[13.5px] font-semibold text-white transition hover:bg-coral/90"
              href="/interactions/new"
              locale={locale}
            >
              {t("create")}
            </Link>
          ) : null}
        </div>
      </div>

      <SurfaceCard className="space-y-4">
        <LiveFilterForm className="flex flex-col gap-3 xl:flex-row xl:flex-wrap xl:items-center">
          <input
            className="min-w-[220px] flex-1 rounded-[12px] bg-mist px-4 py-3 text-[13.5px] text-ink/70 placeholder:text-ink/30 focus:outline-none focus:ring-2 focus:ring-teal/20"
            defaultValue={query.q ?? ""}
            name="q"
            placeholder={t("filters.query")}
          />
          <LiveSearchSelect
            allLabel={t("filters.allCompanies")}
            name="companyId"
            options={companies.map((company) => ({id: company.id, label: company.companyName}))}
            placeholder={t("filters.allCompanies")}
            value={query.companyId ?? ""}
          />
          <LiveSearchSelect
            allLabel={t("filters.allContacts")}
            name="contactId"
            options={contacts.map((contact) => ({id: contact.id, label: contact.fullName}))}
            placeholder={t("filters.allContacts")}
            value={query.contactId ?? ""}
          />
          <LiveSearchSelect
            allLabel={t("filters.allTypes")}
            name="interactionTypeValueId"
            options={interactionTypeOptions.map((option) => ({
              id: option.id,
              label: locale === "he" ? option.labelHe : option.labelEn
            }))}
            placeholder={t("filters.allTypes")}
            value={query.interactionTypeValueId ?? ""}
          />
          <button
            className="rounded-full bg-coral px-5 py-2.5 text-[13.5px] font-semibold text-white transition hover:bg-coral/90 xl:ml-auto"
            type="submit"
          >
            {t("filters.apply")}
          </button>
        </LiveFilterForm>
      </SurfaceCard>

      {interactions.length === 0 ? (
        <SurfaceCard className="bg-white text-sm text-ink/60">{t("empty")}</SurfaceCard>
      ) : (
        <SurfaceCard className="overflow-hidden p-0">
          {interactions.map((interaction) => (
            <Link
              className="block px-4 py-3 transition hover:bg-sand/70 sm:px-5 sm:py-4 [&:not(:last-child)]:shadow-[inset_0_-1px_0_rgba(16,36,63,0.04)]"
              href={`/interactions/${interaction.id}`}
              key={interaction.id}
              locale={locale}
            >
              <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-1">
                  {(() => {
                    const firstName = firstNameFromFullName(interaction.contactName);
                    const lineOne = buildLineOne(firstName, interaction.companyName);
                    const lineTwo = `${interaction.subject} - ${formatDate(locale, interaction.interactionDate)}`;

                    return (
                      <>
                        <p className="font-display text-lg font-semibold tracking-tight text-ink">
                          {lineOne || interaction.subject}
                        </p>
                        <p className="text-sm leading-6 text-ink/60">{lineTwo}</p>
                      </>
                    );
                  })()}
                </div>
                <div className="flex flex-wrap gap-1.5 lg:justify-end">
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
