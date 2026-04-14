"use server";

import {revalidatePath} from "next/cache";

import {getCurrentSession, isLocale} from "@/lib/auth/session";
import {getCompanyFormOptions, getOpportunityFormOptions} from "@/lib/data/crm";
import {prisma} from "@/lib/prisma/client";

type ActionResult =
  | {ok: true}
  | {ok: false; message: string};

function requireAdmin() {
  return getCurrentSession().then((session) => {
    if (!session) {
      throw new Error("Not signed in.");
    }
    if (session.role !== "admin") {
      throw new Error("Admin access required.");
    }
    return session;
  });
}

function safeIds(input: unknown) {
  if (!Array.isArray(input)) return [];
  return input
    .map((value) => (typeof value === "string" ? value.trim() : ""))
    .filter(Boolean);
}

function ensureAllowedValue(
  value: string | undefined,
  allowedIds: Set<string>,
  message: string
) {
  if (!value) {
    return;
  }

  if (!allowedIds.has(value)) {
    throw new Error(message);
  }
}

export async function batchUpdateCompaniesAction(input: {
  locale: string;
  ids: string[];
  sourceValueId?: string;
  stageValueId?: string;
}): Promise<ActionResult> {
  const locale = isLocale(input.locale) ? input.locale : "en";

  try {
    await requireAdmin();
    const ids = safeIds(input.ids);
    const sourceValueId = input.sourceValueId?.trim() || undefined;
    const stageValueId = input.stageValueId?.trim() || undefined;

    if (ids.length === 0) {
      return {ok: false, message: "Select at least one company."};
    }

    if (!sourceValueId && !stageValueId) {
      return {ok: false, message: "Choose at least one field to update."};
    }

    const {sourceOptions, stageOptions} = await getCompanyFormOptions();
    ensureAllowedValue(
      sourceValueId,
      new Set(sourceOptions.map((option) => option.id)),
      "Invalid company source."
    );
    ensureAllowedValue(
      stageValueId,
      new Set(stageOptions.map((option) => option.id)),
      "Invalid company stage."
    );

    await prisma.company.updateMany({
      where: {id: {in: ids}},
      data: {
        sourceValueId,
        stageValueId
      }
    });

    revalidatePath(`/${locale}/companies`);
    revalidatePath(`/${locale}/dashboard`);
    return {ok: true};
  } catch (error) {
    return {ok: false, message: error instanceof Error ? error.message : "Batch update failed."};
  }
}

export async function batchUpdateOpportunitiesAction(input: {
  locale: string;
  ids: string[];
  opportunityStageValueId?: string;
  statusValueId?: string;
}): Promise<ActionResult> {
  const locale = isLocale(input.locale) ? input.locale : "en";

  try {
    await requireAdmin();
    const ids = safeIds(input.ids);
    const opportunityStageValueId = input.opportunityStageValueId?.trim() || undefined;
    const statusValueId = input.statusValueId?.trim() || undefined;

    if (ids.length === 0) {
      return {ok: false, message: "Select at least one opportunity."};
    }

    if (!opportunityStageValueId && !statusValueId) {
      return {ok: false, message: "Choose at least one field to update."};
    }

    const {stageOptions, statusOptions} = await getOpportunityFormOptions();
    ensureAllowedValue(
      opportunityStageValueId,
      new Set(stageOptions.map((option) => option.id)),
      "Invalid opportunity stage."
    );
    ensureAllowedValue(
      statusValueId,
      new Set(statusOptions.map((option) => option.id)),
      "Invalid opportunity status."
    );

    await prisma.opportunity.updateMany({
      where: {id: {in: ids}},
      data: {
        opportunityStageValueId,
        statusValueId
      }
    });

    revalidatePath(`/${locale}/opportunities`);
    revalidatePath(`/${locale}/dashboard`);
    return {ok: true};
  } catch (error) {
    return {ok: false, message: error instanceof Error ? error.message : "Batch update failed."};
  }
}
