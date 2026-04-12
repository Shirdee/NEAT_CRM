import {randomUUID} from "node:crypto";

import type {SavedViewFilters, SavedViewModule} from "./saved-views.shared";
import {SAVED_VIEW_FILTER_KEYS, SAVED_VIEW_QUERY_PARAM} from "./saved-views.shared";
type SearchParamValue = string | string[] | undefined | null;
type SearchParamRecord = Record<string, SearchParamValue>;
type FilterKey<M extends SavedViewModule> = (typeof SAVED_VIEW_FILTER_KEYS)[M][number];

type SavedViewRow = {
  id: string;
  userId: string;
  module: SavedViewModule;
  name: string;
  filtersJson: unknown;
  createdAt: Date;
  updatedAt: Date;
};

type FallbackSavedViewRow = SavedViewRow;

function hasDatabaseUrl() {
  return Boolean(process.env.DATABASE_URL?.trim());
}

async function getPrisma() {
  const {prisma} = await import("@/lib/prisma/client");
  return prisma;
}

function normalizeInputValue(value: SearchParamValue) {
  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value)) {
    return typeof value[0] === "string" ? value[0] : "";
  }

  return "";
}

function normalizeSearchParamObject(searchParams: URLSearchParams | SearchParamRecord): SearchParamRecord {
  if (searchParams instanceof URLSearchParams) {
    const result: SearchParamRecord = {};

    for (const [key, value] of searchParams.entries()) {
      result[key] = value;
    }

    return result;
  }

  return searchParams;
}

function sanitizeSavedViewName(name: string) {
  const normalized = name.trim().replace(/\s+/g, " ");

  if (!normalized) {
    throw new Error("Saved view name is required.");
  }

  if (normalized.length > 80) {
    throw new Error("Saved view name must be 80 characters or fewer.");
  }

  return normalized;
}

function sanitizeFilters<M extends SavedViewModule>(
  module: M,
  rawFilters: unknown
): SavedViewFilters<M> {
  if (!rawFilters || typeof rawFilters !== "object" || Array.isArray(rawFilters)) {
    return {} as SavedViewFilters<M>;
  }

  const entries = Object.entries(rawFilters as Record<string, unknown>);
  const allowedKeys = new Set<string>(SAVED_VIEW_FILTER_KEYS[module]);
  const sanitized: Record<string, string> = {};

  for (const [key, value] of entries) {
    if (!allowedKeys.has(key) || typeof value !== "string") {
      continue;
    }

    const normalized = value.trim();
    if (normalized) {
      sanitized[key] = normalized;
    }
  }

  return sanitized as SavedViewFilters<M>;
}

export function sanitizeSavedViewFilters<M extends SavedViewModule>(module: M, rawFilters: unknown) {
  return sanitizeFilters(module, rawFilters);
}

function getSavedViewId(searchParams: URLSearchParams | SearchParamRecord) {
  const params = normalizeSearchParamObject(searchParams);
  const raw = normalizeInputValue(params[SAVED_VIEW_QUERY_PARAM]).trim();
  return raw || null;
}

export function extractSavedViewFilters<M extends SavedViewModule>(
  module: M,
  searchParams: URLSearchParams | SearchParamRecord
): SavedViewFilters<M> {
  const params = normalizeSearchParamObject(searchParams);
  const filters: Record<string, string> = {};

  for (const key of SAVED_VIEW_FILTER_KEYS[module]) {
    const value = normalizeInputValue(params[key]).trim();
    if (value) {
      filters[key] = value;
    }
  }

  return filters as SavedViewFilters<M>;
}

type SavedView<M extends SavedViewModule> = {
  id: string;
  userId: string;
  module: M;
  name: string;
  filters: SavedViewFilters<M>;
  createdAt: Date;
  updatedAt: Date;
};

function mapSavedViewRow<M extends SavedViewModule>(row: SavedViewRow, module: M): SavedView<M> {
  return {
    id: row.id,
    userId: row.userId,
    module,
    name: row.name,
    filters: sanitizeFilters(module, row.filtersJson),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt
  };
}

type FallbackState = {
  views: FallbackSavedViewRow[];
};

const fallbackGlobal = globalThis as typeof globalThis & {
  crmSavedViewFallbackState?: FallbackState;
};

function getFallbackState() {
  if (!fallbackGlobal.crmSavedViewFallbackState) {
    fallbackGlobal.crmSavedViewFallbackState = {views: []};
  }

  return fallbackGlobal.crmSavedViewFallbackState;
}

export function resetSavedViewStoreForTests() {
  fallbackGlobal.crmSavedViewFallbackState = {views: []};
}

