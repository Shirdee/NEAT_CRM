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
        <label className="block text-sm font-medium text-slate-600" htmlFor="email">
          {copy.email}
        </label>
        <input
          className="w-full rounded-[22px] border border-slate-200 bg-slate-50/70 px-4 py-3.5 text-sm text-slate-900 outline-none ring-0 transition placeholder:text-slate-400 focus:border-teal focus:bg-white"
          defaultValue="admin@crm.local"
          id="email"
          name="email"
          type="email"
        />
      </div>
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-600" htmlFor="password">
          {copy.password}
        </label>
        <input
          className="w-full rounded-[22px] border border-slate-200 bg-slate-50/70 px-4 py-3.5 text-sm text-slate-900 outline-none ring-0 transition placeholder:text-slate-400 focus:border-teal focus:bg-white"
          defaultValue="shir"
          id="password"
          name="password"
          type="password"
        />
      </div>
      <button
        className="w-full rounded-full bg-coral px-4 py-3.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-coral/90"
        type="submit"
      >
        {copy.submit}
      </button>
      {error ? (
        <p className="rounded-[22px] border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </p>
      ) : null}
      <p className="text-xs leading-5 text-slate-500">{copy.hint}</p>
    </form>
  );
}
