import fs from "node:fs/promises";

import * as XLSX from "xlsx";

import {createStageableRows, profileWorkbookSource} from "./workbook";
import {commitImportBatch, createImportBatch, stageImportRows} from "./repository";

async function main() {
  const [filePath, uploadedById = "user_admin"] = process.argv.slice(2);

  if (!filePath) {
    throw new Error("Usage: npm run import:local -- /absolute/path/to/workbook.xlsx [userId]");
  }

  const file = await fs.readFile(filePath);
  const workbook = XLSX.read(file, {type: "buffer", cellDates: false});
  const sheets = workbook.SheetNames.map((name) => {
    const rows = XLSX.utils.sheet_to_json(workbook.Sheets[name], {
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
  const batch = await createImportBatch({
    uploadedById,
    sourceFilename: filePath.split("/").pop() ?? "local-workbook",
    profile
  });

  for (const sheet of sheets) {
    const [headerRow = [], ...dataRows] = sheet.rows;
    const rows = createStageableRows(
      sheet.name,
      headerRow.map((cell) => String(cell ?? "").trim()),
      dataRows
    );

    if (rows.length > 0) {
      await stageImportRows({
        batchId: batch.id,
        rows
      });
    }
  }

  const result = await commitImportBatch({
    batchId: batch.id,
    userId: uploadedById,
    allowWarnings: true
  });

  console.log(JSON.stringify({batchId: batch.id, result}, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
