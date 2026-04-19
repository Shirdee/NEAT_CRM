import {getTranslations} from "next-intl/server";
import {notFound, redirect} from "next/navigation";

import {CompanyForm} from "@/components/crm/company-form";
import {Link} from "@/i18n/navigation";
import {canEditRecords, getCurrentSession} from "@/lib/auth/session";
import {getCompanyById, getCompanyFormOptions} from "@/lib/data/crm";

import {deleteCompanyAction, updateCompanyAction} from "../../actions";

type EditCompanyPageProps = {
  params: Promise<{locale: "en" | "he"; companyId: string}>;
  searchParams: Promise<{error?: string; blockedBy?: string}>;
};

export default async function EditCompanyPage({params, searchParams}: EditCompanyPageProps) {
  const {locale, companyId} = await params;
  const {error, blockedBy} = await searchParams;
  const session = await getCurrentSession();
  const t = await getTranslations("CompanyForm");
  const tDetail = await getTranslations("CompanyDetail");

  if (!session || !canEditRecords(session.role)) {
    redirect(`/${locale}/access-denied`);
  }

  const [company, options] = await Promise.all([getCompanyById(companyId), getCompanyFormOptions()]);

  if (!company) {
    notFound();
  }

  const action = updateCompanyAction.bind(null, locale);
  const blockedItems = String(blockedBy ?? "")
    .split(",")
    .filter(Boolean)
    .join(", ");

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h2 className="text-3xl font-semibold text-ink">{t("editTitle")}</h2>
        <p className="max-w-2xl text-sm leading-7 text-ink/70">{t("subtitle")}</p>
      </div>
      {error === "validation" ? (
        <p className="rounded-2xl bg-amber/10 px-4 py-3 text-sm text-ink">{t("error")}</p>
      ) : null}
      {error && error !== "validation" ? (
        <p className="rounded-2xl bg-coral/8 px-4 py-3 text-sm text-coral">
          {error === "confirm"
            ? tDetail("deleteConfirmError")
            : error === "blocked"
              ? tDetail("deleteBlocked", {blockedBy: blockedItems || tDetail("deleteBlockedUnknown")})
              : tDetail("deleteError")}
        </p>
      ) : null}
      <section className="rounded-[24px] border border-ink/10 bg-white p-6">
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
      {session.role === "admin" ? (
        <section className="rounded-[24px] border border-coral/20 bg-coral/8 p-4">
          <form action={deleteCompanyAction.bind(null, locale)} className="space-y-3">
            <input name="companyId" type="hidden" value={company.id} />
            <label className="flex items-center gap-2 text-xs text-ink/70">
              <input name="confirm" type="checkbox" value="1" />
              {tDetail("deleteConfirm")}
            </label>
            <button
              className="inline-flex items-center justify-center rounded-full bg-coral px-5 py-3 text-sm font-semibold text-white transition hover:bg-coral/90"
              type="submit"
            >
              {tDetail("delete")}
            </button>
          </form>
        </section>
      ) : null}
      <Link
        className="inline-flex text-sm font-medium text-ink/70"
        href={`/companies/${company.id}`}
        locale={locale}
      >
        {t("back")}
      </Link>
    </div>
  );
}
