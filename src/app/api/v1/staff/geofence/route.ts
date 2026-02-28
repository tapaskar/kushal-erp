import { NextResponse } from "next/server";
import { getMobileSession } from "@/lib/auth/mobile-session";
import { db } from "@/db";
import { societies, staff } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const session = await getMobileSession(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get staff's society
    const [staffMember] = await db
      .select({ societyId: staff.societyId })
      .from(staff)
      .where(eq(staff.id, session.staffId))
      .limit(1);

    if (!staffMember) {
      return NextResponse.json({ error: "Staff not found" }, { status: 404 });
    }

    // Get society geofence config
    const [society] = await db
      .select({
        geofenceLat: societies.geofenceLat,
        geofenceLng: societies.geofenceLng,
        geofenceRadiusMeters: societies.geofenceRadiusMeters,
      })
      .from(societies)
      .where(eq(societies.id, staffMember.societyId))
      .limit(1);

    if (
      !society ||
      !society.geofenceLat ||
      !society.geofenceLng
    ) {
      return NextResponse.json({
        geofence: null,
        message: "No geofence configured for this society",
      });
    }

    return NextResponse.json({
      geofence: {
        lat: parseFloat(society.geofenceLat),
        lng: parseFloat(society.geofenceLng),
        radius: society.geofenceRadiusMeters || 200,
      },
    });
  } catch (error) {
    console.error("[Geofence Config] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
