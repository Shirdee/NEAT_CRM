import {NextResponse} from "next/server";

import {canManageAdminLists, getCurrentSession} from "@/lib/auth/session";
import {stageImportRows} from "@/lib/import/repository";
import type {StageableImportRow} from "@/lib/import/types";

type RouteContext = {
  params: Promise<{batchId: string}>;
};

export async function POST(request: Request, {params}: RouteContext) {
  try {
    const session = await getCurrentSession();

    if (!session || !canManageAdminLists(session.role)) {
      return NextResponse.json({error: "Forbidden"}, {status: 403});
    }

    const {batchId} = await params;
    const body = (await request.json()) as {
      rows?: StageableImportRow[];
    };

    if (!batchId || !body.rows?.length) {
      return NextResponse.json({error: "Missing staged rows"}, {status: 400});
    }

    const result = await stageImportRows({
      batchId,
      rows: body.rows
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to stage import rows", error);
    return NextResponse.json(
      {error: error instanceof Error ? error.message : "Failed while staging workbook rows."},
      {status: 500}
    );
  }
}
