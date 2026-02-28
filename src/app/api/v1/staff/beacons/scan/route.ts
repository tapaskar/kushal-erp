import { NextResponse } from "next/server";
import { getMobileSession } from "@/lib/auth/mobile-session";
import * as staffService from "@/services/staff.service";

export async function POST(request: Request) {
  try {
    const session = await getMobileSession(request);
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { beaconId } = await request.json();
    if (!beaconId) {
      return NextResponse.json(
        { error: "beaconId is required" },
        { status: 400 }
      );
    }

    // Look up the beacon
    const beacon = await staffService.getBeaconById(beaconId);
    if (!beacon || beacon.societyId !== session.societyId) {
      return NextResponse.json(
        { error: "Beacon not found" },
        { status: 404 }
      );
    }

    const now = new Date();

    // Create a beacon event with eventType "qr_scan"
    await staffService.batchInsertBeaconEvents([
      {
        societyId: session.societyId,
        staffId: session.staffId,
        beaconId: beacon.id,
        eventType: "qr_scan",
        recordedAt: now,
      },
    ]);

    // Create a location log with source "beacon" using the beacon's coordinates
    if (beacon.latitude && beacon.longitude) {
      await staffService.batchInsertLocationLogs([
        {
          societyId: session.societyId,
          staffId: session.staffId,
          latitude: beacon.latitude,
          longitude: beacon.longitude,
          source: "beacon",
          recordedAt: now,
        },
      ]);
    }

    return NextResponse.json({
      success: true,
      beacon: {
        id: beacon.id,
        label: beacon.label,
        location: beacon.location,
        floor: beacon.floor,
      },
    });
  } catch (error) {
    console.error("[Staff Beacon Scan] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
