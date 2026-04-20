"use client";

import {useMemo, useState} from "react";

import {Link} from "@/i18n/navigation";

type CompanyRow = {
  id: string;
  companyName: string;
  website: string | null;
  stageLabelEn: string | null;
  stageLabelHe: string | null;
  sourceLabelEn: string | null;
  sourceLabelHe: string | null;
  contactsCount: number;
};

type Props = {
  companies: CompanyRow[];
  locale: "en" | "he";
  labels: {
    company: string;
    website: string;
    stage: string;
    source: string;
    contacts: string;
    open: string;
    edit: string;
    export: string;
    copyLink: string;
    empty: string;
  };
};

function displayLabel(locale: "en" | "he", values: {en?: string | null; he?: string | null}) {
  return locale === "he" ? values.he || values.en || "—" : values.en || values.he || "—";
}

export function CompanyTable({companies, locale, labels}: Props) {
  const [menu, setMenu] = useState<{id: string; x: number; y: number} | null>(null);

  const exportHref = useMemo(() => {
    const escape = (value: string) => `"${value.replaceAll('"', '""')}"`;
    const rows = companies.map((company) =>
      [company.companyName, company.website ?? "", String(company.contactsCount)].map(escape).join(",")
    );
    return `data:text/csv;charset=utf-8,${encodeURIComponent(["company,website,contacts", ...rows].join("\n"))}`;
  }, [companies]);

  const closeMenu = () => setMenu(null);

  return (
    <div className="relative">
      <div className="flex justify-end border-b border-ink/5 bg-sand/30 px-4 py-3 sm:px-5">
        <a
          className="inline-flex items-center justify-center rounded-full bg-ink px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-ink/95"
          href={exportHref}
          download="companies.csv"
        >
          {labels.export}
        </a>
      </div>
      <table className="w-full border-separate border-spacing-0">
        <thead>
          <tr className="bg-mist">
            <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.07em] text-ink/50">
              {labels.company}
            </th>
            <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.07em] text-ink/50">
              {labels.website}
            </th>
            <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.07em] text-ink/50">
              {labels.stage}
            </th>
            <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.07em] text-ink/50">
              {labels.source}
            </th>
            <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.07em] text-ink/50">
              {labels.contacts}
            </th>
            <th className="px-5 py-3" />
          </tr>
        </thead>
        <tbody>
          {companies.map((company) => (
            <tr
              className="group transition-colors hover:bg-sand/70 [&:not(:last-child)]:shadow-[inset_0_-1px_0_rgba(16,36,63,0.04)]"
              key={company.id}
              onContextMenu={(event) => {
                event.preventDefault();
                setMenu({id: company.id, x: event.clientX, y: event.clientY});
              }}
            >
              <td className="px-5 py-0 align-middle">
                <Link
                  className="flex min-h-[52px] items-center gap-2.5 py-3 text-[13.5px] font-semibold text-ink transition group-hover:text-coral"
                  href={`/companies/${company.id}`}
                  locale={locale}
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal/12 font-display text-[13px] font-bold text-teal">
                    {company.companyName[0]?.toUpperCase() || "C"}
                  </span>
                  <span className="truncate">{company.companyName}</span>
                </Link>
              </td>
              <td className="px-5 py-0 align-middle text-sm text-ink/60">
                <div className="min-h-[52px] py-3">{company.website || "—"}</div>
              </td>
              <td className="px-5 py-0 align-middle text-sm text-ink/60">
                <div className="min-h-[52px] py-3">
                  {displayLabel(locale, {en: company.stageLabelEn, he: company.stageLabelHe})}
                </div>
              </td>
              <td className="px-5 py-0 align-middle text-sm text-ink/60">
                <div className="min-h-[52px] py-3">
                  {displayLabel(locale, {en: company.sourceLabelEn, he: company.sourceLabelHe})}
                </div>
              </td>
              <td className="px-5 py-0 align-middle text-sm text-ink/60">
                <div className="min-h-[52px] py-3 font-medium text-ink">{company.contactsCount}</div>
              </td>
              <td className="px-5 py-0 align-middle">
                <button
                  className="rounded-full px-3 py-2 text-[13px] font-medium text-ink/60 transition hover:bg-sand hover:text-ink"
                  type="button"
                  onClick={(event) => {
                    const rect = (event.currentTarget as HTMLButtonElement).getBoundingClientRect();
                    setMenu({id: company.id, x: rect.left, y: rect.bottom + 4});
                  }}
                >
                  ⋯
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {menu ? (
        <div
          className="fixed inset-0 z-30"
          onClick={closeMenu}
          onContextMenu={(event) => {
            event.preventDefault();
            closeMenu();
          }}
        >
          <div
            className="absolute w-56 rounded-[14px] border border-ink/10 bg-white p-2 shadow-card"
            style={{left: menu.x, top: menu.y}}
            onClick={(event) => event.stopPropagation()}
          >
            <Link
              className="block rounded-[10px] px-3 py-2 text-[13px] text-ink/70 transition hover:bg-sand"
              href={`/companies/${menu.id}`}
              locale={locale}
              onClick={closeMenu}
            >
              {labels.open}
            </Link>
            <Link
              className="block rounded-[10px] px-3 py-2 text-[13px] text-ink/70 transition hover:bg-sand"
              href={`/companies/${menu.id}/edit`}
              locale={locale}
              onClick={closeMenu}
            >
              {labels.edit}
            </Link>
            <button
              className="block w-full rounded-[10px] px-3 py-2 text-left text-[13px] text-ink/70 transition hover:bg-sand"
              type="button"
              onClick={async () => {
                const url = `${window.location.origin}/${locale}/companies/${menu.id}`;
                try {
                  await navigator.clipboard.writeText(url);
                } finally {
                  closeMenu();
                }
              }}
            >
              {labels.copyLink}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
