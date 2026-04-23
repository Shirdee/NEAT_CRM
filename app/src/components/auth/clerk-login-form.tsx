"use client";

import {useState} from "react";

import {useSignIn} from "@clerk/nextjs";
import {isClerkAPIResponseError} from "@clerk/nextjs/errors";

import {useRouter} from "@/i18n/navigation";

type ClerkLoginFormProps = {
  copy: {
    identifier: string;
    identifierPlaceholder: string;
    password: string;
    passwordPlaceholder: string;
    submit: string;
    loading: string;
    hint: string;
  };
  locale: string;
  error?: string | null;
};

export function ClerkLoginForm({copy, locale, error}: ClerkLoginFormProps) {
  const router = useRouter();
  const {signIn} = useSignIn();
  const [pending, setPending] = useState(false);
  const [localError, setLocalError] = useState<string | null>(error ?? null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!signIn) {
      return;
    }

    const formData = new FormData(event.currentTarget);
    const identifier = String(formData.get("identifier") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    if (!identifier || !password) {
      setLocalError("Complete all required fields.");
      return;
    }

    setPending(true);
    setLocalError(null);

    try {
      const attempt = await signIn.password({
        identifier,
        password
      });

      if (attempt.error) {
        setLocalError("Invalid email or password.");
        return;
      }

      if (!signIn.createdSessionId) {
        setLocalError("Unable to complete sign-in.");
        return;
      }

      const finalizeResult = await signIn.finalize();

      if (finalizeResult.error) {
        setLocalError("Unable to complete sign-in.");
        return;
      }

      router.replace(`/${locale === "he" ? "he" : "en"}/dashboard`);
      router.refresh();
    } catch (caughtError) {
      if (isClerkAPIResponseError(caughtError) && caughtError.errors[0]?.longMessage) {
        setLocalError(caughtError.errors[0].longMessage);
      } else {
        setLocalError("Invalid email or password.");
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <label className="block text-sm font-medium text-ink/70" htmlFor="identifier">
          {copy.identifier}
        </label>
        <input
          autoComplete="username"
          className="w-full rounded-[12px] border-0 bg-mist px-4 py-3 text-sm text-ink placeholder:text-ink/30 focus:outline-none focus:ring-2 focus:ring-teal/30"
          id="identifier"
          name="identifier"
          placeholder={copy.identifierPlaceholder}
          type="text"
        />
      </div>
      <div className="space-y-2">
        <label className="block text-sm font-medium text-ink/70" htmlFor="password">
          {copy.password}
        </label>
        <input
          autoComplete="current-password"
          className="w-full rounded-[12px] border-0 bg-mist px-4 py-3 text-sm text-ink placeholder:text-ink/30 focus:outline-none focus:ring-2 focus:ring-teal/30"
          id="password"
          name="password"
          placeholder={copy.passwordPlaceholder}
          type="password"
        />
      </div>
      <button
        className="w-full rounded-full bg-coral px-4 py-3.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-coral/90 focus:outline-none focus:ring-2 focus:ring-coral/40 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
        disabled={!signIn || pending}
        type="submit"
      >
        {pending ? copy.loading : copy.submit}
      </button>
      {localError ? (
        <p className="rounded-[22px] border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {localError}
        </p>
      ) : null}
      <p className="text-xs leading-5 text-ink/55">{copy.hint}</p>
    </form>
  );
}
