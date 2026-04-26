"use client";

import {useClerk} from "@clerk/nextjs";

type ClerkLoginActionsProps = {
  signInLabel: string;
  signUpLabel: string;
};

export function ClerkLoginActions({signInLabel, signUpLabel}: ClerkLoginActionsProps) {
  const clerk = useClerk();

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <button
        className="w-full rounded-full bg-coral px-4 py-3.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-coral/90 focus:outline-none focus:ring-2 focus:ring-coral/40 focus:ring-offset-2"
        onClick={() => clerk.redirectToSignIn()}
        type="button"
      >
        {signInLabel}
      </button>
      <button
        className="w-full rounded-full border border-ink/10 bg-white px-4 py-3.5 text-sm font-semibold text-ink transition hover:-translate-y-0.5 hover:bg-mist focus:outline-none focus:ring-2 focus:ring-ink/10 focus:ring-offset-2"
        onClick={() => clerk.redirectToSignUp()}
        type="button"
      >
        {signUpLabel}
      </button>
    </div>
  );
}
