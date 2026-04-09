import {getTranslations} from "next-intl/server";
import {redirect} from "next/navigation";

import {InteractionForm} from "@/components/crm/interaction-form";
import {Link} from "@/i18n/navigation";
import {canEditRecords, getCurrentSession} from "@/lib/auth/session";
import {getInteractionFormOptions} from "@/lib/data/crm";
import {SurfaceCard} from "@/components/ui/surface-card";

import {createInteractionAction} from "../actions";

type NewInteractionPageProps = {
  params: Promise<{locale: "en" | "he"}>;
  searchParams: Promise<{
    compact?: string;
    contactId?: string;
    companyId?: string;
    error?: string;
    interactionDate?: string;
    interactionTypeValueId?: string;
    invalidFields?: string;
    outcomeStatusValueId?: string;
    subject?: string;
    summary?: string;
  }>;
};

function nowLocalInput() {
  const date = new Date();
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

export default async function NewInteractionPage({params, searchParams}: NewInteractionPageProps) {
  const {locale} = await params;
  const {
    compact,
    error,
    companyId,
    contactId,
    interactionDate,
    interactionTypeValueId,
    invalidFields,
    outcomeStatusValueId,
    subject,
    summary
  } = await searchParams;
  const session = await getCurrentSession();
  const t = await getTranslations("InteractionForm");

  if (!session || !canEditRecords(session.role)) {
    redirect(`/${locale}/access-denied`);
  }

  const options = await getInteractionFormOptions();
  const action = createInteractionAction.bind(null, locale);
  const compactMode = compact === "1";
  const lockedCompany = companyId
    ? options.companies.find((company) => company.id === companyId) ?? null
    : null;
  const lockedContact = contactId
    ? options.contacts.find((contact) => contact.id === contactId) ?? null
    : null;

  return (
    <div className="space-y-6">
      <div
        className={
          compactMode
            ? "rounded-[32px] bg-[linear-gradient(180deg,rgba(255,255,255,0.8),rgba(249,235,231,0.95))] px-5 py-5 shadow-[0_12px_40px_rgba(58,48,45,0.08)] backdrop-blur"
            : "space-y-3"
        }
      >
        <p className="text-xs uppercase tracking-[0.3em] text-coral">
          {compactMode ? t("quickAddTitle") : t("createTitle")}
        </p>
        <h2 className="font-display text-3xl font-semibold tracking-tight text-ink">
          {compactMode ? t("quickAddTitle") : t("createTitle")}
        </h2>
        <p className="max-w-2xl text-sm leading-7 text-slate-600">
          {compactMode ? t("quickAddSubtitle") : t("subtitle")}
        </p>
      </div>
      {error ? (
        <p className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800">{t("error")}</p>
      ) : null}
      <SurfaceCard
        className={
          compactMode
            ? "rounded-[32px] bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(249,235,231,0.92))] p-4 sm:p-5"
            : "rounded-[30px] p-6"
        }
      >
        <InteractionForm
          allowFollowUpAfterCreate
          action={action}
          companies={options.companies}
          compact={compactMode}
          contacts={options.contacts}
          hiddenFields={compactMode ? {compact: "1"} : undefined}
          invalidFields={invalidFields?.split(",").filter(Boolean) ?? []}
          interactionTypeOptions={options.interactionTypeOptions}
          lockedCompany={lockedCompany}
          lockedContact={lockedContact}
          locale={locale}
          mode="create"
          outcomeOptions={options.outcomeOptions}
          values={{
            companyId: companyId ?? "",
            contactId: contactId ?? "",
            interactionDate: interactionDate ?? nowLocalInput(),
            interactionTypeValueId: interactionTypeValueId ?? "",
            outcomeStatusValueId: outcomeStatusValueId ?? "",
            subject: subject ?? "",
            summary: summary ?? ""
          }}
        />
      </SurfaceCard>
      <Link className="inline-flex text-sm font-medium text-slate-700" href="/interactions" locale={locale}>
        {t("back")}
      </Link>
    </div>
  );
}
