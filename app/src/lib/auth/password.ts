import {createHash, timingSafeEqual} from "node:crypto";

export function hashPassword(password: string) {
  return createHash("sha256").update(`crm-sprint-1:${password}`).digest("hex");
}

export function verifyPassword(password: string, passwordHash: string) {
  const hashedInput = hashPassword(password);

  return timingSafeEqual(Buffer.from(hashedInput), Buffer.from(passwordHash));
}
