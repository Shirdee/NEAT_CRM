import {getUserByEmail} from "@/lib/data/repository";

import {verifyPassword} from "./password";
import type {UserSession} from "./session";

export async function authenticateUser(
  email: string,
  password: string
): Promise<UserSession | null> {
  const user = await getUserByEmail(email);

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
