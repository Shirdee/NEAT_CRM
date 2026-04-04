import {getTranslations} from "next-intl/server";
import {redirect} from "next/navigation";

import {ContactForm} from "@/components/crm/contact-form";
import {Link} from "@/i18n/navigation";
import {canEditRecords, getCurrentSession} from "@/lib/auth/session";
import {getContactFormOptions} from "@/lib/data/crm";

import {createContactAction} from "../actions";

type NewContactPageProps = {
  params: Promise<{locale: "en" | "he"}>;
  searchParams: Promise<{error?: string; companyId?: string}>;
};

export default async function NewContactPage({params, searchParams}: NewContactPageProps) {
  const {locale} = await params;
  const {error, companyId} = await searchParams;
  const session = await getCurrentSession();
  const t = await getTranslations("ContactForm");

  if (!session || !canEditRecords(session.role)) {
    redirect(`/${locale}/access-denied`);
  }

  const {companies} = await getContactFormOptions();
  const action = createContactAction.bind(null, locale);

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
        <ContactForm
          action={action}
          companies={companies}
          locale={locale}
          mode="create"
          values={{companyId: companyId ?? ""}}
        />
      </section>
      <Link className="inline-flex text-sm font-medium text-slate-700" href="/contacts" locale={locale}>
        {t("back")}
      </Link>
    </div>
  );
}
