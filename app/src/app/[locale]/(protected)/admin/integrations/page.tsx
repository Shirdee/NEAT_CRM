import {redirect} from "next/navigation";

import {Link} from "@/i18n/navigation";
import {canManageAdminLists, getCurrentSession} from "@/lib/auth/session";
import {
  listDisabledIntegrationProviders,
  listEnabledIntegrationProviders,
  listIntegrationProviders
} from "@/lib/integrations";

type AdminIntegrationsPageProps = {
  params: Promise<{locale: string}>;
};

export default async function AdminIntegrationsPage({params}: AdminIntegrationsPageProps) {
  const {locale} = await params;
  const session = await getCurrentSession();

  if (!session || !canManageAdminLists(session.role)) {
    redirect(`/${locale}/access-denied`);
  }

  const providers = listIntegrationProviders();
  const enabledProviders = listEnabledIntegrationProviders();
  const disabledProviders = listDisabledIntegrationProviders();

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <p className="text-xs uppercase tracking-[0.3em] text-coral">Admin audit</p>
        <h2 className="font-display text-3xl font-semibold tracking-tight text-ink">
          Integration boundary
        </h2>
        <p className="max-w-3xl text-sm leading-7 text-slate-600">
          Read-only registry. No live sync, no writes, no provider-specific workflow here.
        </p>
      </div>

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-[24px] border border-slate-200 bg-white p-5">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Providers</p>
          <p className="mt-3 text-3xl font-semibold text-ink">{providers.length}</p>
        </div>
        <div className="rounded-[24px] border border-slate-200 bg-white p-5">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Enabled</p>
          <p className="mt-3 text-3xl font-semibold text-ink">{enabledProviders.length}</p>
        </div>
        <div className="rounded-[24px] border border-slate-200 bg-white p-5">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Disabled</p>
          <p className="mt-3 text-3xl font-semibold text-ink">{disabledProviders.length}</p>
        </div>
      </section>

      <section className="space-y-4">
        {providers.map((provider) => (
          <article className="rounded-[24px] border border-slate-200 bg-white p-5" key={provider.id}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">{provider.id}</p>
                <h3 className="mt-1 text-lg font-semibold text-ink">{provider.label}</h3>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  provider.enabled ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-700"
                }`}
              >
                {provider.enabled ? "enabled" : "disabled"}
              </span>
            </div>
            <div className="mt-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Capabilities</p>
              <p className="mt-2 text-sm text-slate-600">
                {provider.capabilities.length > 0 ? provider.capabilities.join(", ") : "none"}
              </p>
            </div>
          </article>
        ))}
      </section>

      <div className="flex flex-wrap gap-3">
        <Link
          className="inline-flex rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700"
          href="/admin/lists"
          locale={locale}
        >
          Back to admin
        </Link>
        <Link
          className="inline-flex rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700"
          href="/dashboard"
          locale={locale}
        >
          Dashboard
        </Link>
      </div>
    </div>
  );
}
