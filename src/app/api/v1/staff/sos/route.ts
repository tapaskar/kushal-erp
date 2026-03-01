import { NextResponse } from "next/server";
import { getMobileSession } from "@/lib/auth/mobile-session";
import * as securityService from "@/services/security.service";

export async function POST(request: Request) {
  try {
    const session = await getMobileSession(request);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (!session.staffId) {
      return NextResponse.json({ error: "Not a staff session" }, { status: 400 });
    }

    const body = await request.json();
    const alert = await securityService.createSosAlert({
      societyId: session.societyId,
      staffId: session.staffId,
      latitude: body.latitude,
      longitude: body.longitude,
      message: body.message,
    });

    return NextResponse.json({ alert }, { status: 201 });
  } catch (error) {
    console.error("[SOS Alert] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
