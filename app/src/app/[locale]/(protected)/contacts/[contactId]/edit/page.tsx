import {getTranslations} from "next-intl/server";
import {notFound, redirect} from "next/navigation";

import {ContactForm} from "@/components/crm/contact-form";
import {Link} from "@/i18n/navigation";
import {canEditRecords, getCurrentSession} from "@/lib/auth/session";
import {getContactById, getContactFormOptions} from "@/lib/data/crm";

import {updateContactAction} from "../../actions";

type EditContactPageProps = {
  params: Promise<{locale: "en" | "he"; contactId: string}>;
  searchParams: Promise<{error?: string}>;
};

export default async function EditContactPage({params, searchParams}: EditContactPageProps) {
  const {locale, contactId} = await params;
  const {error} = await searchParams;
  const session = await getCurrentSession();
  const t = await getTranslations("ContactForm");

  if (!session || !canEditRecords(session.role)) {
    redirect(`/${locale}/access-denied`);
  }

  const [contact, options] = await Promise.all([getContactById(contactId), getContactFormOptions()]);

  if (!contact) {
    notFound();
  }

  const action = updateContactAction.bind(null, locale);

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
        <ContactForm
          action={action}
          companies={options.companies}
          hiddenFields={{contactId: contact.id}}
          locale={locale}
          mode="edit"
          values={{
            firstName: contact.firstName ?? "",
            lastName: contact.lastName ?? "",
            roleTitle: contact.roleTitle ?? "",
            companyId: contact.companyId ?? "",
            notes: contact.notes ?? "",
            emailsText: contact.emails.map((email) => email.email).join("\n"),
            primaryEmail: contact.emails.find((email) => email.isPrimary)?.email ?? "",
            phonesText: contact.phones.map((phone) => phone.phoneNumber).join("\n"),
            primaryPhone: contact.phones.find((phone) => phone.isPrimary)?.phoneNumber ?? ""
          }}
        />
      </section>
      <Link
        className="inline-flex text-sm font-medium text-slate-700"
        href={`/contacts/${contact.id}`}
        locale={locale}
      >
        {t("back")}
      </Link>
    </div>
  );
}
