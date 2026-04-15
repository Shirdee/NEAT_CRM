import {getTranslations} from "next-intl/server";
import {redirect} from "next/navigation";

import {ContactForm} from "@/components/crm/contact-form";
import {Link} from "@/i18n/navigation";
import {canEditRecords, getCurrentSession} from "@/lib/auth/session";
import {getContactFormOptions} from "@/lib/data/crm";
import {SurfaceCard} from "@/components/ui/surface-card";

import {createContactAction} from "../actions";

type NewContactPageProps = {
  params: Promise<{locale: "en" | "he"}>;
  searchParams: Promise<{error?: string; invalidFields?: string; companyId?: string; firstName?: string; lastName?: string; roleTitle?: string; notes?: string; emailsText?: string; primaryEmail?: string; phonesText?: string; primaryPhone?: string;}>;
};

export default async function NewContactPage({params, searchParams}: NewContactPageProps) {
  const {locale} = await params;
  const {error, invalidFields, companyId, firstName, lastName, roleTitle, notes, emailsText, primaryEmail, phonesText, primaryPhone} = await searchParams;
  const session = await getCurrentSession();
  const t = await getTranslations("ContactForm");

  if (!session || !canEditRecords(session.role)) {
    redirect(`/${locale}/access-denied`);
  }

  const {companies} = await getContactFormOptions();
  const action = createContactAction.bind(null, locale);

  return (
    <div className="space-y-6">
      <SurfaceCard className="space-y-3 bg-white/95">
        <p className="text-xs uppercase tracking-[0.3em] text-coral">{t("createTitle")}</p>
        <h2 className="text-3xl font-semibold tracking-tight text-ink">{t("createTitle")}</h2>
        <p className="max-w-2xl text-sm leading-7 text-ink/70">{t("subtitle")}</p>
      </SurfaceCard>
      {error ? (
        <p className="rounded-2xl bg-amber/10 px-4 py-3 text-sm text-ink">{t("error")}</p>
      ) : null}
      <SurfaceCard className="bg-white/95 p-5 sm:p-6">
        <ContactForm
          action={action}
          companies={companies}
          invalidFields={invalidFields?.split(",").filter(Boolean) ?? []}
          locale={locale}
          mode="create"
          values={{companyId: companyId ?? "", firstName: firstName ?? "", lastName: lastName ?? "", roleTitle: roleTitle ?? "", notes: notes ?? "", emailsText: emailsText ?? "", primaryEmail: primaryEmail ?? "", phonesText: phonesText ?? "", primaryPhone: primaryPhone ?? ""}}
        />
      </SurfaceCard>
      <Link className="inline-flex text-sm font-medium text-ink/70" href="/contacts" locale={locale}>
        {t("back")}
      </Link>
    </div>
  );
}
