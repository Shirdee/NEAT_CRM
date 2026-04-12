"use server";

import {revalidatePath} from "next/cache";

import {getCurrentSession} from "@/lib/auth/session";
import type {SavedViewFilters, SavedViewModule} from "@/lib/data/saved-views.shared";
import {createSavedViewFromFilters, deleteSavedView, renameSavedView} from "@/lib/data/saved-views";

type ActionResult =
  | {ok: true; id: string}
  | {ok: false; message: string};

function modulePath(module: SavedViewModule) {
  switch (module) {
    case "companies":
      return "/companies";
    case "tasks":
      return "/tasks";
    case "opportunities":
      return "/opportunities";
  }
}

export async function createSavedViewAction<M extends SavedViewModule>(input: {
  locale: "en" | "he";
  module: M;
  name: string;
  filters: SavedViewFilters<M>;
}): Promise<ActionResult> {
  const session = await getCurrentSession();

  if (!session) {
    return {ok: false, message: "Not signed in."};
  }

  try {
    const view = await createSavedViewFromFilters({
      userId: session.id,
      module: input.module,
      name: input.name,
      filters: input.filters
    });

    revalidatePath(`/${input.locale}${modulePath(input.module)}`);
    return {ok: true, id: view.id};
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Failed to save view."
    };
  }
}

export async function renameSavedViewAction(input: {
  locale: "en" | "he";
  module: SavedViewModule;
  id: string;
  name: string;
}): Promise<ActionResult> {
  const session = await getCurrentSession();

  if (!session) {
    return {ok: false, message: "Not signed in."};
  }

  try {
    const updated = await renameSavedView({
      userId: session.id,
      module: input.module,
      id: input.id,
      name: input.name
    });

    if (!updated) {
      return {ok: false, message: "Saved view not found."};
    }

    revalidatePath(`/${input.locale}${modulePath(input.module)}`);
    return {ok: true, id: updated.id};
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Failed to rename view."
    };
  }
}

export async function deleteSavedViewAction(input: {
  locale: "en" | "he";
  module: SavedViewModule;
  id: string;
}): Promise<ActionResult> {
  const session = await getCurrentSession();

  if (!session) {
    return {ok: false, message: "Not signed in."};
  }

  try {
    const deleted = await deleteSavedView({
      userId: session.id,
      module: input.module,
      id: input.id
    });

    if (!deleted) {
      return {ok: false, message: "Saved view not found."};
    }

    revalidatePath(`/${input.locale}${modulePath(input.module)}`);
    return {ok: true, id: input.id};
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Failed to delete view."
    };
  }
}

