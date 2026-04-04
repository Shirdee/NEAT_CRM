import {NextResponse} from "next/server";

import {canManageAdminLists, getCurrentSession} from "@/lib/auth/session";
import {createImportBatch} from "@/lib/import/repository";
import type {WorkbookProfile} from "@/lib/import/types";

export async function POST(request: Request) {
  try {
    const session = await getCurrentSession();

    if (!session || !canManageAdminLists(session.role)) {
      return NextResponse.json({error: "Forbidden"}, {status: 403});
    }

    const body = (await request.json()) as {
      sourceFilename?: string;
      profile?: WorkbookProfile;
    };

    if (!body.sourceFilename || !body.profile) {
      return NextResponse.json({error: "Missing batch metadata"}, {status: 400});
    }

    const batch = await createImportBatch({
      uploadedById: session.id,
      sourceFilename: body.sourceFilename,
      profile: body.profile
    });

    return NextResponse.json(batch);
  } catch (error) {
    console.error("Failed to create import batch", error);
    return NextResponse.json(
      {error: error instanceof Error ? error.message : "Failed to create import batch."},
      {status: 500}
    );
  }
}
