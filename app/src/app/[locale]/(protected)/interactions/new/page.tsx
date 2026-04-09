import {getTranslations} from "next-intl/server";
import {redirect} from "next/navigation";

import {InteractionForm} from "@/components/crm/interaction-form";
import {Link} from "@/i18n/navigation";
import {canEditRecords, getCurrentSession} from "@/lib/auth/session";
import {getInteractionFormOptions} from "@/lib/data/crm";

import {createInteractionAction} from "../actions";

type NewInteractionPageProps = {
  params: Promise<{locale: "en" | "he"}>;
  searchParams: Promise<{error?: string; companyId?: string; contactId?: string}>;
};

function nowLocalInput() {
  const date = new Date();
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

export default async function NewInteractionPage({params, searchParams}: NewInteractionPageProps) {
  const {locale} = await params;
  const {error, companyId, contactId} = await searchParams;
  const session = await getCurrentSession();
  const t = await getTranslations("InteractionForm");

  if (!session || !canEditRecords(session.role)) {
    redirect(`/${locale}/access-denied`);
  }

  const options = await getInteractionFormOptions();
  const action = createInteractionAction.bind(null, locale);

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h2 className="text-3xl font-semibold text-ink">{t("createTitle")}</h2>
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
          interactionTypeOptions={options.interactionTypeOptions}
          locale={locale}
          mode="create"
          outcomeOptions={options.outcomeOptions}
          values={{
            companyId: companyId ?? "",
            contactId: contactId ?? "",
            interactionDate: nowLocalInput()
          }}
        />
      </section>
      <Link className="inline-flex text-sm font-medium text-slate-700" href="/interactions" locale={locale}>
        {t("back")}
      </Link>
    </div>
  );
}
