import { NextResponse } from "next/server";
import { getMobileSession } from "@/lib/auth/mobile-session";
import * as staffService from "@/services/staff.service";

export async function POST(request: Request) {
  try {
    const session = await getMobileSession(request);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { events } = await request.json();
    if (!Array.isArray(events) || events.length === 0) {
      return NextResponse.json({ error: "events array is required" }, { status: 400 });
    }

    const mapped = events.map((e: {
      beaconId: string;
      shiftId?: string;
      eventType: string;
      rssi?: number;
      dwellSeconds?: number;
      recordedAt: string;
    }) => ({
      societyId: session.societyId,
      staffId: session.staffId,
      beaconId: e.beaconId,
      shiftId: e.shiftId,
      eventType: e.eventType,
      rssi: e.rssi,
      dwellSeconds: e.dwellSeconds,
      recordedAt: new Date(e.recordedAt),
    }));

    const result = await staffService.batchInsertBeaconEvents(mapped);
    return NextResponse.json({ inserted: result.length });
  } catch (error) {
    console.error("[Staff Beacon Events] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
