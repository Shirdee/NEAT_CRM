"use client";

import {SignOutButton} from "@clerk/nextjs";

import type {AppLocale} from "@/i18n/routing";

type LogoutControlProps = {
  locale: AppLocale;
  signOutLabel: string;
  buttonClassName: string;
  iconOnly?: boolean;
  children?: React.ReactNode;
};

export function LogoutControl({
  locale,
  signOutLabel,
  buttonClassName,
  children
}: LogoutControlProps) {
  const hasClerkProvider = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

  if (hasClerkProvider) {
    return (
      <SignOutButton redirectUrl={`/${locale}/login`}>
        <button aria-label={signOutLabel} className={buttonClassName} type="button">
          {children ?? signOutLabel}
        </button>
      </SignOutButton>
    );
  }

  return (
    <form action="/api/logout" method="post">
      <button aria-label={signOutLabel} className={buttonClassName} type="submit">
        {children ?? signOutLabel}
      </button>
    </form>
  );
}
