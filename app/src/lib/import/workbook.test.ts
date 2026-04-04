import {describe, expect, it} from "vitest";

import {profileWorkbookSource, validateBatchRows} from "./workbook";

describe("workbook import helpers", () => {
  it("profiles workbook sheets and flags mixed-language or multi-value risks", () => {
    const profile = profileWorkbookSource([
      {
        name: "Companies",
        rows: [
          ["Company Name", "Website", "Notes"],
          ["Acme", "acme.test", "English"],
          ["שלום Corp", "shalom.test", "עברית / English"],
          ["Orbit", "orbit.test", "a,b"]
        ]
      }
    ]);

    expect(profile.sheetCount).toBe(1);
    expect(profile.totalDataRows).toBe(3);
    expect(profile.sheets[0]?.guessedEntityType).toBe("company");
    expect(profile.risks.length).toBeGreaterThan(0);
  });

  it("flags duplicate company rows and orphan contact references", () => {
    const validation = validateBatchRows({
      rows: [
        {
          sheetName: "Companies",
          rowNumber: 2,
          headers: ["Company Name", "Website"],
          cells: ["Acme", "acme.test"]
        },
        {
          sheetName: "Companies",
          rowNumber: 3,
          headers: ["Company Name", "Website"],
          cells: ["Acme", "acme.test"]
        },
        {
          sheetName: "Contacts",
          rowNumber: 2,
          headers: ["Full Name", "Company Name", "Email"],
          cells: ["Dana Founder", "Missing Co", "dana@example.com"]
        }
      ],
      lookups: {},
      existing: {
        companyNames: new Set<string>(),
        websiteDomains: new Set<string>(),
        contactFingerprints: new Set<string>(),
        emails: new Set<string>(),
        phones: new Set<string>()
      }
    });

    expect(validation.issues.some((issue) => issue.issueCode === "duplicate_candidate")).toBe(true);
    expect(validation.issues.some((issue) => issue.issueCode === "orphan_company_reference")).toBe(
      true
    );
    expect(validation.rows.find((row) => row.sourceRowKey === "Contacts:2")?.status).toBe("flagged");
  });
});
