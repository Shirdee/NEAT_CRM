import {beforeEach, describe, expect, it} from "vitest";

import {resetFallbackStore} from "./fallback-store";
import {
  createInteraction,
  createTask,
  getCompanyById,
  getInteractionById,
  getTaskById,
  listLookupOptions,
  normalizeInteractionPayload,
  normalizeTaskPayload,
  updateTask
} from "./crm";

describe("crm sprint 4 fallback flows", () => {
  beforeEach(() => {
    resetFallbackStore();
    delete process.env.DATABASE_URL;
  });

  it("creates an interaction linked to a contact-only workflow", async () => {
    const payload = normalizeInteractionPayload({
      interactionDate: "2026-04-09T10:30",
      companyId: "",
      contactId: "contact_talia",
      interactionTypeValueId: "value_interaction_email",
      subject: "Second follow-up",
      summary: "Reached back out to keep the thread warm.",
      outcomeStatusValueId: "value_outcome_pending",
      actorUserId: "user_editor"
    });

    const interaction = await createInteraction(payload);
    const detail = await getInteractionById(interaction.id);

    expect(detail).toMatchObject({
      subject: "Second follow-up",
      contactName: "Talia Ben David"
    });
  });

  it("creates and completes a task from an interaction context", async () => {
    const taskTypeId = (await listLookupOptions("task_type"))[0]?.id ?? "";

    const created = await createTask(
      normalizeTaskPayload({
        companyId: "company_northern",
        contactId: "contact_maya",
        relatedInteractionId: "interaction_maya_kickoff",
        taskTypeValueId: taskTypeId,
        dueDate: "2026-04-10T09:00",
        priorityValueId: "value_task_priority_high",
        statusValueId: "value_task_status_open",
        notes: "Send next-step summary",
        actorUserId: "user_admin"
      })
    );

    await updateTask(
      created.id,
      normalizeTaskPayload({
        companyId: "company_northern",
        contactId: "contact_maya",
        relatedInteractionId: "interaction_maya_kickoff",
        taskTypeValueId: created.taskTypeValueId,
        dueDate: "2026-04-10T09:00",
        priorityValueId: "value_task_priority_high",
        statusValueId: "value_task_status_completed",
        notes: "Completed and sent",
        actorUserId: "user_admin"
      })
    );

    const task = await getTaskById(created.id);

    expect(task?.completedAt).not.toBeNull();
    expect(task?.interactionSubject).toBe("Discovery kickoff");
  });

  it("exposes activity and task counts on company detail", async () => {
    const company = await getCompanyById("company_northern");

    expect(company?.lastInteractionDate).toBeTruthy();
    expect(company?.openTasksCount).toBeGreaterThanOrEqual(1);
  });
});
