"use client";

import {Link} from "@/i18n/navigation";
import type {AppLocale} from "@/i18n/routing";
import type {LookupOption} from "@/lib/data/crm";

type KanbanBoardProps = {
  opportunities: Array<{
    id: string;
    opportunityName: string;
    companyName: string | null;
    contactName: string | null;
    estimatedValue: unknown;
    targetCloseDate: unknown;
    opportunityStageValueId: string;
    statusLabelEn?: string | null;
    statusLabelHe?: string | null;
  }>;
  stages: LookupOption[];
  locale: AppLocale;
};

function displayLabel(locale: AppLocale, values: {en?: string | null; he?: string | null}) {
  return locale === "he" ? values.he || values.en || "—" : values.en || values.he || "—";
}

function formatMoney(value: unknown) {
  const numeric = Number(String(value ?? "").trim());
  if (!Number.isFinite(numeric)) return "—";
  return new Intl.NumberFormat(undefined, {maximumFractionDigits: 0}).format(numeric);
}

function formatDate(locale: AppLocale, value: unknown) {
  if (!value) return "—";
  const date = value instanceof Date ? value : new Date(value as string | number);
  return new Intl.DateTimeFormat(locale === "he" ? "he-IL" : "en-US", {dateStyle: "medium"}).format(date);
}

function KanbanCard({
  opportunity,
  locale
}: {
  opportunity: KanbanBoardProps["opportunities"][number];
  locale: AppLocale;
}) {
  return (
    <Link
      className="block rounded-[18px] border border-ink/10 bg-white p-4 shadow-[0_8px_24px_rgba(58,48,45,0.05)] transition hover:-translate-y-0.5 hover:border-coral/30 hover:shadow-[0_14px_32px_rgba(58,48,45,0.1)]"
      href={`/opportunities/${opportunity.id}`}
      locale={locale}
    >
      <p className="text-[13.5px] font-semibold leading-snug text-ink">{opportunity.opportunityName}</p>
      <p className="mt-1 text-[12px] text-teal">{opportunity.companyName || "—"}</p>
      <div className="mt-3 flex items-center justify-between gap-3">
        <span className="font-display text-[14px] font-bold text-coral">
          {formatMoney(opportunity.estimatedValue)}
        </span>
        <span className="text-[11px] text-ink/40">
          {formatDate(locale, opportunity.targetCloseDate)}
        </span>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <span className="rounded-full bg-mist px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/60">
          {displayLabel(locale, {en: opportunity.statusLabelEn, he: opportunity.statusLabelHe})}
        </span>
        {opportunity.contactName ? (
          <span className="rounded-full bg-sand px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/60">
            {opportunity.contactName}
          </span>
        ) : null}
      </div>
    </Link>
  );
}

function KanbanColumn({
  stage,
  cards,
  locale
}: {
  stage: LookupOption;
  cards: KanbanBoardProps["opportunities"];
  locale: AppLocale;
}) {
  return (
    <section className="flex w-[260px] shrink-0 flex-col gap-3 rounded-[24px] bg-mist/80 p-3">
      <div className="flex items-center justify-between gap-3 px-1 pb-1">
        <h3 className="text-[12px] font-bold uppercase tracking-[0.06em] text-ink/55">
          {displayLabel(locale, {en: stage.labelEn, he: stage.labelHe})}
        </h3>
        <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold text-ink/50">
          {cards.length}
        </span>
      </div>
      <div className="space-y-3">
        {cards.length === 0 ? (
          <div className="rounded-[18px] border border-dashed border-ink/10 bg-white/60 px-3 py-4 text-xs text-ink/40">
            —
          </div>
        ) : (
          cards.map((opportunity) => (
            <KanbanCard key={opportunity.id} locale={locale} opportunity={opportunity} />
          ))
        )}
      </div>
      <Link
        className="rounded-[16px] border border-dashed border-ink/10 px-3 py-2 text-[12px] font-medium text-ink/40 transition hover:border-teal/25 hover:text-teal"
        href={`/opportunities/new?stageId=${stage.id}`}
        locale={locale}
      >
        + Add deal
      </Link>
    </section>
  );
}

export function KanbanBoard({opportunities, stages, locale}: KanbanBoardProps) {
  return (
    <div className="flex gap-3.5 overflow-x-auto pb-2 pr-1">
      {stages.map((stage) => {
        const cards = opportunities.filter((opportunity) => opportunity.opportunityStageValueId === stage.id);

        return <KanbanColumn cards={cards} key={stage.id} locale={locale} stage={stage} />;
      })}
    </div>
  );
}
