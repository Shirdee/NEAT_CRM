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

export type SeedCompany = {
  id: string;
  companyName: string;
  website: string | null;
  sourceValueId: string | null;
  stageValueId: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  createdById: string | null;
  updatedById: string | null;
};

export type SeedContactEmail = {
  id: string;
  contactId: string;
  email: string;
  isPrimary: boolean;
  createdAt: string;
};

export type SeedContactPhone = {
  id: string;
  contactId: string;
  phoneNumber: string;
  isPrimary: boolean;
  createdAt: string;
};

export type SeedContact = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  fullName: string;
  roleTitle: string | null;
  companyId: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  createdById: string | null;
  updatedById: string | null;
  emails: SeedContactEmail[];
  phones: SeedContactPhone[];
};

function hashPassword(password: string) {
  return createHash("sha256").update(`crm-sprint-1:${password}`).digest("hex");
}

const now = new Date("2026-04-04T09:00:00.000Z").toISOString();

const leadSourceId = "cat_lead_source";
const companyStageId = "cat_company_stage";
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
    id: companyStageId,
    key: "company_stage",
    name: "Company Stages",
    createdAt: now,
    values: [
      {
        id: "value_stage_new",
        categoryId: companyStageId,
        key: "new",
        labelEn: "New",
        labelHe: "חדש",
        sortOrder: 1,
        isActive: true,
        createdAt: now,
        updatedAt: now
      },
      {
        id: "value_stage_active",
        categoryId: companyStageId,
        key: "active",
        labelEn: "Active",
        labelHe: "פעיל",
        sortOrder: 2,
        isActive: true,
        createdAt: now,
        updatedAt: now
      },
      {
        id: "value_stage_nurture",
        categoryId: companyStageId,
        key: "nurture",
        labelEn: "Nurture",
        labelHe: "טיפוח",
        sortOrder: 3,
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

export const seededCompanies: SeedCompany[] = [
  {
    id: "company_northern",
    companyName: "Northern Light Labs",
    website: "https://northernlight.example",
    sourceValueId: seededCategories[0].values[0]?.id ?? null,
    stageValueId: "value_stage_active",
    notes: "Bilingual inbound lead with active discovery notes.",
    createdAt: now,
    updatedAt: now,
    createdById: "user_admin",
    updatedById: "user_admin"
  },
  {
    id: "company_harbor",
    companyName: "Harbor Bridge Studio",
    website: "https://harborbridge.example",
    sourceValueId: seededCategories[0].values[1]?.id ?? null,
    stageValueId: "value_stage_new",
    notes: "Website lead waiting for first meeting.",
    createdAt: now,
    updatedAt: now,
    createdById: "user_admin",
    updatedById: "user_editor"
  },
  {
    id: "company_orbit",
    companyName: "Orbit Foods",
    website: null,
    sourceValueId: null,
    stageValueId: "value_stage_nurture",
    notes: "Imported from workbook without a website.",
    createdAt: now,
    updatedAt: now,
    createdById: "user_editor",
    updatedById: "user_editor"
  }
];

export const seededContacts: SeedContact[] = [
  {
    id: "contact_maya",
    firstName: "Maya",
    lastName: "Levi",
    fullName: "Maya Levi",
    roleTitle: "Partnership Lead",
    companyId: "company_northern",
    notes: "Prefers Hebrew follow-up after the first call.",
    createdAt: now,
    updatedAt: now,
    createdById: "user_admin",
    updatedById: "user_editor",
    emails: [
      {
        id: "email_maya_work",
        contactId: "contact_maya",
        email: "maya@northernlight.example",
        isPrimary: true,
        createdAt: now
      },
      {
        id: "email_maya_alt",
        contactId: "contact_maya",
        email: "maya.levi@gmail.example",
        isPrimary: false,
        createdAt: now
      }
    ],
    phones: [
      {
        id: "phone_maya_mobile",
        contactId: "contact_maya",
        phoneNumber: "+972-50-555-0101",
        isPrimary: true,
        createdAt: now
      }
    ]
  },
  {
    id: "contact_noam",
    firstName: "Noam",
    lastName: "Cohen",
    fullName: "Noam Cohen",
    roleTitle: "Founder",
    companyId: "company_harbor",
    notes: "Search should match founder notes and website-driven lead source.",
    createdAt: now,
    updatedAt: now,
    createdById: "user_admin",
    updatedById: "user_admin",
    emails: [
      {
        id: "email_noam_work",
        contactId: "contact_noam",
        email: "noam@harborbridge.example",
        isPrimary: true,
        createdAt: now
      }
    ],
    phones: [
      {
        id: "phone_noam_mobile",
        contactId: "contact_noam",
        phoneNumber: "+1-415-555-0199",
        isPrimary: true,
        createdAt: now
      },
      {
        id: "phone_noam_office",
        contactId: "contact_noam",
        phoneNumber: "+1-415-555-0100",
        isPrimary: false,
        createdAt: now
      }
    ]
  },
  {
    id: "contact_talia",
    firstName: "Talia",
    lastName: "Ben David",
    fullName: "Talia Ben David",
    roleTitle: null,
    companyId: null,
    notes: "Standalone contact preserved from import cleanup.",
    createdAt: now,
    updatedAt: now,
    createdById: "user_editor",
    updatedById: "user_editor",
    emails: [
      {
        id: "email_talia_work",
        contactId: "contact_talia",
        email: "talia@example.test",
        isPrimary: true,
        createdAt: now
      }
    ],
    phones: []
  }
];
