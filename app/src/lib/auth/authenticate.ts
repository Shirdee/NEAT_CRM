import {getUserByIdentifier} from "@/lib/data/repository";

import {verifyPassword} from "./password";
import type {UserSession} from "./session";

export async function authenticateUser(
  identifier: string,
  password: string
): Promise<UserSession | null> {
  const user = await getUserByIdentifier(identifier);

  if (!user || !user.isActive || !verifyPassword(password, user.passwordHash)) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
    languagePreference: user.languagePreference
  };
}
