import {beforeEach, describe, expect, it} from "vitest";

import {
  createSavedView,
  extractSavedViewFilters,
  listSavedViews,
  resetSavedViewStoreForTests,
  resolveSavedViewFilters
} from "./saved-views";

describe("saved views contract", () => {
  beforeEach(() => {
    resetSavedViewStoreForTests();
    delete process.env.DATABASE_URL;
  });

  it("keeps only allowed module filter keys", () => {
    const filters = extractSavedViewFilters("companies", {
      q: "acme",
      source: "source-1",
      stage: "stage-1",
      statusValueId: "should-not-pass",
      unknown: "ignored"
    });

    expect(filters).toEqual({
      q: "acme",
      source: "source-1",
      stage: "stage-1"
    });
  });

  it("stores saved views privately per user", async () => {
    await createSavedView({
      userId: "user-a",
      module: "tasks",
      name: "My open tasks",
      searchParams: {
        q: "follow-up",
        statusValueId: "open"
      }
    });
    await createSavedView({
      userId: "user-b",
      module: "tasks",
      name: "Other user view",
      searchParams: {
        q: "other"
      }
    });

    const userAViews = await listSavedViews({
      userId: "user-a",
      module: "tasks"
    });

    expect(userAViews).toHaveLength(1);
    expect(userAViews[0]).toMatchObject({
      userId: "user-a",
      module: "tasks",
      name: "My open tasks",
      filters: {
        q: "follow-up",
        statusValueId: "open"
      }
    });
  });

  it("wraps route search params over the selected saved view", async () => {
    const savedView = await createSavedView({
      userId: "user-a",
      module: "opportunities",
      name: "Pipeline",
      searchParams: {
        stage: "stage-1",
        status: "open",
        type: "new-logo"
      }
    });

    const resolved = await resolveSavedViewFilters({
      module: "opportunities",
      userId: "user-a",
      searchParams: {
        view: savedView.id,
        status: "closed",
        q: "acme"
      }
    });

    expect(resolved.selectedView?.id).toBe(savedView.id);
    expect(resolved.filters).toEqual({
      stage: "stage-1",
      type: "new-logo",
      status: "closed",
      q: "acme"
    });
  });
});
