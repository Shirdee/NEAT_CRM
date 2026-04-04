"use client";

import {useLocale, useTranslations} from "next-intl";

import {Link, usePathname} from "@/i18n/navigation";
import {routing} from "@/i18n/routing";

export function LocaleSwitcher() {
  const t = useTranslations("LocaleSwitcher");
  const locale = useLocale();
  const pathname = usePathname();

  return (
    <div className="inline-flex rounded-full border border-white/20 bg-white/10 p-1 text-xs font-medium text-white">
      {routing.locales.map((targetLocale) => {
        const active = targetLocale === locale;

        return (
          <Link
            className={`rounded-full px-3 py-1.5 transition ${
              active ? "bg-white text-ink" : "text-white/80 hover:text-white"
            }`}
            href={pathname}
            key={targetLocale}
            locale={targetLocale}
          >
            {t(targetLocale)}
          </Link>
        );
      })}
    </div>
  );
}
