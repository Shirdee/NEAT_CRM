import {createHash, randomUUID} from "node:crypto";

import type {AppLocale} from "@/i18n/routing";
import type {UserRole} from "@/lib/auth/session";

export type SeedUser = {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  languagePreference: AppLocale;
  isActive: boolean;
  passwordHash: string;
};

export type SeedListValue = {
  id: string;
  categoryId: string;
  key: string;
  labelEn: string;
  labelHe: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type SeedListCategory = {
  id: string;
  key: string;
  name: string;
  createdAt: string;
  values: SeedListValue[];
};

function hashPassword(password: string) {
  return createHash("sha256").update(`crm-sprint-1:${password}`).digest("hex");
}

const now = new Date("2026-04-04T09:00:00.000Z").toISOString();

const leadSourceId = "cat_lead_source";
const opportunityStageId = "cat_opportunity_stage";
const taskTypeId = "cat_task_type";
const importStatusId = "cat_import_status";

export const seededUsers: SeedUser[] = [
  {
    id: "user_admin",
    email: "admin@crm.local",
    fullName: "Sprint Admin",
    role: "admin",
    languagePreference: "en",
    isActive: true,
    passwordHash: hashPassword("shir")
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

export const seededCategories: SeedListCategory[] = [
  {
    id: leadSourceId,
    key: "lead_source",
    name: "Lead Sources",
    createdAt: now,
    values: [
      {
        id: randomUUID(),
        categoryId: leadSourceId,
        key: "referral",
        labelEn: "Referral",
        labelHe: "הפניה",
        sortOrder: 1,
        isActive: true,
        createdAt: now,
        updatedAt: now
      },
      {
        id: randomUUID(),
        categoryId: leadSourceId,
        key: "website",
        labelEn: "Website",
        labelHe: "אתר",
        sortOrder: 2,
        isActive: true,
        createdAt: now,
        updatedAt: now
      }
    ]
  },
  {
    id: opportunityStageId,
    key: "opportunity_stage",
    name: "Opportunity Stages",
    createdAt: now,
    values: [
      {
        id: randomUUID(),
        categoryId: opportunityStageId,
        key: "qualified",
        labelEn: "Qualified",
        labelHe: "מאומת",
        sortOrder: 1,
        isActive: true,
        createdAt: now,
        updatedAt: now
      },
      {
        id: randomUUID(),
        categoryId: opportunityStageId,
        key: "proposal",
        labelEn: "Proposal",
        labelHe: "הצעה",
        sortOrder: 2,
        isActive: true,
        createdAt: now,
        updatedAt: now
      }
    ]
  },
  {
    id: taskTypeId,
    key: "task_type",
    name: "Task Types",
    createdAt: now,
    values: [
      {
        id: randomUUID(),
        categoryId: taskTypeId,
        key: "call",
        labelEn: "Call",
        labelHe: "שיחה",
        sortOrder: 1,
        isActive: true,
        createdAt: now,
        updatedAt: now
      },
      {
        id: randomUUID(),
        categoryId: taskTypeId,
        key: "meeting",
        labelEn: "Meeting",
        labelHe: "פגישה",
        sortOrder: 2,
        isActive: true,
        createdAt: now,
        updatedAt: now
      }
    ]
  },
  {
    id: importStatusId,
    key: "import_status",
    name: "Import Statuses",
    createdAt: now,
    values: [
      {
        id: randomUUID(),
        categoryId: importStatusId,
        key: "staged",
        labelEn: "Staged",
        labelHe: "הועלה",
        sortOrder: 1,
        isActive: true,
        createdAt: now,
        updatedAt: now
      },
      {
        id: randomUUID(),
        categoryId: importStatusId,
        key: "approved",
        labelEn: "Approved",
        labelHe: "אושר",
        sortOrder: 2,
        isActive: true,
        createdAt: now,
        updatedAt: now
      }
    ]
  }
];
