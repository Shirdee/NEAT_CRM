import {getTranslations} from "next-intl/server";
import {redirect} from "next/navigation";

import {Link} from "@/i18n/navigation";
import {canManageAdminLists, getCurrentSession} from "@/lib/auth/session";
import {getCompanyFormOptions, listCompanies} from "@/lib/data/crm";
import {SurfaceCard} from "@/components/ui/surface-card";
import {BatchEditCompaniesClient} from "@/components/admin/batch-edit-companies-client";

type PageProps = {
  params: Promise<{locale: "en" | "he"}>;
};

export default async function BatchEditCompaniesPage({params}: PageProps) {
  const {locale} = await params;
  const t = await getTranslations("AdminBatch");
  const session = await getCurrentSession();

  if (!session || !canManageAdminLists(session.role)) {
    redirect(`/${locale}/access-denied`);
  }

  const [{sourceOptions, stageOptions}, companies] = await Promise.all([
    getCompanyFormOptions(),
    listCompanies()
  ]);

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h2 className="text-3xl font-semibold text-ink">{t("companiesTitle")}</h2>
        <p className="max-w-2xl text-sm leading-7 text-slate-600">{t("companiesSubtitle")}</p>
      </div>
      <SurfaceCard>
        <BatchEditCompaniesClient
          companies={companies.map((company) => ({
            id: company.id,
            companyName: company.companyName,
            sourceValueId: company.sourceValueId ?? null,
            stageValueId: company.stageValueId ?? null
          }))}
          locale={locale}
          sourceOptions={sourceOptions.map((option) => ({
            id: option.id,
            label: locale === "he" ? option.labelHe : option.labelEn
          }))}
          stageOptions={stageOptions.map((option) => ({
            id: option.id,
            label: locale === "he" ? option.labelHe : option.labelEn
          }))}
        />
      </SurfaceCard>
      <div className="flex flex-wrap gap-3">
        <Link
          className="inline-flex rounded-full bg-[rgba(244,229,225,0.9)] px-4 py-2 text-sm font-medium text-slate-700"
          href="/admin/lists"
          locale={locale}
        >
          {t("backToAdmin")}
        </Link>
        <Link
          className="inline-flex rounded-full bg-[rgba(244,229,225,0.9)] px-4 py-2 text-sm font-medium text-slate-700"
          href="/companies"
          locale={locale}
        >
          {t("backToCompanies")}
        </Link>
      </div>
    </div>
  );
}

