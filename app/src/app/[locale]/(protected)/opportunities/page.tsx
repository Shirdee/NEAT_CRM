import {getTranslations} from "next-intl/server";

import {Link} from "@/i18n/navigation";
import {canEditRecords, getCurrentSession} from "@/lib/auth/session";
import {getOpportunityFormOptions, listOpportunities} from "@/lib/data/crm";
import {listSavedViews, resolveSavedViewFilters} from "@/lib/data/saved-views";
import {LiveFilterForm} from "@/components/ui/live-filter-form";
import {LiveSearchSelect} from "@/components/ui/live-search-select";
import {SavedViewBar} from "@/components/ui/saved-view-bar";
import {StatusChip} from "@/components/ui/status-chip";
import {SurfaceCard} from "@/components/ui/surface-card";
import {KanbanBoard} from "@/components/opportunities/kanban-board";
import {ViewToggle} from "@/components/opportunities/view-toggle";

type OpportunitiesPageProps = {
  params: Promise<{locale: "en" | "he"}>;
  searchParams: Promise<{
    q?: string;
    companyId?: string;
    contactId?: string;
    stage?: string;
    type?: string;
    status?: string;
    view?: string;
    error?: string;
  }>;
};

function displayLabel(locale: "en" | "he", values: {en?: string | null; he?: string | null}) {
  return locale === "he" ? values.he || values.en || "—" : values.en || values.he || "—";
}

function formatMoney(value: unknown) {
  const numeric = Number(String(value ?? "").trim());
  if (!Number.isFinite(numeric)) return "—";
  return new Intl.NumberFormat(undefined, {maximumFractionDigits: 0}).format(numeric);
}