function listFallbackViews<M extends SavedViewModule>(userId: string, module: M) {
  return getFallbackState()
    .views
    .filter((view) => view.userId === userId && view.module === module)
    .sort((left, right) => right.updatedAt.getTime() - left.updatedAt.getTime())
    .map((view) => mapSavedViewRow(view, module));
}

function createFallbackView<M extends SavedViewModule>(input: {
  userId: string;
  module: M;
  name: string;
  filters: SavedViewFilters<M>;
}) {
  const views = getFallbackState().views;
  const duplicate = views.find(
    (view) => view.userId === input.userId && view.module === input.module && view.name === input.name
  );

  if (duplicate) {
    throw new Error("Saved view name already exists for this module.");
  }

  const now = new Date();
  const row: FallbackSavedViewRow = {
    id: randomUUID(),
    userId: input.userId,
    module: input.module,
    name: input.name,
    filtersJson: input.filters,
    createdAt: now,
    updatedAt: now
  };

  views.push(row);

  return mapSavedViewRow(row, input.module);
}

function getFallbackViewById<M extends SavedViewModule>(input: {
  userId: string;
  module: M;
  id: string;
}) {
  const row =
    getFallbackState().views.find(
      (view) => view.id === input.id && view.userId === input.userId && view.module === input.module
    ) ?? null;

  return row ? mapSavedViewRow(row, input.module) : null;
}

function renameFallbackView<M extends SavedViewModule>(input: {
  userId: string;
  module: M;
  id: string;
  name: string;
}) {
  const views = getFallbackState().views;
  const duplicate = views.find(
    (view) =>
      view.id !== input.id &&
      view.userId === input.userId &&
      view.module === input.module &&
      view.name === input.name
  );

  if (duplicate) {
    throw new Error("Saved view name already exists for this module.");
  }

  const row = views.find(
    (view) => view.id === input.id && view.userId === input.userId && view.module === input.module
  );

  if (!row) {
    return null;
  }

  row.name = input.name;
  row.updatedAt = new Date();

  return mapSavedViewRow(row, input.module);
}

function updateFallbackViewFilters<M extends SavedViewModule>(input: {
  userId: string;
  module: M;
  id: string;
  filters: SavedViewFilters<M>;
}) {
  const row = getFallbackState().views.find(
    (view) => view.id === input.id && view.userId === input.userId && view.module === input.module
  );

  if (!row) {
    return null;
  }

  row.filtersJson = input.filters;
  row.updatedAt = new Date();

  return mapSavedViewRow(row, input.module);
}

function deleteFallbackView<M extends SavedViewModule>(input: {userId: string; module: M; id: string}) {
  const views = getFallbackState().views;
  const index = views.findIndex(
    (view) => view.id === input.id && view.userId === input.userId && view.module === input.module
  );

  if (index < 0) {
    return false;
  }

  views.splice(index, 1);
  return true;
}

export async function listSavedViews<M extends SavedViewModule>(input: {
  userId: string;
  module: M;
}): Promise<Array<SavedView<M>>> {
  if (!hasDatabaseUrl()) {
    return listFallbackViews(input.userId, input.module);
  }

  const prisma = await getPrisma();
  const views = await prisma.savedView.findMany({
    where: {userId: input.userId, module: input.module},
    orderBy: [{updatedAt: "desc"}, {createdAt: "desc"}]
  });

  return views.map((view) => mapSavedViewRow(view as SavedViewRow, input.module));
}

export async function createSavedView<M extends SavedViewModule>(input: {
  userId: string;
  module: M;
  name: string;
  searchParams: URLSearchParams | SearchParamRecord;
}): Promise<SavedView<M>> {
  const normalizedName = sanitizeSavedViewName(input.name);
  const filters = extractSavedViewFilters(input.module, input.searchParams);

  if (!hasDatabaseUrl()) {
    return createFallbackView({
      userId: input.userId,
      module: input.module,
      name: normalizedName,
      filters
    });
  }

  const prisma = await getPrisma();
  const view = await prisma.savedView.create({
    data: {
      userId: input.userId,
      module: input.module,
      name: normalizedName,
      filtersJson: filters
    }
  });

  return mapSavedViewRow(view as SavedViewRow, input.module);
}

