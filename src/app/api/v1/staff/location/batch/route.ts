import { NextResponse } from "next/server";
import { getMobileSession } from "@/lib/auth/mobile-session";
import * as staffService from "@/services/staff.service";

export async function POST(request: Request) {
  try {
    const session = await getMobileSession(request);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { points } = await request.json();
    if (!Array.isArray(points) || points.length === 0) {
      return NextResponse.json({ error: "points array is required" }, { status: 400 });
    }
    if (points.length > 100) {
      return NextResponse.json({ error: "Maximum 100 points per request" }, { status: 400 });
    }

    const currentShift = await staffService.getCurrentShift(session.staffId);

    const logs = points.map((p: {
      latitude: string;
      longitude: string;
      accuracy?: string;
      altitude?: string;
      speed?: string;
      heading?: string;
      source?: string;
      batteryLevel?: string;
      isMoving?: boolean;
      recordedAt: string;
    }) => ({
      societyId: session.societyId,
      staffId: session.staffId,
      shiftId: currentShift?.id,
      latitude: p.latitude,
      longitude: p.longitude,
      accuracy: p.accuracy,
      altitude: p.altitude,
      speed: p.speed,
      heading: p.heading,
      source: p.source as "gps" | "geofence_enter" | "geofence_exit" | "beacon" | "manual" | undefined,
      batteryLevel: p.batteryLevel,
      isMoving: p.isMoving,
      recordedAt: new Date(p.recordedAt),
    }));

    const result = await staffService.batchInsertLocationLogs(logs);
    return NextResponse.json({ inserted: result.length });
  } catch (error) {
    console.error("[Staff Location Batch] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
