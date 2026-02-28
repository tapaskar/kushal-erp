import { NextResponse } from "next/server";
import { getMobileSession } from "@/lib/auth/mobile-session";
import * as hkService from "@/services/housekeeping.service";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ logId: string }> }
) {
  try {
    const session = await getMobileSession(request);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { logId } = await params;
    const log = await hkService.startCleaning(logId, session.staffId);
    return NextResponse.json({ log });
  } catch (error) {
    console.error("[Cleaning Start] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
