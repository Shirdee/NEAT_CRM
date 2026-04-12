export const SAVED_VIEW_QUERY_PARAM = "view";

export const SAVED_VIEW_FILTER_KEYS = {
  companies: ["q", "source", "stage"],
  tasks: ["q", "companyId", "contactId", "statusValueId"],
  opportunities: ["q", "companyId", "contactId", "stage", "type", "status"]
} as const;

export type SavedViewModule = keyof typeof SAVED_VIEW_FILTER_KEYS;

type FilterKey<M extends SavedViewModule> = (typeof SAVED_VIEW_FILTER_KEYS)[M][number];

export type SavedViewFilters<M extends SavedViewModule> = Partial<Record<FilterKey<M>, string>>;

