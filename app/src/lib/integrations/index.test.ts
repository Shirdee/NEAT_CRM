import {describe, expect, it} from "vitest";

import {
  INTEGRATION_PROVIDER_IDS,
  INTEGRATION_PROVIDERS,
  getIntegrationProvider,
  getIntegrationProviderCapabilities,
  isIntegrationProviderEnabled,
  listDisabledIntegrationProviders,
  listEnabledIntegrationProviders,
  normalizeIntegrationProviderId,
  supportsIntegrationCapability
} from "./index";

describe("integration boundary", () => {
  it("exposes stable provider registry entries", () => {
    expect(INTEGRATION_PROVIDER_IDS).toEqual(["gmail", "google_calendar", "outlook"]);
    expect(getIntegrationProvider("gmail")).toEqual({
      id: "gmail",
      label: "Gmail",
      enabled: true,
      capabilities: ["email"]
    });
    expect(INTEGRATION_PROVIDERS.outlook).toEqual({
      id: "outlook",
      label: "Outlook",
      enabled: true,
      capabilities: ["email", "calendar"]
    });
  });

  it("normalizes provider names and aliases", () => {
    expect(normalizeIntegrationProviderId(" Gmail ")).toBe("gmail");
    expect(normalizeIntegrationProviderId("google calendar")).toBe("google_calendar");
    expect(normalizeIntegrationProviderId("microsoft outlook")).toBe("outlook");
    expect(normalizeIntegrationProviderId("unknown")).toBeNull();
  });

  it("filters enabled and disabled providers by capability", () => {
    expect(listEnabledIntegrationProviders("email").map((provider) => provider.id)).toEqual([
      "gmail",
      "outlook"
    ]);
    expect(listEnabledIntegrationProviders("calendar").map((provider) => provider.id)).toEqual([
      "google_calendar",
      "outlook"
    ]);
    expect(listDisabledIntegrationProviders()).toEqual([]);
  });

  it("answers capability checks through provider metadata", () => {
    expect(getIntegrationProviderCapabilities("google calendar")).toEqual(["calendar"]);
    expect(isIntegrationProviderEnabled("outlook")).toBe(true);
    expect(supportsIntegrationCapability("gmail", "calendar")).toBe(false);
    expect(supportsIntegrationCapability("outlook", "calendar")).toBe(true);
  });
});
