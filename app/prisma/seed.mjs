import {createHash} from "node:crypto";

import {PrismaClient} from "@prisma/client";

const prisma = new PrismaClient();

function hashPassword(password) {
  return createHash("sha256").update(`crm-sprint-1:${password}`).digest("hex");
}

const users = [
  {
    id: "user_admin",
    email: "shirdn@neat-tech.com",
    fullName: "Top Admin",
    role: "admin",
    languagePreference: "en",
    isActive: true,
    passwordHash: hashPassword("shir1994")
  },
  {
    id: "user_editor",
    email: "editor@crm.local",
    fullName: "Sprint Editor",
    role: "editor",
    languagePreference: "en",
    isActive: true,
    passwordHash: hashPassword("editor-review")
  },
  {
    id: "user_viewer",
    email: "viewer@crm.local",
    fullName: "Sprint Viewer",
    role: "viewer",
    languagePreference: "he",
    isActive: true,
    passwordHash: hashPassword("viewer-review")
  }
];

const categories = [
  {
    id: "cat_lead_source",
    key: "lead_source",
    name: "Lead Sources",
    values: [
      {key: "referral", labelEn: "Referral", labelHe: "הפניה", sortOrder: 1},
      {key: "website", labelEn: "Website", labelHe: "אתר", sortOrder: 2}
    ]
  },
  {
    id: "cat_interaction_type",
    key: "interaction_type",
    name: "Interaction Types",
    values: [
      {key: "call", labelEn: "Phone call", labelHe: "שיחת טלפון", sortOrder: 1},
      {key: "meeting", labelEn: "Meeting", labelHe: "פגישה", sortOrder: 2},
      {key: "email", labelEn: "Email", labelHe: "אימייל", sortOrder: 3}
    ]
  },
  {
    id: "cat_opportunity_stage",
    key: "opportunity_stage",
    name: "Opportunity Stages",
    values: [
      {key: "qualified", labelEn: "Qualified", labelHe: "מאומת", sortOrder: 1},
      {key: "proposal", labelEn: "Proposal", labelHe: "הצעה", sortOrder: 2}
    ]
  },
  {
    id: "cat_opportunity_type",
    key: "opportunity_type",
    name: "Opportunity Types",
    values: [
      {key: "new_business", labelEn: "New Business", labelHe: "עסקה חדשה", sortOrder: 1},
      {key: "expansion", labelEn: "Expansion", labelHe: "הרחבה", sortOrder: 2}
    ]
  },
  {
    id: "cat_opportunity_status",
    key: "opportunity_status",
    name: "Opportunity Statuses",
    values: [
      {key: "open", labelEn: "Open", labelHe: "פתוחה", sortOrder: 1},
      {key: "won", labelEn: "Won", labelHe: "נסגרה בהצלחה", sortOrder: 2},
      {key: "lost", labelEn: "Lost", labelHe: "נסגרה בהפסד", sortOrder: 3}
    ]
  },
  {
    id: "cat_task_type",
    key: "task_type",
    name: "Task Types",
    values: [
      {key: "call", labelEn: "Call", labelHe: "שיחה", sortOrder: 1},
      {key: "meeting", labelEn: "Meeting", labelHe: "פגישה", sortOrder: 2}
    ]
  },
  {
    id: "cat_task_priority",
    key: "task_priority",
    name: "Task Priorities",
    values: [
      {key: "high", labelEn: "High", labelHe: "גבוה", sortOrder: 1},
      {key: "medium", labelEn: "Medium", labelHe: "בינוני", sortOrder: 2},
      {key: "low", labelEn: "Low", labelHe: "נמוך", sortOrder: 3}
    ]
  },
  {
    id: "cat_task_status",
    key: "task_status",
    name: "Task Statuses",
    values: [
      {key: "open", labelEn: "Open", labelHe: "פתוח", sortOrder: 1},
      {key: "completed", labelEn: "Completed", labelHe: "הושלם", sortOrder: 2}
    ]
  },
  {
    id: "cat_close_reason",
    key: "close_reason",
    name: "Close Reasons",
    values: [
      {key: "not_relevant", labelEn: "Not relevant", labelHe: "לא רלוונטי", sortOrder: 1},
      {key: "no_response", labelEn: "No response", labelHe: "ללא מענה", sortOrder: 2},
      {key: "completed", labelEn: "Completed / resolved", labelHe: "הושלם / טופל", sortOrder: 3},
      {key: "meeting", labelEn: "Meeting booked", labelHe: "נקבעה פגישה", sortOrder: 4}
    ]
  },
  {
    id: "cat_import_status",
    key: "import_status",
    name: "Import Statuses",
    values: [
      {key: "staged", labelEn: "Staged", labelHe: "הועלה", sortOrder: 1},
      {key: "approved", labelEn: "Approved", labelHe: "אושר", sortOrder: 2}
    ]
  }
];

async function main() {
  for (const user of users) {
    await prisma.user.upsert({
      where: {id: user.id},
      update: {
        email: user.email,
        fullName: user.fullName,
        passwordHash: user.passwordHash,
        role: user.role,
        languagePreference: user.languagePreference,
        isActive: user.isActive
      },
      create: user
    });
  }

  for (const category of categories) {
    await prisma.listCategory.upsert({
      where: {key: category.key},
      update: {
        name: category.name
      },
      create: {
        id: category.id,
        key: category.key,
        name: category.name
      }
    });

    const existingCategory = await prisma.listCategory.findUniqueOrThrow({
      where: {key: category.key}
    });

    for (const value of category.values) {
      await prisma.listValue.upsert({
        where: {
          categoryId_key: {
            categoryId: existingCategory.id,
            key: value.key
          }
        },
        update: {
          labelEn: value.labelEn,
          labelHe: value.labelHe,
          sortOrder: value.sortOrder,
          isActive: true
        },
        create: {
          categoryId: existingCategory.id,
          key: value.key,
          labelEn: value.labelEn,
          labelHe: value.labelHe,
          sortOrder: value.sortOrder,
          isActive: true
        }
      });
    }
  }

  console.log("CRM seed complete.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
