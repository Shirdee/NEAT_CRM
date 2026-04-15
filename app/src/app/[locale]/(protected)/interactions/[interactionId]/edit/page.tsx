import {getTranslations} from "next-intl/server";
import {notFound, redirect} from "next/navigation";

import {InteractionForm} from "@/components/crm/interaction-form";
import {Link} from "@/i18n/navigation";
import {canEditRecords, getCurrentSession} from "@/lib/auth/session";
import {getInteractionById, getInteractionFormOptions} from "@/lib/data/crm";

import {deleteInteractionAction, updateInteractionAction} from "../../actions";

type EditInteractionPageProps = {
  params: Promise<{locale: "en" | "he"; interactionId: string}>;
  searchParams: Promise<{
    error?: string;
    blockedBy?: string;
    interactionDate?: string;
    interactionTypeValueId?: string;
    outcomeStatusValueId?: string;
    companyId?: string;
    contactId?: string;
    subject?: string;
    summary?: string;
  }>;
};

function toInputDateTime(value: Date | string) {
  return new Date(value).toISOString().slice(0, 16);
}

export default async function EditInteractionPage({params, searchParams}: EditInteractionPageProps) {
  const {locale, interactionId} = await params;
  const {
    error,
    blockedBy,
    interactionDate,
    interactionTypeValueId,
    outcomeStatusValueId,
    companyId,
    contactId,
    subject,
    summary
  } = await searchParams;
  const session = await getCurrentSession();
  const t = await getTranslations("InteractionForm");
  const tDetail = await getTranslations("InteractionDetail");

  if (!session || !canEditRecords(session.role)) {
    redirect(`/${locale}/access-denied`);
  }

  const [interaction, options] = await Promise.all([
    getInteractionById(interactionId),
    getInteractionFormOptions()
  ]);

  if (!interaction) {
    notFound();
  }

  const action = updateInteractionAction.bind(null, locale);
  const blockedItems = String(blockedBy ?? "")
    .split(",")
    .filter(Boolean)
    .join(", ");

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h2 className="text-3xl font-semibold text-ink">{t("editTitle")}</h2>
        <p className="max-w-2xl text-sm leading-7 text-ink/60">{t("subtitle")}</p>
      </div>
      {error === "validation" ? (
        <p className="rounded-2xl bg-amber/10 px-4 py-3 text-sm text-ink">{t("error")}</p>
      ) : null}
      {error && error !== "validation" ? (
        <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {error === "confirm"
            ? tDetail("deleteConfirmError")
            : error === "blocked"
              ? tDetail("deleteBlocked", {blockedBy: blockedItems || tDetail("deleteBlockedUnknown")})
              : tDetail("deleteError")}
        </p>
      ) : null}
      <section className="rounded-[24px] border border-ink/8 bg-white p-6">
        <InteractionForm
          action={action}
          companies={options.companies}
          contacts={options.contacts}
          hiddenFields={{interactionId: interaction.id}}
          interactionTypeOptions={options.interactionTypeOptions}
          locale={locale}
          mode="edit"
          outcomeOptions={options.outcomeOptions}
          values={{
            interactionDate: interactionDate ?? toInputDateTime(interaction.interactionDate),
            companyId: companyId ?? interaction.companyId ?? "",
            contactId: contactId ?? interaction.contactId ?? "",
            interactionTypeValueId: interactionTypeValueId ?? interaction.interactionTypeValueId,
            subject: subject ?? interaction.subject,
            summary: summary ?? interaction.summary,
            outcomeStatusValueId: outcomeStatusValueId ?? interaction.outcomeStatusValueId ?? ""
          }}
        />
      </section>
      <section className="rounded-[24px] border border-rose-200 bg-rose-50/70 p-4">
        <form action={deleteInteractionAction.bind(null, locale)} className="space-y-3">
          <input name="interactionId" type="hidden" value={interaction.id} />
          <label className="flex items-center gap-2 text-xs text-ink/60">
            <input name="confirm" type="checkbox" value="1" />
            {tDetail("deleteConfirm")}
          </label>
          <button
            className="inline-flex items-center justify-center rounded-full bg-rose-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose-800"
            type="submit"
          >
            {tDetail("delete")}
          </button>
        </form>
      </section>
      <Link
        className="inline-flex text-sm font-medium text-ink/70"
        href={`/interactions/${interaction.id}`}
        locale={locale}
      >
        {t("back")}
      </Link>
    </div>
  );
}
