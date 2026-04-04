type LoginFormProps = {
  action: (formData: FormData) => Promise<void>;
  copy: {
    email: string;
    password: string;
    submit: string;
    hint: string;
  };
  locale: string;
  error?: string | null;
};

export function LoginForm({action, copy, locale, error}: LoginFormProps) {
  return (
    <form action={action} className="space-y-5">
      <input name="locale" type="hidden" value={locale} />
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700" htmlFor="email">
          {copy.email}
        </label>
        <input
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none ring-0 transition focus:border-teal focus:shadow-soft"
          defaultValue="admin@crm.local"
          id="email"
          name="email"
          type="email"
        />
      </div>
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700" htmlFor="password">
          {copy.password}
        </label>
        <input
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none ring-0 transition focus:border-teal focus:shadow-soft"
          defaultValue="shir"
          id="password"
          name="password"
          type="password"
        />
      </div>
      <button
        className="w-full rounded-2xl bg-ink px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-900"
        type="submit"
      >
        {copy.submit}
      </button>
      {error ? (
        <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>
      ) : null}
      <p className="text-xs leading-5 text-slate-500">{copy.hint}</p>
    </form>
  );
}
