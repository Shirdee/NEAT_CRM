import type {User} from "@prisma/client";

import {
  createFallbackUser,
  createFallbackCategory,
  createFallbackValue,
  getFallbackUserByEmail,
  getFallbackUserByIdentifier,
  listFallbackUsers,
  listFallbackCategories,
  toggleFallbackUserActive,
  toggleFallbackValue,
  updateFallbackValue
} from "./fallback-store";
import {hashPassword} from "@/lib/auth/password";

export type UserLike = Pick<
  User,
  "id" | "email" | "fullName" | "passwordHash" | "role" | "languagePreference" | "isActive"
>;

export type AdminUserItem = Pick<
  User,
  "id" | "email" | "fullName" | "role" | "languagePreference" | "isActive"
>;

function hasDatabaseUrl() {
  return Boolean(process.env.DATABASE_URL?.trim());
}

async function getPrisma() {
  const {prisma} = await import("@/lib/prisma/client");

  return prisma;
}

export async function getUserByEmail(email: string): Promise<UserLike | null> {
  if (!hasDatabaseUrl()) {
    return getFallbackUserByEmail(email);
  }

  const prisma = await getPrisma();

  return prisma.user.findUnique({
    where: {
      email: email.trim().toLowerCase()
    }
  });
}

export async function getUserByIdentifier(identifier: string): Promise<UserLike | null> {
  if (!hasDatabaseUrl()) {
    return getFallbackUserByIdentifier(identifier);
  }

  const value = identifier.trim();
  const prisma = await getPrisma();

  if (value.includes("@")) {
    return prisma.user.findUnique({
      where: {
        email: value.toLowerCase()
      }
    });
  }

  return prisma.user.findFirst({
    where: {
      fullName: {
        equals: value,
        mode: "insensitive"
      }
    }
  });
}

export async function listAdminUsers(): Promise<AdminUserItem[]> {
  if (!hasDatabaseUrl()) {
    return listFallbackUsers();
  }

  const prisma = await getPrisma();
  return prisma.user.findMany({
    select: {
      id: true,
      email: true,
      fullName: true,
      role: true,
      languagePreference: true,
      isActive: true
    },
    orderBy: [{fullName: "asc"}, {email: "asc"}]
  });
}

export async function createAdminUser(input: {
  email: string;
  fullName: string;
  password: string;
  role: User["role"];
  languagePreference: User["languagePreference"];
}) {
  const normalizedEmail = input.email.trim().toLowerCase();
  const fullName = input.fullName.trim();
  const passwordHash = hashPassword(input.password);

  if (!hasDatabaseUrl()) {
    return createFallbackUser({
      email: normalizedEmail,
      fullName,
      passwordHash,
      role: input.role,
      languagePreference: input.languagePreference
    });
  }

  const prisma = await getPrisma();
  return prisma.user.create({
    data: {
      email: normalizedEmail,
      fullName,
      passwordHash,
      role: input.role,
      languagePreference: input.languagePreference,
      isActive: true
    }
  });
}

export async function toggleAdminUserActive(id: string) {
  if (!hasDatabaseUrl()) {
    return toggleFallbackUserActive(id);
  }

  const prisma = await getPrisma();
  const current = await prisma.user.findUniqueOrThrow({
    where: {id}
  });

  return prisma.user.update({
    where: {id},
    data: {
      isActive: !current.isActive
    }
  });
}

export async function listAdminListCategories() {
  if (!hasDatabaseUrl()) {
    return listFallbackCategories();
  }

  const prisma = await getPrisma();

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

  const prisma = await getPrisma();

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

  const prisma = await getPrisma();
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

  const prisma = await getPrisma();

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

  const prisma = await getPrisma();
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
