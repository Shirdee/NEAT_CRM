import type {User} from "@prisma/client";
import {clerkClient} from "@clerk/nextjs/server";

import {
  createFallbackUser,
  createFallbackCategory,
  createFallbackValue,
  getFallbackUserByClerkUserId,
  getFallbackUserByEmail,
  getFallbackUserByIdentifier,
  linkFallbackUserToClerkIdentity,
  listFallbackUsers,
  listFallbackCategories,
  toggleFallbackUserActive,
  toggleFallbackValue,
  updateFallbackValue
} from "./fallback-store";
import {hashPassword} from "@/lib/auth/password";

export type UserLike = Pick<
  User,
  "id" | "clerkUserId" | "email" | "fullName" | "passwordHash" | "role" | "languagePreference" | "isActive"
>;

export type AdminUserItem = Pick<
  User,
  "id" | "clerkUserId" | "email" | "fullName" | "role" | "languagePreference" | "isActive"
>;

function hasDatabaseUrl() {
  return Boolean(process.env.DATABASE_URL?.trim());
}

function hasClerkAuth() {
  return Boolean(
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim() && process.env.CLERK_SECRET_KEY?.trim()
  );
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

export async function getUserByClerkUserId(clerkUserId: string): Promise<UserLike | null> {
  if (!hasDatabaseUrl()) {
    return getFallbackUserByClerkUserId(clerkUserId);
  }

  const prisma = await getPrisma();

  return prisma.user.findUnique({
    where: {clerkUserId}
  });
}

export async function linkUserToClerkIdentity(input: {
  clerkUserId: string;
  email: string;
}): Promise<UserLike | null> {
  if (!hasDatabaseUrl()) {
    return linkFallbackUserToClerkIdentity(input);
  }

  const prisma = await getPrisma();
  const normalizedEmail = input.email.trim().toLowerCase();

  const existingLinked = await prisma.user.findUnique({
    where: {clerkUserId: input.clerkUserId}
  });

  if (existingLinked) {
    return existingLinked;
  }

  const user = await prisma.user.findUnique({
    where: {email: normalizedEmail}
  });

  if (!user || user.clerkUserId) {
    return null;
  }

  return prisma.user.update({
    where: {id: user.id},
    data: {
      clerkUserId: input.clerkUserId
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
      clerkUserId: true,
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
  const passwordHash = hasClerkAuth() ? null : hashPassword(input.password);

  if (!hasDatabaseUrl()) {
    return createFallbackUser({
      clerkUserId: null,
      email: normalizedEmail,
      fullName,
      passwordHash,
      role: input.role,
      languagePreference: input.languagePreference
    });
  }

  const prisma = await getPrisma();
  let clerkUserId: string | null = null;

  if (hasClerkAuth()) {
    const client = await clerkClient();
    const clerkUser = await client.users.createUser({
      emailAddress: [normalizedEmail],
      password: input.password,
      firstName: fullName
    });
    clerkUserId = clerkUser.id;
  }

  return prisma.user.create({
    data: {
      clerkUserId,
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
