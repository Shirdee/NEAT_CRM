import {createHash, randomUUID} from "node:crypto";

import type {AppLocale} from "@/i18n/routing";
import type {UserRole} from "@/lib/auth/session";

export type SeedUser = {
  id: string;
  clerkUserId: string | null;
  email: string;
  fullName: string;
  role: UserRole;
  languagePreference: AppLocale;
  isActive: boolean;
  passwordHash: string | null;
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
  archivedAt?: string | null;
  archivedById?: string | null;
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
  archivedAt?: string | null;
  archivedById?: string | null;
  createdAt: string;
  updatedAt: string;
  createdById: string | null;
  updatedById: string | null;
  emails: SeedContactEmail[];
  phones: SeedContactPhone[];
};

export type SeedInteraction = {
  id: string;
  interactionDate: string;
  companyId: string | null;
  contactId: string | null;
  interactionTypeValueId: string;
  subject: string;
  summary: string;
  outcomeStatusValueId: string | null;
  closeReasonValueId?: string | null;
  archivedAt?: string | null;
  archivedById?: string | null;
  createdById: string;
  createdAt: string;
  updatedAt: string;
};

export type SeedTask = {
  id: string;
  companyId: string | null;
  contactId: string | null;
  relatedInteractionId: string | null;
  taskTypeValueId: string;
  dueDate: string;
  priorityValueId: string;
  statusValueId: string;
  closeReasonValueId?: string | null;
  notes: string | null;
  archivedAt?: string | null;
  archivedById?: string | null;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
};

export type SeedOpportunity = {
  id: string;
  companyId: string;
  contactId: string | null;
  opportunityName: string;
  opportunityStageValueId: string;
  opportunityTypeValueId: string;
  estimatedValue: string | null;
  statusValueId: string;
  targetCloseDate: string | null;
  notes: string | null;
  archivedAt?: string | null;
  archivedById?: string | null;
  createdById: string;
  updatedById: string | null;
  createdAt: string;
  updatedAt: string;
};

function hashPassword(password: string) {
  return createHash("sha256").update(`crm-sprint-1:${password}`).digest("hex");
}

const now = new Date("2026-04-04T09:00:00.000Z").toISOString();

const leadSourceId = "cat_lead_source";
const companyStageId = "cat_company_stage";
const interactionTypeId = "cat_interaction_type";
const interactionOutcomeStatusId = "cat_interaction_outcome_status";
const opportunityStageId = "cat_opportunity_stage";
const opportunityTypeId = "cat_opportunity_type";
const opportunityStatusId = "cat_opportunity_status";
const taskTypeId = "cat_task_type";
const taskPriorityId = "cat_task_priority";
const taskStatusId = "cat_task_status";
const closeReasonId = "cat_close_reason";
const importStatusId = "cat_import_status";

