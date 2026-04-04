"use server";

import {revalidatePath} from "next/cache";
import {redirect} from "next/navigation";

import {canManageAdminLists, getCurrentSession, isLocale} from "@/lib/auth/session";
import {commitImportBatch, updateImportRow} from "@/lib/import/repository";
import type {DuplicateDecision, ImportEntityType, ImportRowReviewState} from "@/lib/import/types";

async function requireAdmin(locale: string) {
  const session = await getCurrentSession();

  if (!session) {
    redirect(`/${locale}/login`);
  }

  if (!canManageAdminLists(session.role)) {
    redirect(`/${locale}/access-denied`);
  }

  return session;
}

export async function commitImportBatchAction(formData: FormData) {
  const localeValue = String(formData.get("locale") ?? "en");
  const locale = isLocale(localeValue) ? localeValue : "en";
  const batchId = String(formData.get("batchId") ?? "");
  const allowWarnings = String(formData.get("allowWarnings") ?? "") === "1";
  const session = await requireAdmin(locale);

  if (!batchId) {
    redirect(`/${locale}/admin/imports?error=missing-batch`);
  }

  try {
    await commitImportBatch({
      batchId,
      userId: session.id,
      allowWarnings
    });
  } catch (error) {
    const message =
      error instanceof Error ? encodeURIComponent(error.message) : "Commit%20failed";
    redirect(`/${locale}/admin/imports?batch=${batchId}&error=${message}`);
  }

  revalidatePath(`/${locale}/admin/imports`);
  redirect(`/${locale}/admin/imports?batch=${batchId}&success=committed`);
}

export async function updateImportRowAction(formData: FormData) {
  const localeValue = String(formData.get("locale") ?? "en");
  const locale = isLocale(localeValue) ? localeValue : "en";
  const batchId = String(formData.get("batchId") ?? "");
  const rowId = String(formData.get("rowId") ?? "");
  await requireAdmin(locale);

  if (!batchId || !rowId) {
    redirect(`/${locale}/admin/imports?error=missing-row`);
  }

  const rawFields = Array.from(formData.entries()).reduce<Record<string, string>>(
    (accumulator, [key, value]) => {
      if (key.startsWith("field:")) {
        accumulator[key.slice("field:".length)] = String(value ?? "");
      }

      return accumulator;
    },
    {}
  );
  const reviewState = String(formData.get("reviewState") ?? "review") as ImportRowReviewState;
  const entityOverrideValue = String(formData.get("entityOverride") ?? "");
  const duplicateDecision = String(formData.get("duplicateDecision") ?? "auto") as DuplicateDecision;
  const existingTargetId = String(formData.get("existingTargetId") ?? "").trim() || null;
  const existingTargetLabel = String(formData.get("existingTargetLabel") ?? "").trim() || null;
  const lookupOverrides = Array.from(formData.entries()).reduce<Record<string, string | null>>(
    (accumulator, [key, value]) => {
      if (key.startsWith("lookup:")) {
        accumulator[key.slice("lookup:".length)] = String(value ?? "").trim() || null;
      }

      return accumulator;
    },
    {}
  );

  try {
    await updateImportRow({
      batchId,
      rowId,
      rawFields,
      reviewDecision: {
        reviewState,
        entityOverride: entityOverrideValue ? (entityOverrideValue as ImportEntityType) : null,
        duplicateDecision,
        existingTargetId,
        existingTargetLabel,
        lookupOverrides
      }
    });
  } catch (error) {
    const message =
      error instanceof Error ? encodeURIComponent(error.message) : "Update%20failed";
    redirect(`/${locale}/admin/imports?batch=${batchId}&error=${message}`);
  }

  revalidatePath(`/${locale}/admin/imports`);
  redirect(`/${locale}/admin/imports?batch=${batchId}&success=updated`);
}
