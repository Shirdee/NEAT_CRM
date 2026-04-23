import {redirect} from "next/navigation";

import {AppShell} from "@/components/shell/app-shell";
import {AppShellBodyLock} from "@/components/shell/app-shell-body-lock";
import {getCurrentSession, hasClerkAuth} from "@/lib/auth/session";

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
    // Clerk mode: authenticated with Clerk but no DB record → access denied (not login loop)
    return redirect(`/${locale}/${hasClerkAuth() ? "access-denied" : "login"}`);
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
