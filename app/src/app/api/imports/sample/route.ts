import {NextResponse} from "next/server";
import * as XLSX from "xlsx";

function buildWorkbookBuffer() {
  const workbook = XLSX.utils.book_new();

  const companies = XLSX.utils.aoa_to_sheet([
    ["Company Name", "Website", "Source", "Company Type", "Stage", "Segment", "Notes"],
    ["Acme Labs", "https://acme.test", "Referral", "Client", "Qualified", "SMB", "Example company row"],
    ["Northwind Group", "northwind.test", "Conference", "Partner", "Prospect", "Enterprise", ""]
  ]);

  const contacts = XLSX.utils.aoa_to_sheet([
    ["Full Name", "Company Name", "Email", "Phone", "Label", "Phone Label", "Role Title", "Notes"],
    ["Dana Founder", "Acme Labs", "dana@acme.test", "+1 555 0100", "Primary", "Work", "CEO", ""],
    ["Yael Cohen", "Northwind Group", "yael@northwind.test", "+972 50 555 0101", "Primary", "Mobile", "Sales Lead", ""]
  ]);

  const interactions = XLSX.utils.aoa_to_sheet([
    ["Interaction Date", "Interaction Type", "Company Name", "Subject", "Outcome Status", "Summary"],
    ["2026-04-04", "Call", "Acme Labs", "Discovery Call", "Open", "Initial discovery conversation"]
  ]);

  const tasks = XLSX.utils.aoa_to_sheet([
    ["Due Date", "Task Type", "Priority", "Status", "Company Name", "Notes"],
    ["2026-04-10", "Follow Up", "High", "Open", "Acme Labs", "Send proposal draft"]
  ]);

  XLSX.utils.book_append_sheet(workbook, companies, "Companies");
  XLSX.utils.book_append_sheet(workbook, contacts, "Contacts");
  XLSX.utils.book_append_sheet(workbook, interactions, "Interactions");
  XLSX.utils.book_append_sheet(workbook, tasks, "Tasks");

  return XLSX.write(workbook, {bookType: "xlsx", type: "buffer"});
}

export async function GET() {
  return new NextResponse(buildWorkbookBuffer(), {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="neat-crm-import-sample.xlsx"'
    }
  });
}
