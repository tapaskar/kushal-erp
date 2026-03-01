import { NextResponse } from "next/server";
import { getMobileSession } from "@/lib/auth/mobile-session";
import * as staffService from "@/services/staff.service";
import { db } from "@/db";
import { societies, staff } from "@/db/schema";
import { eq } from "drizzle-orm";
import { isInsideGeofence } from "@/lib/geo-utils";

export async function POST(request: Request) {
  try {
    const session = await getMobileSession(request);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (!session.staffId) {
      return NextResponse.json({ error: "Not a staff session" }, { status: 400 });
    }

    const { shiftId, lat, lng, photoUrl } = await request.json();
    if (!shiftId || !lat || !lng) {
      return NextResponse.json({ error: "shiftId, lat, and lng are required" }, { status: 400 });
    }

    // Geofence validation
    const [staffMember] = await db
      .select({ societyId: staff.societyId })
      .from(staff)
      .where(eq(staff.id, session.staffId))
      .limit(1);

    if (staffMember) {
      const [society] = await db
        .select({
          geofenceLat: societies.geofenceLat,
          geofenceLng: societies.geofenceLng,
          geofenceRadiusMeters: societies.geofenceRadiusMeters,
        })
        .from(societies)
        .where(eq(societies.id, staffMember.societyId))
        .limit(1);

      if (society?.geofenceLat && society?.geofenceLng) {
        const inside = isInsideGeofence(
          parseFloat(lat),
          parseFloat(lng),
          parseFloat(society.geofenceLat),
          parseFloat(society.geofenceLng),
          society.geofenceRadiusMeters || 200
        );

        if (!inside) {
          return NextResponse.json(
            {
              error: "You are outside the campus geofence. Please move closer to the campus to check in.",
              code: "OUTSIDE_GEOFENCE",
            },
            { status: 403 }
          );
        }
      }
    }

    const shift = await staffService.checkIn(shiftId, { lat, lng, photoUrl });
    return NextResponse.json({ shift });
  } catch (error) {
    console.error("[Staff Check-In] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