export async function createSavedViewFromFilters<M extends SavedViewModule>(input: {
  userId: string;
  module: M;
  name: string;
  filters: SavedViewFilters<M>;
}): Promise<SavedView<M>> {
  const normalizedName = sanitizeSavedViewName(input.name);
  const filters = sanitizeFilters(input.module, input.filters);

  if (!hasDatabaseUrl()) {
    return createFallbackView({
      userId: input.userId,
      module: input.module,
      name: normalizedName,
      filters
    });
  }

  const prisma = await getPrisma();
  const view = await prisma.savedView.create({
    data: {
      userId: input.userId,
      module: input.module,
      name: normalizedName,
      filtersJson: filters
    }
  });

  return mapSavedViewRow(view as SavedViewRow, input.module);
}

export async function renameSavedView<M extends SavedViewModule>(input: {
  id: string;
  userId: string;
  module: M;
  name: string;
}): Promise<SavedView<M> | null> {
  const normalizedName = sanitizeSavedViewName(input.name);

  if (!hasDatabaseUrl()) {
    return renameFallbackView({...input, name: normalizedName});
  }

  const prisma = await getPrisma();
  const existing = await prisma.savedView.findFirst({
    where: {id: input.id, userId: input.userId, module: input.module}
  });

  if (!existing) {
    return null;
  }

  const view = await prisma.savedView.update({
    where: {id: input.id},
    data: {name: normalizedName}
  });

  return mapSavedViewRow(view as SavedViewRow, input.module);
}

export async function updateSavedViewFilters<M extends SavedViewModule>(input: {
  id: string;
  userId: string;
  module: M;
  searchParams: URLSearchParams | SearchParamRecord;
}): Promise<SavedView<M> | null> {
  const filters = extractSavedViewFilters(input.module, input.searchParams);

  if (!hasDatabaseUrl()) {
    return updateFallbackViewFilters({...input, filters});
  }

  const prisma = await getPrisma();
  const existing = await prisma.savedView.findFirst({
    where: {id: input.id, userId: input.userId, module: input.module}
  });

  if (!existing) {
    return null;
  }

  const view = await prisma.savedView.update({
    where: {id: input.id},
    data: {filtersJson: filters}
  });

  return mapSavedViewRow(view as SavedViewRow, input.module);
}

export async function updateSavedViewFiltersFromFilters<M extends SavedViewModule>(input: {
  id: string;
  userId: string;
  module: M;
  filters: SavedViewFilters<M>;
}): Promise<SavedView<M> | null> {
  const filters = sanitizeFilters(input.module, input.filters);

  if (!hasDatabaseUrl()) {
    return updateFallbackViewFilters({...input, filters});
  }

  const prisma = await getPrisma();
  const existing = await prisma.savedView.findFirst({
    where: {id: input.id, userId: input.userId, module: input.module}
  });

  if (!existing) {
    return null;
  }

  const view = await prisma.savedView.update({
    where: {id: input.id},
    data: {filtersJson: filters}
  });

  return mapSavedViewRow(view as SavedViewRow, input.module);
}

export async function deleteSavedView<M extends SavedViewModule>(input: {
  id: string;
  userId: string;
  module: M;
}) {
  if (!hasDatabaseUrl()) {
    return deleteFallbackView(input);
  }

  const prisma = await getPrisma();
  const deleted = await prisma.savedView.deleteMany({
    where: {
      id: input.id,
      userId: input.userId,
      module: input.module
    }
  });

  return deleted.count > 0;
}

export async function resolveSavedViewFilters<M extends SavedViewModule>(input: {
  module: M;
  userId: string | null | undefined;
  searchParams: URLSearchParams | SearchParamRecord;
}) {
  const routeFilters = extractSavedViewFilters(input.module, input.searchParams);
  const savedViewId = getSavedViewId(input.searchParams);

  if (!savedViewId || !input.userId) {
    return {
      selectedViewId: null,
      selectedView: null,
      filters: routeFilters
    };
  }

  const selectedView = await getSavedViewById({
    id: savedViewId,
    userId: input.userId,
    module: input.module
  });

  if (!selectedView) {
    return {
      selectedViewId: savedViewId,
      selectedView: null,
      filters: routeFilters
    };
  }

  return {
    selectedViewId: savedViewId,
    selectedView,
    filters: {
      ...selectedView.filters,
      ...routeFilters
    }
  };
}

async function getSavedViewById<M extends SavedViewModule>(input: {
  id: string;
  userId: string;
  module: M;
}): Promise<SavedView<M> | null> {
  if (!hasDatabaseUrl()) {
    return getFallbackViewById(input);
  }

  const prisma = await getPrisma();
  const view = await prisma.savedView.findFirst({
    where: {
      id: input.id,
      userId: input.userId,
      module: input.module
    }
  });

  return view ? mapSavedViewRow(view as SavedViewRow, input.module) : null;
}
