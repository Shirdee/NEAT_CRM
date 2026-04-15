const whitespacePattern = /\s+/g;

export const INTEGRATION_PROVIDER_IDS = ["gmail", "google_calendar", "outlook"] as const;

export type IntegrationProviderId = (typeof INTEGRATION_PROVIDER_IDS)[number];

export type IntegrationCapability = "email" | "calendar";

export type IntegrationProviderDefinition = {
  id: IntegrationProviderId;
  label: string;
  enabled: boolean;
  capabilities: readonly IntegrationCapability[];
};

export const INTEGRATION_PROVIDERS = {
  gmail: {
    id: "gmail",
    label: "Gmail",
    enabled: true,
    capabilities: ["email"] as const
  },
  google_calendar: {
    id: "google_calendar",
    label: "Google Calendar",
    enabled: true,
    capabilities: ["calendar"] as const
  },
  outlook: {
    id: "outlook",
    label: "Outlook",
    enabled: true,
    capabilities: ["email", "calendar"] as const
  }
} satisfies Record<IntegrationProviderId, IntegrationProviderDefinition>;

const INTEGRATION_PROVIDER_ALIASES: Record<string, IntegrationProviderId> = {
  gmail: "gmail",
  "google mail": "gmail",
  google_calendar: "google_calendar",
  "google-calendar": "google_calendar",
  "google calendar": "google_calendar",
  outlook: "outlook",
  "microsoft outlook": "outlook",
  microsoft: "outlook"
};

function normalizeLookupValue(value: string) {
  return value.trim().toLowerCase().replace(whitespacePattern, " ");
}

function normalizeProviderKey(value: string) {
  return normalizeLookupValue(value).replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}

function providerHasCapability(
  capabilities: readonly IntegrationCapability[],
  capability: IntegrationCapability
) {
  return capabilities.some((value) => value === capability);
}

function getNormalizedProviderId(value: string): IntegrationProviderId | null {
  const lookupValue = normalizeLookupValue(value);

  return INTEGRATION_PROVIDER_ALIASES[lookupValue] ?? INTEGRATION_PROVIDER_ALIASES[normalizeProviderKey(value)] ?? null;
}

export function normalizeIntegrationProviderId(value: string): IntegrationProviderId | null {
  return getNormalizedProviderId(value);
}

export function getIntegrationProvider(providerId: IntegrationProviderId) {
  return INTEGRATION_PROVIDERS[providerId];
}

export function listIntegrationProviders() {
  return INTEGRATION_PROVIDER_IDS.map((providerId) => INTEGRATION_PROVIDERS[providerId]);
}

export function listEnabledIntegrationProviders(capability?: IntegrationCapability) {
  return listIntegrationProviders().filter((provider) => {
    if (!provider.enabled) {
      return false;
    }

    return capability ? providerHasCapability(provider.capabilities, capability) : true;
  });
}

export function listDisabledIntegrationProviders(capability?: IntegrationCapability) {
  return listIntegrationProviders().filter((provider) => {
    if (provider.enabled) {
      return false;
    }

    return capability ? providerHasCapability(provider.capabilities, capability) : true;
  });
}

export function getIntegrationProviderCapabilities(providerId: string) {
  const normalizedProviderId = getNormalizedProviderId(providerId);

  return normalizedProviderId ? INTEGRATION_PROVIDERS[normalizedProviderId].capabilities : [];
}

export function isIntegrationProviderEnabled(providerId: string) {
  const normalizedProviderId = getNormalizedProviderId(providerId);

  return normalizedProviderId ? INTEGRATION_PROVIDERS[normalizedProviderId].enabled : false;
}

export function supportsIntegrationCapability(providerId: string, capability: IntegrationCapability) {
  return providerHasCapability(getIntegrationProviderCapabilities(providerId), capability);
}
