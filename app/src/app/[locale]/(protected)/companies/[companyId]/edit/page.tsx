import {getTranslations} from "next-intl/server";
import {notFound, redirect} from "next/navigation";

import {CompanyForm} from "@/components/crm/company-form";
import {Link} from "@/i18n/navigation";
import {canEditRecords, getCurrentSession} from "@/lib/auth/session";
import {getCompanyById, getCompanyFormOptions} from "@/lib/data/crm";

import {updateCompanyAction} from "../../actions";

type EditCompanyPageProps = {
  params: Promise<{locale: "en" | "he"; companyId: string}>;
  searchParams: Promise<{error?: string}>;
};

export default async function EditCompanyPage({params, searchParams}: EditCompanyPageProps) {
  const {locale, companyId} = await params;
  const {error} = await searchParams;
  const session = await getCurrentSession();
  const t = await getTranslations("CompanyForm");

  if (!session || !canEditRecords(session.role)) {
    redirect(`/${locale}/access-denied`);
  }

  const [company, options] = await Promise.all([getCompanyById(companyId), getCompanyFormOptions()]);

  if (!company) {
    notFound();
  }

  const action = updateCompanyAction.bind(null, locale);

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
        <CompanyForm
          action={action}
          hiddenFields={{companyId: company.id}}
          locale={locale}
          mode="edit"
          sourceOptions={options.sourceOptions}
          stageOptions={options.stageOptions}
          values={{
            companyName: company.companyName,
            website: company.website ?? "",
            sourceValueId: company.sourceValueId ?? "",
            stageValueId: company.stageValueId ?? "",
            notes: company.notes ?? ""
          }}
        />
      </section>
      <Link
        className="inline-flex text-sm font-medium text-slate-700"
        href={`/companies/${company.id}`}
        locale={locale}
      >
        {t("back")}
      </Link>
    </div>
  );
}
