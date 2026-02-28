import { NextResponse } from "next/server";
import { getMobileSession } from "@/lib/auth/mobile-session";
import * as staffService from "@/services/staff.service";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ patrolLogId: string }> }
) {
  try {
    const session = await getMobileSession(request);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { patrolLogId } = await params;
    const patrol = await staffService.getPatrolLog(patrolLogId);
    if (!patrol) return NextResponse.json({ error: "Patrol log not found" }, { status: 404 });

    return NextResponse.json({ patrol });
  } catch (error) {
    console.error("[Staff Patrol Detail] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
