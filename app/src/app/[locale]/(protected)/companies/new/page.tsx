import {getTranslations} from "next-intl/server";
import {redirect} from "next/navigation";

import {CompanyForm} from "@/components/crm/company-form";
import {Link} from "@/i18n/navigation";
import {canEditRecords, getCurrentSession} from "@/lib/auth/session";
import {getCompanyFormOptions} from "@/lib/data/crm";

import {createCompanyAction} from "../actions";

type NewCompanyPageProps = {
  params: Promise<{locale: "en" | "he"}>;
  searchParams: Promise<{error?: string; invalidFields?: string; companyName?: string; website?: string; sourceValueId?: string; stageValueId?: string; notes?: string;}>;
};

export default async function NewCompanyPage({params, searchParams}: NewCompanyPageProps) {
  const {locale} = await params;
  const {error, invalidFields, companyName, website, sourceValueId, stageValueId, notes} = await searchParams;
  const session = await getCurrentSession();
  const t = await getTranslations("CompanyForm");

  if (!session || !canEditRecords(session.role)) {
    redirect(`/${locale}/access-denied`);
  }

  const options = await getCompanyFormOptions();
  const action = createCompanyAction.bind(null, locale);

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
        <CompanyForm
          action={action}
          invalidFields={invalidFields?.split(",").filter(Boolean) ?? []}
          locale={locale}
          mode="create"
          sourceOptions={options.sourceOptions}
          stageOptions={options.stageOptions}
          values={{companyName: companyName ?? "", website: website ?? "", sourceValueId: sourceValueId ?? "", stageValueId: stageValueId ?? "", notes: notes ?? ""}}
        />
      </section>
      <Link className="inline-flex text-sm font-medium text-slate-700" href="/companies" locale={locale}>
        {t("back")}
      </Link>
    </div>
  );
}
