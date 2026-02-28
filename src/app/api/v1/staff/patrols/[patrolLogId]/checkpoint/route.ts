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
    const { checkpointIndex, label, latitude, longitude, photoUrl, beaconDetected, notes } =
      await request.json();

    if (checkpointIndex === undefined || !label) {
      return NextResponse.json(
        { error: "checkpointIndex and label are required" },
        { status: 400 }
      );
    }

    const patrol = await staffService.recordCheckpoint(patrolLogId, {
      checkpointIndex,
      label,
      visitedAt: new Date().toISOString(),
      latitude,
      longitude,
      photoUrl,
      beaconDetected,
      notes,
    });
    return NextResponse.json({ patrol });
  } catch (error) {
    console.error("[Staff Patrol Checkpoint] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
