import {getTranslations} from "next-intl/server";
import {redirect} from "next/navigation";

import {AppShell} from "@/components/shell/app-shell";
import {getCurrentSession} from "@/lib/auth/session";

type ProtectedLayoutProps = {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
};

export default async function ProtectedLayout({
  children,
  params
}: ProtectedLayoutProps) {
  const {locale} = await params;
  const t = await getTranslations("AccessDenied");
  const session = await getCurrentSession();

  if (!session) {
    return redirect(`/${locale}/login`);
  }

  return (
    <AppShell session={session}>
      <section className="rounded-[28px] bg-white p-6 shadow-soft">
        <p className="text-xs uppercase tracking-[0.3em] text-coral">{t("eyebrow")}</p>
        {children}
      </section>
    </AppShell>
  );
}
