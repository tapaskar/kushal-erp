import { NextResponse } from "next/server";
import { getMobileSession } from "@/lib/auth/mobile-session";
import * as staffService from "@/services/staff.service";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ patrolLogId: string }> }
) {
  try {
    const session = await getMobileSession(request);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { patrolLogId } = await params;
    const patrol = await staffService.completePatrol(patrolLogId);
    return NextResponse.json({ patrol });
  } catch (error) {
    console.error("[Staff Patrol Complete] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