export default async function OpportunitiesPage({params, searchParams}: OpportunitiesPageProps) {
  const {locale} = await params;
  const query = await searchParams;
  const t = await getTranslations("Opportunities");
  const session = await getCurrentSession();
  const savedViews = session
    ? await listSavedViews({userId: session.id, module: "opportunities"})
    : [];
  const savedViewState = await resolveSavedViewFilters({
    module: "opportunities",
    userId: session?.id,
    searchParams: query
  });
  const filters = savedViewState.filters;
  const viewMode = query.view === "pipeline" ? "pipeline" : "table";
  const [{companies, contacts, stageOptions, typeOptions, statusOptions}, opportunities] =
    await Promise.all([
      getOpportunityFormOptions(),
      listOpportunities({
        query: filters.q,
        companyId: filters.companyId,
        contactId: filters.contactId,
        opportunityStageValueId: filters.stage,
        opportunityTypeValueId: filters.type,
        statusValueId: filters.status
      })
    ]);
  const selectedViewId = viewMode === "pipeline" ? null : savedViewState.selectedViewId;
  const selectedViewName = viewMode === "pipeline" ? null : savedViewState.selectedView?.name ?? null;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="font-display text-2xl font-bold text-ink">{t("title")}</h1>
          <span className="rounded-full bg-mist px-3 py-0.5 text-[13px] font-medium text-ink/50">
            {opportunities.length}
          </span>
        </div>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
          <ViewToggle current={viewMode} locale={locale} />
          {session && canEditRecords(session.role) ? (
            <Link
              className="inline-flex items-center justify-center rounded-full bg-coral px-5 py-2.5 text-[13.5px] font-semibold text-white transition hover:bg-coral/90"
              href="/opportunities/new"
              locale={locale}
            >
              {t("create")}
            </Link>
          ) : null}
        </div>
      </div>

      {query.error ? (
        <p className="rounded-2xl bg-amber/10 px-4 py-3 text-sm text-ink">{t("errors.generic")}</p>
      ) : null}

      {session ? (
        <SavedViewBar
          activeFilters={filters}
          locale={locale}
          module="opportunities"
          selectedViewId={selectedViewId}
          selectedViewName={selectedViewName}
          views={savedViews.map((view) => ({id: view.id, name: view.name}))}
        />
      ) : null}

      <SurfaceCard className="space-y-4">
        <LiveFilterForm className="flex flex-col gap-3 xl:flex-row xl:flex-wrap xl:items-center">
          <input name="view" type="hidden" value={viewMode === "pipeline" ? "pipeline" : selectedViewId ?? ""} />
          <input
            className="min-w-[220px] flex-1 rounded-[12px] bg-mist px-4 py-3 text-[13.5px] text-ink/70 placeholder:text-ink/30 focus:outline-none focus:ring-2 focus:ring-teal/20"
            defaultValue={filters.q ?? ""}
            name="q"
            placeholder={t("filters.query")}
          />
          <LiveSearchSelect
            allLabel={t("filters.allCompanies")}
            name="companyId"
            options={companies.map((company) => ({id: company.id, label: company.companyName}))}
            placeholder={t("filters.allCompanies")}
            value={filters.companyId ?? ""}
          />
          <LiveSearchSelect
            allLabel={t("filters.allContacts")}
            name="contactId"
            options={contacts.map((contact) => ({id: contact.id, label: contact.fullName}))}
            placeholder={t("filters.allContacts")}
            value={filters.contactId ?? ""}
          />
          <LiveSearchSelect
            allLabel={t("filters.allStages")}
            name="stage"
            options={stageOptions.map((option) => ({
              id: option.id,
              label: locale === "he" ? option.labelHe : option.labelEn
            }))}
            placeholder={t("filters.allStages")}
            value={filters.stage ?? ""}
          />
          <LiveSearchSelect
            allLabel={t("filters.allStatuses")}
            name="status"
            options={statusOptions.map((option) => ({
              id: option.id,
              label: locale === "he" ? option.labelHe : option.labelEn
            }))}
            placeholder={t("filters.allStatuses")}
            value={filters.status ?? ""}
          />
          <LiveSearchSelect
            allLabel={t("filters.allTypes")}
            name="type"
            options={typeOptions.map((option) => ({
              id: option.id,
              label: locale === "he" ? option.labelHe : option.labelEn
            }))}
            placeholder={t("filters.allTypes")}
            value={filters.type ?? ""}
          />
          <button
            className="rounded-full bg-coral px-5 py-2.5 text-[13.5px] font-semibold text-white transition hover:bg-coral/90 xl:ml-auto"
            type="submit"
          >
            {t("filters.apply")}
          </button>
        </LiveFilterForm>
      </SurfaceCard>

      {opportunities.length === 0 ? (
        <SurfaceCard className="bg-white p-8 text-sm text-ink/60">
          {t("empty")}
        </SurfaceCard>
      ) : viewMode === "pipeline" ? (
        <SurfaceCard className="overflow-hidden bg-white">
          <KanbanBoard locale={locale} opportunities={opportunities} stages={stageOptions} />
        </SurfaceCard>
      ) : (
        <SurfaceCard className="overflow-hidden p-0">
          <div className="space-y-3">
            {opportunities.map((opportunity) => (
              <Link
                className="block px-4 py-4 transition hover:bg-sand/70 sm:px-5 sm:py-5 [&:not(:last-child)]:shadow-[inset_0_-1px_0_rgba(16,36,63,0.04)]"
                href={`/opportunities/${opportunity.id}`}
                key={opportunity.id}
                locale={locale}
              >
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div className="space-y-1">
                    <p className="text-[13.5px] font-semibold text-ink">{opportunity.opportunityName}</p>
                    <p className="text-sm text-ink/60">{opportunity.notes || t("labels.noNotes")}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 lg:justify-end">
                    <StatusChip tone="teal">
                      {displayLabel(locale, {en: opportunity.stageLabelEn, he: opportunity.stageLabelHe})}
                    </StatusChip>
                    <StatusChip>
                      {displayLabel(locale, {en: opportunity.statusLabelEn, he: opportunity.statusLabelHe})}
                    </StatusChip>
                    <StatusChip tone="ink">{opportunity.companyName ?? "—"}</StatusChip>
                    <StatusChip tone="amber">{formatMoney(opportunity.estimatedValue)}</StatusChip>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </SurfaceCard>
      )}
    </div>
  );
}
