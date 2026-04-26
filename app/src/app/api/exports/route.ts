import {NextResponse} from "next/server";

import {
  buildCrmExportArtifact,
  crmExportFormats,
  crmExportLocales,
  crmExportModules
} from "@/lib/export/crm-export";
import {getCurrentSession} from "@/lib/auth/session";

function isSupportedModule(value: string | null): value is (typeof crmExportModules)[number] {
  return Boolean(value && crmExportModules.includes(value as (typeof crmExportModules)[number]));
}

function isSupportedFormat(value: string | null): value is (typeof crmExportFormats)[number] {
  return Boolean(value && crmExportFormats.includes(value as (typeof crmExportFormats)[number]));
}

function isSupportedLocale(value: string | null): value is (typeof crmExportLocales)[number] {
  return Boolean(value && crmExportLocales.includes(value as (typeof crmExportLocales)[number]));
}

function collectSelectedIds(searchParams: URLSearchParams) {
  return searchParams
    .getAll("selectedIds")
    .flatMap((value) => value.split(","))
    .map((value) => value.trim())
    .filter((value) => value.length > 0);
}

function parseFilters(module: string, searchParams: URLSearchParams) {
  switch (module) {
    case "companies":
      return {
        query: searchParams.get("q") ?? undefined,
        sourceValueId: searchParams.get("source") ?? undefined,
        stageValueId: searchParams.get("stage") ?? undefined
      };
    case "contacts":
      return {
        query: searchParams.get("q") ?? undefined,
        companyId: searchParams.get("companyId") ?? undefined
      };
    case "interactions":
      return {
        query: searchParams.get("q") ?? undefined,
        companyId: searchParams.get("companyId") ?? undefined,
        contactId: searchParams.get("contactId") ?? undefined,
        interactionTypeValueId: searchParams.get("interactionTypeValueId") ?? undefined
      };
    case "tasks":
      return {
        query: searchParams.get("q") ?? undefined,
        companyId: searchParams.get("companyId") ?? undefined,
        contactId: searchParams.get("contactId") ?? undefined,
        statusValueId: searchParams.get("statusValueId") ?? undefined
      };
    case "opportunities":
      return {
        query: searchParams.get("q") ?? undefined,
        companyId: searchParams.get("companyId") ?? undefined,
        contactId: searchParams.get("contactId") ?? undefined,
        opportunityStageValueId: searchParams.get("stage") ?? undefined,
        opportunityTypeValueId: searchParams.get("type") ?? undefined,
        statusValueId: searchParams.get("status") ?? undefined
      };
    default:
      return null;
  }
}

export async function GET(request: Request) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({error: "Forbidden"}, {status: 403});
    }

    const {searchParams} = new URL(request.url);
    const moduleName = searchParams.get("module");
    const format = searchParams.get("format");
    const locale = searchParams.get("locale");

    if (
      !isSupportedModule(moduleName) ||
      !isSupportedFormat(format) ||
      !isSupportedLocale(locale)
    ) {
      return NextResponse.json({error: "Invalid export request"}, {status: 400});
    }

    const filters = parseFilters(moduleName, searchParams);
    if (!filters) {
      return NextResponse.json({error: "Invalid export request"}, {status: 400});
    }

    const artifact = await buildCrmExportArtifact({
      module: moduleName,
      format,
      locale,
      filters: filters as never,
      selectedIds: collectSelectedIds(searchParams)
    });

    return new NextResponse(artifact.buffer as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": artifact.contentType,
        "Content-Disposition": `attachment; filename="${artifact.filename}"`
      }
    });
  } catch (error) {
    console.error("Failed to build export", error);
    return NextResponse.json(
      {error: error instanceof Error ? error.message : "Failed to build export."},
      {status: 500}
    );
  }
}
