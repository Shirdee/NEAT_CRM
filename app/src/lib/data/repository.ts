import type {User} from "@prisma/client";

import {prisma} from "@/lib/prisma/client";

import {
  createFallbackCategory,
  createFallbackValue,
  getFallbackUserByEmail,
  listFallbackCategories,
  toggleFallbackValue,
  updateFallbackValue
} from "./fallback-store";

export type UserLike = Pick<
  User,
  "id" | "email" | "fullName" | "passwordHash" | "role" | "languagePreference" | "isActive"
>;

function hasDatabaseUrl() {
  return Boolean(process.env.DATABASE_URL?.trim());
}

export async function getUserByEmail(email: string): Promise<UserLike | null> {
  if (!hasDatabaseUrl()) {
    return getFallbackUserByEmail(email);
  }

  return prisma.user.findUnique({
    where: {
      email: email.trim().toLowerCase()
    }
  });
}

export async function listAdminListCategories() {
  if (!hasDatabaseUrl()) {
    return listFallbackCategories();
  }

  return prisma.listCategory.findMany({
    include: {
      values: {
        orderBy: [{sortOrder: "asc"}, {labelEn: "asc"}]
      }
    },
    orderBy: {
      name: "asc"
    }
  });
}

export async function createListCategory(input: {key: string; name: string}) {
  if (!hasDatabaseUrl()) {
    return createFallbackCategory(input);
  }

  return prisma.listCategory.create({
    data: {
      key: input.key,
      name: input.name
    }
  });
}

export async function createListValue(input: {
  categoryId: string;
  key: string;
  labelEn: string;
  labelHe: string;
}) {
  if (!hasDatabaseUrl()) {
    return createFallbackValue(input);
  }

  const latest = await prisma.listValue.findFirst({
    where: {categoryId: input.categoryId},
    orderBy: {sortOrder: "desc"}
  });

  return prisma.listValue.create({
    data: {
      categoryId: input.categoryId,
      key: input.key,
      labelEn: input.labelEn,
      labelHe: input.labelHe,
      sortOrder: (latest?.sortOrder ?? 0) + 1
    }
  });
}

export async function updateListValue(input: {
  id: string;
  key: string;
  labelEn: string;
  labelHe: string;
}) {
  if (!hasDatabaseUrl()) {
    return updateFallbackValue(input);
  }

  return prisma.listValue.update({
    where: {id: input.id},
    data: {
      key: input.key,
      labelEn: input.labelEn,
      labelHe: input.labelHe
    }
  });
}

export async function toggleListValueActive(id: string) {
  if (!hasDatabaseUrl()) {
    return toggleFallbackValue(id);
  }

  const current = await prisma.listValue.findUniqueOrThrow({
    where: {id}
  });

  return prisma.listValue.update({
    where: {id},
    data: {
      isActive: !current.isActive
    }
  });
}
