import {redirect} from "next/navigation";

import {AppShell} from "@/components/shell/app-shell";
import {AppShellBodyLock} from "@/components/shell/app-shell-body-lock";
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
  const session = await getCurrentSession();

  if (!session) {
    return redirect(`/${locale}/login`);
  }

  return (
    <>
      <AppShellBodyLock />
      <AppShell locale={locale === "he" ? "he" : "en"} session={session}>
        {children}
      </AppShell>
    </>
  );
}
