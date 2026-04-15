import {getTranslations} from "next-intl/server";
import {redirect} from "next/navigation";

import {CompanyForm} from "@/components/crm/company-form";
import {Link} from "@/i18n/navigation";
import {canEditRecords, getCurrentSession} from "@/lib/auth/session";
import {getCompanyFormOptions} from "@/lib/data/crm";
import {SurfaceCard} from "@/components/ui/surface-card";

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
      <SurfaceCard className="space-y-3 bg-white/95">
        <p className="text-xs uppercase tracking-[0.3em] text-coral">{t("createTitle")}</p>
        <h2 className="text-3xl font-semibold tracking-tight text-ink">{t("createTitle")}</h2>
        <p className="max-w-2xl text-sm leading-7 text-ink/70">{t("subtitle")}</p>
      </SurfaceCard>
      {error ? (
        <p className="rounded-2xl bg-amber/10 px-4 py-3 text-sm text-ink">{t("error")}</p>
      ) : null}
      <SurfaceCard className="bg-white/95 p-5 sm:p-6">
        <CompanyForm
          action={action}
          invalidFields={invalidFields?.split(",").filter(Boolean) ?? []}
          locale={locale}
          mode="create"
          sourceOptions={options.sourceOptions}
          stageOptions={options.stageOptions}
          values={{companyName: companyName ?? "", website: website ?? "", sourceValueId: sourceValueId ?? "", stageValueId: stageValueId ?? "", notes: notes ?? ""}}
        />
      </SurfaceCard>
      <Link className="inline-flex text-sm font-medium text-ink/70" href="/companies" locale={locale}>
        {t("back")}
      </Link>
    </div>
  );
}
