import {getTranslations} from "next-intl/server";
import {notFound, redirect} from "next/navigation";

import {InteractionForm} from "@/components/crm/interaction-form";
import {Link} from "@/i18n/navigation";
import {canEditRecords, getCurrentSession} from "@/lib/auth/session";
import {getInteractionById, getInteractionFormOptions} from "@/lib/data/crm";

import {updateInteractionAction} from "../../actions";

type EditInteractionPageProps = {
  params: Promise<{locale: "en" | "he"; interactionId: string}>;
  searchParams: Promise<{
    error?: string;
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

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h2 className="text-3xl font-semibold text-ink">{t("editTitle")}</h2>
        <p className="max-w-2xl text-sm leading-7 text-slate-600">{t("subtitle")}</p>
      </div>
      {error ? (
        <p className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800">{t("error")}</p>
      ) : null}
      <section className="rounded-[24px] border border-slate-200 bg-white p-6">
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
      <Link
        className="inline-flex text-sm font-medium text-slate-700"
        href={`/interactions/${interaction.id}`}
        locale={locale}
      >
        {t("back")}
      </Link>
    </div>
  );
}
