import {describe, expect, it} from "vitest";

import {createSessionToken, readSessionToken} from "./session";

describe("session token handling", () => {
  it("reads a valid signed session token", () => {
    const token = createSessionToken({
      id: "user_admin",
      email: "admin@crm.local",
      fullName: "CRM Admin",
      role: "admin",
      languagePreference: "en"
    });

    expect(readSessionToken(token)).toMatchObject({
      email: "admin@crm.local",
      role: "admin"
    });
  });

  it("rejects a tampered session token", () => {
    const token = createSessionToken({
      id: "user_admin",
      email: "admin@crm.local",
      fullName: "CRM Admin",
      role: "admin",
      languagePreference: "en"
    });

    const tampered = `${token.slice(0, -1)}x`;

    expect(readSessionToken(tampered)).toBeNull();
  });
});
