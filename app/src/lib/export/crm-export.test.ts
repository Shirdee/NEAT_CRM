import {describe, expect, it} from "vitest";
import * as XLSX from "xlsx";

import {
  buildCrmExportCsvBuffer,
  buildCrmExportXlsxBuffer,
  buildCrmExportHref,
  escapeSpreadsheetFormula
} from "./crm-export";

describe("crm export helpers", () => {
  it("builds CSV with a UTF-8 BOM", () => {
    const buffer = buildCrmExportCsvBuffer([
      ["Company", "Website"],
      ["Acme", "https://acme.test"]
    ]);

    expect(buffer.slice(0, 3).toString("utf8")).toBe("\ufeff");
    expect(buffer.toString("utf8")).toContain("Company,Website");
  });

  it("builds a real xlsx workbook", () => {
    const buffer = buildCrmExportXlsxBuffer("Companies", [
      ["Company", "Website"],
      ["Acme", "https://acme.test"]
    ]);

    const workbook = XLSX.read(buffer, {type: "buffer"});
    const sheet = workbook.Sheets[workbook.SheetNames[0]];

    expect(workbook.SheetNames[0]).toBe("Companies");
    expect(XLSX.utils.sheet_to_json(sheet, {header: 1})).toEqual([
      ["Company", "Website"],
      ["Acme", "https://acme.test"]
    ]);
  });

  it("builds export hrefs from filters and selected ids", () => {
    expect(
      buildCrmExportHref({
        module: "contacts",
        format: "csv",
        locale: "he",
        filters: {q: "דן", companyId: "cmp_1"},
        selectedIds: ["c_1", "c_2"]
      })
    ).toBe("/api/exports?module=contacts&format=csv&locale=he&q=%D7%93%D7%9F&companyId=cmp_1&selectedIds=c_1&selectedIds=c_2");
  });

  it("neutralizes spreadsheet formulas in exported user text", async () => {
    expect(escapeSpreadsheetFormula("=HYPERLINK(\"https://example.test\")")).toBe(
      "'=HYPERLINK(\"https://example.test\")"
    );
    expect(escapeSpreadsheetFormula("+972555555")).toBe("'+972555555");
    expect(escapeSpreadsheetFormula("Normal company")).toBe("Normal company");
  });
});
