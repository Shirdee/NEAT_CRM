const whitespacePattern = /\s+/g;

function normalizeGeneric(value: string) {
  return value.trim().replace(whitespacePattern, " ");
}

export function normalizeLookupValue(value: string) {
  return normalizeGeneric(value).toLowerCase();
}

export function normalizeMachineKey(value: string) {
  return normalizeGeneric(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export function normalizeCompanyName(value: string) {
  return normalizeLookupValue(value).replace(/\b(inc|ltd|llc|corp|co)\b/g, "").trim();
}

export function normalizePersonName(value: string) {
  return normalizeLookupValue(value);
}

export function normalizePhoneNumber(value: string) {
  return value.replace(/[^\d+]/g, "");
}

export function normalizeDateInput(value: string) {
  const normalized = normalizeGeneric(value);

  if (!normalized) {
    return null;
  }

  const parsed = new Date(normalized);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed.toISOString();
}

export function extractWebsiteDomain(value: string) {
  const normalized = normalizeGeneric(value);

  if (!normalized) {
    return null;
  }

  try {
    const url = new URL(normalized.startsWith("http") ? normalized : `https://${normalized}`);
    return url.hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return null;
  }
}

export function splitMultiValue(value: string) {
  return normalizeGeneric(value)
    .split(/[\n,;/|]+/)
    .map((item) => normalizeGeneric(item))
    .filter(Boolean);
}

export function detectCellLanguage(value: string) {
  const hasHebrew = /[\u0590-\u05FF]/.test(value);
  const hasLatin = /[A-Za-z]/.test(value);

  if (hasHebrew && hasLatin) {
    return "mixed";
  }

  if (hasHebrew) {
    return "he";
  }

  if (hasLatin) {
    return "en";
  }

  return "neutral";
}

export function normalizeDisplayValue(value: string) {
  return normalizeGeneric(value);
}
