import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import * as hkService from "@/services/housekeeping.service";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ logId: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { logId } = await params;
    const body = await request.json();

    if (!body.rating || body.rating < 1 || body.rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    const log = await hkService.rateCleaning(
      logId,
      body.rating,
      body.comment,
      session.userId
    );
    return NextResponse.json({ log });
  } catch (error) {
    console.error("[Resident Cleaning Rate] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