export const seededUsers: SeedUser[] = [
  {
    id: "user_admin",
    clerkUserId: null,
    email: "shirdn@neat-tech.com",
    fullName: "Top Admin",
    role: "admin",
    languagePreference: "en",
    isActive: true,
    passwordHash: hashPassword("shir1994")
  },
  {
    id: "user_editor",
    clerkUserId: null,
    email: "editor@crm.local",
    fullName: "CRM Editor",
    role: "editor",
    languagePreference: "en",
    isActive: true,
    passwordHash: hashPassword("editor-review")
  },
  {
    id: "user_viewer",
    clerkUserId: null,
    email: "viewer@crm.local",
    fullName: "CRM Viewer",
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
    id: interactionTypeId,
    key: "interaction_type",
    name: "Interaction Types",
    createdAt: now,
    values: [
      {
        id: "value_interaction_call",
        categoryId: interactionTypeId,
        key: "call",
        labelEn: "Phone call",
        labelHe: "שיחת טלפון",
        sortOrder: 1,
        isActive: true,
        createdAt: now,
        updatedAt: now
      },
      {
        id: "value_interaction_meeting",
        categoryId: interactionTypeId,
        key: "meeting",
        labelEn: "Meeting",
        labelHe: "פגישה",
        sortOrder: 2,
        isActive: true,
        createdAt: now,
        updatedAt: now
      },
      {
        id: "value_interaction_email",
        categoryId: interactionTypeId,
        key: "email",
        labelEn: "Email",
        labelHe: "אימייל",
        sortOrder: 3,
        isActive: true,
        createdAt: now,
        updatedAt: now
      }
    ]
  },
  {
    id: interactionOutcomeStatusId,
    key: "interaction_outcome_status",
    name: "Interaction Outcomes",
    createdAt: now,
    values: [
      {
        id: "value_outcome_booked",
        categoryId: interactionOutcomeStatusId,
        key: "booked",
        labelEn: "Booked meeting",
        labelHe: "פגישה נקבעה",
        sortOrder: 1,
        isActive: true,
        createdAt: now,
        updatedAt: now
      },
      {
        id: "value_outcome_pending",
        categoryId: interactionOutcomeStatusId,
        key: "pending",
        labelEn: "Needs follow-up",
        labelHe: "דורש מעקב",
        sortOrder: 2,
        isActive: true,
        createdAt: now,
        updatedAt: now
      },
      {
        id: "value_outcome_no_response",
        categoryId: interactionOutcomeStatusId,
        key: "no_response",
        labelEn: "No response",
        labelHe: "ללא מענה",
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
    id: opportunityTypeId,
    key: "opportunity_type",
    name: "Opportunity Types",
    createdAt: now,
    values: [
      {
        id: "value_opportunity_type_new_business",
        categoryId: opportunityTypeId,
        key: "new_business",
        labelEn: "New business",
        labelHe: "עסקה חדשה",
        sortOrder: 1,
        isActive: true,
        createdAt: now,
        updatedAt: now
      },
      {
        id: "value_opportunity_type_expansion",
        categoryId: opportunityTypeId,
        key: "expansion",
        labelEn: "Expansion",
        labelHe: "הרחבה",
        sortOrder: 2,
        isActive: true,
        createdAt: now,
        updatedAt: now
      }
    ]
  },
  {
    id: opportunityStatusId,
    key: "opportunity_status",
    name: "Opportunity Statuses",
    createdAt: now,
    values: [
      {
        id: "value_opportunity_status_open",
        categoryId: opportunityStatusId,
        key: "open",
        labelEn: "Open",
        labelHe: "פתוח",
        sortOrder: 1,
        isActive: true,
        createdAt: now,
        updatedAt: now
      },
      {
        id: "value_opportunity_status_won",
        categoryId: opportunityStatusId,
        key: "won",
        labelEn: "Won",
        labelHe: "נסגר בהצלחה",
        sortOrder: 2,
        isActive: true,
        createdAt: now,
        updatedAt: now
      },
      {
        id: "value_opportunity_status_lost",
        categoryId: opportunityStatusId,
        key: "lost",
        labelEn: "Lost",
        labelHe: "נסגר ללא זכיה",
        sortOrder: 3,
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
    id: taskPriorityId,
    key: "task_priority",
    name: "Task Priorities",
    createdAt: now,
    values: [
      {
        id: "value_task_priority_high",
        categoryId: taskPriorityId,
        key: "high",
        labelEn: "High",
        labelHe: "גבוה",
        sortOrder: 1,
        isActive: true,
        createdAt: now,
        updatedAt: now
      },
      {
        id: "value_task_priority_medium",
        categoryId: taskPriorityId,
        key: "medium",
        labelEn: "Medium",
        labelHe: "בינוני",
        sortOrder: 2,
        isActive: true,
        createdAt: now,
        updatedAt: now
      },
      {
        id: "value_task_priority_low",
        categoryId: taskPriorityId,
        key: "low",
        labelEn: "Low",
        labelHe: "נמוך",
        sortOrder: 3,
        isActive: true,
        createdAt: now,
        updatedAt: now
      }
    ]
  },
  {
    id: taskStatusId,
    key: "task_status",
    name: "Task Statuses",
    createdAt: now,
    values: [
      {
        id: "value_task_status_open",
        categoryId: taskStatusId,
        key: "open",
        labelEn: "Open",
        labelHe: "פתוח",
        sortOrder: 1,
        isActive: true,
        createdAt: now,
        updatedAt: now
      },
      {
        id: "value_task_status_completed",
        categoryId: taskStatusId,
        key: "completed",
        labelEn: "Completed",
        labelHe: "הושלם",
        sortOrder: 2,
        isActive: true,
        createdAt: now,
        updatedAt: now
      }
    ]
  },
  {
    id: closeReasonId,
    key: "close_reason",
    name: "Close Reasons",
    createdAt: now,
    values: [
      {
        id: "value_close_reason_not_relevant",
        categoryId: closeReasonId,
        key: "not_relevant",
        labelEn: "Not relevant",
        labelHe: "לא רלוונטי",
        sortOrder: 1,
        isActive: true,
        createdAt: now,
        updatedAt: now
      },
      {
        id: "value_close_reason_no_response",
        categoryId: closeReasonId,
        key: "no_response",
        labelEn: "No response",
        labelHe: "ללא מענה",
        sortOrder: 2,
        isActive: true,
        createdAt: now,
        updatedAt: now
      },
      {
        id: "value_close_reason_completed",
        categoryId: closeReasonId,
        key: "completed",
        labelEn: "Completed / resolved",
        labelHe: "הושלם / טופל",
        sortOrder: 3,
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

export const seededInteractions: SeedInteraction[] = [
  {
    id: "interaction_maya_kickoff",
    interactionDate: "2026-04-06T09:30:00.000Z",
    companyId: "company_northern",
    contactId: "contact_maya",
    interactionTypeValueId: "value_interaction_meeting",
    subject: "Discovery kickoff",
    summary: "Reviewed bilingual rollout needs and aligned on the next demo steps.",
    outcomeStatusValueId: "value_outcome_booked",
    createdById: "user_admin",
    createdAt: now,
    updatedAt: now
  },
  {
    id: "interaction_noam_followup",
    interactionDate: "2026-04-03T14:00:00.000Z",
    companyId: "company_harbor",
    contactId: "contact_noam",
    interactionTypeValueId: "value_interaction_call",
    subject: "Follow-up call",
    summary: "Confirmed interest and asked for pricing notes before booking the next meeting.",
    outcomeStatusValueId: "value_outcome_pending",
    createdById: "user_editor",
    createdAt: now,
    updatedAt: now
  },
  {
    id: "interaction_talia_intro",
    interactionDate: "2026-03-25T11:00:00.000Z",
    companyId: null,
    contactId: "contact_talia",
    interactionTypeValueId: "value_interaction_email",
    subject: "Intro email",
    summary: "Initial outreach sent to a standalone contact from the cleaned import set.",
    outcomeStatusValueId: "value_outcome_no_response",
    createdById: "user_editor",
    createdAt: now,
    updatedAt: now
  }
];

export const seededTasks: SeedTask[] = [
  {
    id: "task_maya_demo",
    companyId: "company_northern",
    contactId: "contact_maya",
    relatedInteractionId: "interaction_maya_kickoff",
    taskTypeValueId: seededCategories.find((category) => category.key === "task_type")?.values[1]?.id ?? "",
    dueDate: "2026-04-08T10:00:00.000Z",
    priorityValueId: "value_task_priority_high",
    statusValueId: "value_task_status_open",
    notes: "Prepare the tailored demo recap and confirm attendees.",
    createdById: "user_admin",
    createdAt: now,
    updatedAt: now,
    completedAt: null
  },
  {
    id: "task_noam_pricing",
    companyId: "company_harbor",
    contactId: "contact_noam",
    relatedInteractionId: "interaction_noam_followup",
    taskTypeValueId: seededCategories.find((category) => category.key === "task_type")?.values[0]?.id ?? "",
    dueDate: "2026-04-05T12:00:00.000Z",
    priorityValueId: "value_task_priority_medium",
    statusValueId: "value_task_status_open",
    notes: "Send pricing context and propose two meeting slots.",
    createdById: "user_editor",
    createdAt: now,
    updatedAt: now,
    completedAt: null
  },
  {
    id: "task_talia_archive",
    companyId: null,
    contactId: "contact_talia",
    relatedInteractionId: "interaction_talia_intro",
    taskTypeValueId: seededCategories.find((category) => category.key === "task_type")?.values[0]?.id ?? "",
    dueDate: "2026-03-28T09:00:00.000Z",
    priorityValueId: "value_task_priority_low",
    statusValueId: "value_task_status_completed",
    notes: "Close the loop after no response and keep the record searchable.",
    createdById: "user_editor",
    createdAt: now,
    updatedAt: now,
    completedAt: "2026-03-28T13:00:00.000Z"
  }
];

export const seededOpportunities: SeedOpportunity[] = [
  {
    id: "opportunity_northern_discovery",
    companyId: "company_northern",
    contactId: "contact_maya",
    opportunityName: "CRM rollout pilot",
    opportunityStageValueId:
      seededCategories.find((category) => category.key === "opportunity_stage")?.values[0]?.id ?? "",
    opportunityTypeValueId: "value_opportunity_type_new_business",
    estimatedValue: "45000",
    statusValueId: "value_opportunity_status_open",
    targetCloseDate: "2026-05-15T00:00:00.000Z",
    notes: "Strong early fit. Waiting on procurement timeline.",
    createdById: "user_admin",
    updatedById: "user_admin",
    createdAt: now,
    updatedAt: now
  },
  {
    id: "opportunity_harbor_followup",
    companyId: "company_harbor",
    contactId: "contact_noam",
    opportunityName: "Founder onboarding package",
    opportunityStageValueId:
      seededCategories.find((category) => category.key === "opportunity_stage")?.values[1]?.id ?? "",
    opportunityTypeValueId: "value_opportunity_type_expansion",
    estimatedValue: "18000",
    statusValueId: "value_opportunity_status_open",
    targetCloseDate: "2026-06-01T00:00:00.000Z",
    notes: "Depends on final scope and timing confirmation.",
    createdById: "user_editor",
    updatedById: "user_editor",
    createdAt: now,
    updatedAt: now
  }
];
