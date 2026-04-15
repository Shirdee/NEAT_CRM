"use client";

import {useRouter} from "next/navigation";
import {useState, useTransition} from "react";
import * as XLSX from "xlsx";

import {profileWorkbookSource} from "@/lib/import/workbook";
import type {WorkbookSheetPayload} from "@/lib/import/types";

type UploadPanelProps = {
  locale: string;
  title: string;
  body: string;
  selectFileLabel: string;
  sampleLabel: string;
  startImportLabel: string;
  stagingLabel: string;
  successLabel: string;
  errorLabel: string;
};

function chunkRows(rows: string[][], size: number) {
  const chunks: string[][][] = [];

  for (let index = 0; index < rows.length; index += size) {
    chunks.push(rows.slice(index, index + size));
  }

  return chunks;
}

export function ImportUploadPanel({
  locale,
  title,
  body,
  selectFileLabel,
  sampleLabel,
  startImportLabel,
  stagingLabel,
  successLabel,
  errorLabel
}: UploadPanelProps) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [statusText, setStatusText] = useState("");
  const [errorText, setErrorText] = useState("");
  const [isPending, startTransition] = useTransition();

  async function readErrorMessage(response: Response, fallbackMessage: string) {
    try {
      const body = (await response.json()) as {error?: string};
      return body.error ?? fallbackMessage;
    } catch {
      return fallbackMessage;
    }
  }

  async function handleImport() {
    if (!file) {
      setErrorText(errorLabel);
      return;
    }

    setErrorText("");
    setStatusText(stagingLabel);

    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, {type: "array", cellDates: false});
    const sheets: WorkbookSheetPayload[] = workbook.SheetNames.map((name) => {
      const sheet = workbook.Sheets[name];
      const rows = XLSX.utils.sheet_to_json(sheet, {
        header: 1,
        blankrows: false,
        raw: false,
        defval: ""
      }) as Array<Array<string | number | boolean | null>>;

      return {
        name,
        rows: rows.map((row) => row.map((cell) => String(cell ?? "")))
      };
    });
    const profile = profileWorkbookSource(sheets);
    const batchResponse = await fetch("/api/imports/batches", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        sourceFilename: file.name,
        profile
      })
    });

    if (!batchResponse.ok) {
      throw new Error(await readErrorMessage(batchResponse, "Failed to create import batch."));
    }

    const batch = (await batchResponse.json()) as {id: string};

    for (const sheet of sheets) {
      const [headerRow = [], ...dataRows] = sheet.rows;
      const headers = headerRow.map((cell) => String(cell ?? "").trim());

      if (headers.length === 0 || dataRows.length === 0) {
        continue;
      }

      const chunks = chunkRows(dataRows, 100);

      for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex += 1) {
        const rows = chunks[chunkIndex].map((cells, rowIndex) => ({
          sheetName: sheet.name,
          rowNumber: chunkIndex * 100 + rowIndex + 2,
          headers,
          cells
        }));
        const stageResponse = await fetch(`/api/imports/batches/${batch.id}/stage`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({rows})
        });

        if (!stageResponse.ok) {
          throw new Error(await readErrorMessage(stageResponse, "Failed while staging workbook rows."));
        }

        setStatusText(`${stagingLabel} ${sheet.name} ${chunkIndex + 1}/${chunks.length}`);
      }
    }

    setStatusText(successLabel);
    router.push(`/${locale}/admin/imports?batch=${batch.id}`);
    router.refresh();
  }

  return (
    <article className="rounded-[28px] bg-white/95 p-5 shadow-[0_12px_40px_rgba(58,48,45,0.08)]">
      <h3 className="text-lg font-semibold text-ink">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-ink/70">{body}</p>
      <div className="mt-5 space-y-3">
        <label className="block rounded-[24px] bg-mist px-4 py-5 text-sm text-ink/70">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <span className="block font-medium text-ink">{selectFileLabel}</span>
            <a
              className="text-xs font-medium text-coral underline underline-offset-4"
              download
              href="/api/imports/sample"
            >
              {sampleLabel}
            </a>
          </div>
          <input
            accept=".xlsx,.xls,.csv"
            className="block w-full text-sm"
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            type="file"
          />
        </label>
        <button
          className="inline-flex rounded-full bg-coral px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-coral/60"
          disabled={isPending || !file}
          onClick={() => {
            startTransition(async () => {
              try {
                await handleImport();
              } catch (error) {
                setStatusText("");
                setErrorText(error instanceof Error ? error.message : errorLabel);
              }
            });
          }}
          type="button"
        >
          {startImportLabel}
        </button>
        {statusText ? <p className="text-sm text-ink/70">{statusText}</p> : null}
        {errorText ? <p className="text-sm text-rose-700">{errorText}</p> : null}
      </div>
    </article>
  );
}
