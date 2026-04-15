import {describe, expect, it} from "vitest";

import {
  profileWorkbookSource,
  validateBatchRows,
  validateStructuredStageableRows,
  validateStructuredWorkbookProfile
} from "./workbook";

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

  it("allows contacts to reference companies created later in the same batch", () => {
    const validation = validateBatchRows({
      rows: [
        {
          sheetName: "Contacts",
          rowNumber: 2,
          headers: ["Full Name", "Company Name", "Email"],
          cells: ["Dana Founder", "Acme", "dana@example.com"]
        },
        {
          sheetName: "Companies",
          rowNumber: 2,
          headers: ["Company Name", "Website"],
          cells: ["Acme", "acme.test"]
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

    expect(validation.issues.some((issue) => issue.issueCode === "orphan_company_reference")).toBe(
      false
    );
    expect(validation.rows.find((row) => row.sourceRowKey === "Contacts:2")?.status).toBe("ready");
  });

  it("requires company plus email or phone plus first and last name for contacts", () => {
    const validation = validateBatchRows({
      rows: [
        {
          sheetName: "Contacts",
          rowNumber: 2,
          headers: ["Full Name", "Company Name"],
          cells: ["Dana", ""]
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

    expect(validation.issues.some((issue) => issue.issueCode === "missing_contact_name_parts")).toBe(
      true
    );
    expect(validation.issues.some((issue) => issue.issueCode === "missing_contact_company")).toBe(
      true
    );
    expect(validation.issues.some((issue) => issue.issueCode === "missing_contact_method")).toBe(
      true
    );
  });

  it("ignores row number columns while importing", () => {
    const validation = validateBatchRows({
      rows: [
        {
          sheetName: "Contacts",
          rowNumber: 2,
          headers: ["Row Number", "First Name", "Last Name", "Company Name", "Email"],
          cells: ["17", "Dana", "Founder", "Acme", "dana@example.com"]
        },
        {
          sheetName: "Companies",
          rowNumber: 2,
          headers: ["Row Number", "Company Name", "Website"],
          cells: ["1", "Acme", "acme.test"]
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

    expect(validation.issues.some((issue) => issue.issueCode === "orphan_company_reference")).toBe(
      false
    );
    expect(validation.rows.find((row) => row.sourceRowKey === "Contacts:2")?.status).toBe("ready");
  });

  it("validates workbook profile shape for structured re-import", () => {
    const valid = validateStructuredWorkbookProfile(
      profileWorkbookSource([
        {
          name: "Companies",
          rows: [
            ["Company Name", "Website"],
            ["Acme", "acme.test"]
          ]
        }
      ])
    );
    const invalid = validateStructuredWorkbookProfile({
      sheetCount: 0,
      totalDataRows: 1,
      sheets: [],
      risks: []
    });

    expect(valid.ok).toBe(true);
    expect(invalid.ok).toBe(false);
  });

  it("validates structured staged row shape before repository staging", () => {
    const valid = validateStructuredStageableRows([
      {
        sheetName: "Companies",
        rowNumber: 2,
        headers: ["Company Name", "Website"],
        cells: ["Acme", "acme.test"]
      }
    ]);
    const invalid = validateStructuredStageableRows([
      {
        sheetName: "Companies",
        rowNumber: 1,
        headers: ["Company Name"],
        cells: ["Acme", "extra-cell"]
      }
    ]);

    expect(valid.ok).toBe(true);
    expect(invalid.ok).toBe(false);
  });
});
