import {randomUUID} from "node:crypto";

import {
  seededCategories,
  seededUsers,
  type SeedListCategory,
  type SeedListValue,
  type SeedUser
} from "./seed";

type MutableState = {
  categories: SeedListCategory[];
  users: SeedUser[];
};

function cloneState(): MutableState {
  return {
    categories: seededCategories.map((category) => ({
      ...category,
      values: category.values.map((value) => ({...value}))
    })),
    users: seededUsers.map((user) => ({...user}))
  };
}

const globalState = globalThis as typeof globalThis & {
  crmFallbackState?: MutableState;
};

function getState() {
  if (!globalState.crmFallbackState) {
    globalState.crmFallbackState = cloneState();
  }

  return globalState.crmFallbackState;
}

export function resetFallbackStore() {
  globalState.crmFallbackState = cloneState();
}

export async function listFallbackCategories() {
  return getState().categories.map((category) => ({
    ...category,
    values: category.values
      .slice()
      .sort((left, right) => left.sortOrder - right.sortOrder || left.labelEn.localeCompare(right.labelEn))
  }));
}

export async function getFallbackUserByEmail(email: string) {
  return (
    getState().users.find(
      (user) => user.email.toLowerCase() === email.trim().toLowerCase() && user.isActive
    ) ?? null
  );
}

export async function createFallbackCategory(input: {key: string; name: string}) {
  const now = new Date().toISOString();
  const category: SeedListCategory = {
    id: randomUUID(),
    key: input.key,
    name: input.name,
    createdAt: now,
    values: []
  };

  getState().categories.push(category);
  return category;
}

export async function createFallbackValue(input: {
  categoryId: string;
  key: string;
  labelEn: string;
  labelHe: string;
}) {
  const category = getState().categories.find((item) => item.id === input.categoryId);

  if (!category) {
    throw new Error("Category not found");
  }

  const now = new Date().toISOString();
  const value: SeedListValue = {
    id: randomUUID(),
    categoryId: input.categoryId,
    key: input.key,
    labelEn: input.labelEn,
    labelHe: input.labelHe,
    sortOrder: category.values.length + 1,
    isActive: true,
    createdAt: now,
    updatedAt: now
  };

  category.values.push(value);
  return value;
}

export async function updateFallbackValue(input: {
  id: string;
  labelEn: string;
  labelHe: string;
  key: string;
}) {
  for (const category of getState().categories) {
    const value = category.values.find((item) => item.id === input.id);

    if (value) {
      value.key = input.key;
      value.labelEn = input.labelEn;
      value.labelHe = input.labelHe;
      value.updatedAt = new Date().toISOString();
      return value;
    }
  }

  throw new Error("Value not found");
}

export async function toggleFallbackValue(id: string) {
  for (const category of getState().categories) {
    const value = category.values.find((item) => item.id === id);

    if (value) {
      value.isActive = !value.isActive;
      value.updatedAt = new Date().toISOString();
      return value;
    }
  }

  throw new Error("Value not found");
}
