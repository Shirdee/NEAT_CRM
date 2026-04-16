import {beforeEach, describe, expect, it} from "vitest";

import {authenticateUser} from "../auth/authenticate";

import {resetFallbackStore} from "./fallback-store";
import {
  createListCategory,
  createListValue,
  listAdminListCategories,
  toggleListValueActive,
  updateListValue
} from "./repository";

describe("fallback repository", () => {
  beforeEach(() => {
    resetFallbackStore();
    delete process.env.DATABASE_URL;
  });

  it("authenticates trusted seeded users instead of self-selected roles", async () => {
    const admin = await authenticateUser("ShirAdmin", "shir1994");
    const rejected = await authenticateUser("ShirAdmin", "wrong-password");

    expect(admin?.role).toBe("admin");
    expect(rejected).toBeNull();
  });

  it("creates and updates admin-managed list values", async () => {
    const category = await createListCategory({
      key: "company_stage",
      name: "Company Stages"
    });

    const value = await createListValue({
      categoryId: category.id,
      key: "new",
      labelEn: "New",
      labelHe: "חדש"
    });

    await updateListValue({
      id: value.id,
      key: "new_lead",
      labelEn: "New Lead",
      labelHe: "ליד חדש"
    });
    const toggled = await toggleListValueActive(value.id);

    const categories = await listAdminListCategories();
    const updatedCategory = categories.find((item) => item.id === category.id);
    const updatedValue = updatedCategory?.values.find((item) => item.id === value.id);

    expect(updatedValue).toMatchObject({
      key: "new_lead",
      labelEn: "New Lead",
      isActive: toggled.isActive
    });
  });
});
