import { NextResponse } from "next/server";
import { getMobileSession } from "@/lib/auth/mobile-session";
import * as staffService from "@/services/staff.service";

export async function POST(request: Request) {
  try {
    const session = await getMobileSession(request);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { shiftId, lat, lng, photoUrl } = await request.json();
    if (!shiftId || !lat || !lng) {
      return NextResponse.json({ error: "shiftId, lat, and lng are required" }, { status: 400 });
    }

    const shift = await staffService.checkOut(shiftId, { lat, lng, photoUrl });
    return NextResponse.json({ shift });
  } catch (error) {
    console.error("[Staff Check-Out] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
