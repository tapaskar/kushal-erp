import { NextResponse } from "next/server";
import { getMobileSession } from "@/lib/auth/mobile-session";
import * as securityService from "@/services/security.service";

export async function GET(request: Request) {
  try {
    const session = await getMobileSession(request);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (!session.staffId) {
      return NextResponse.json({ error: "Not a staff session" }, { status: 400 });
    }

    const incidents = await securityService.getIncidentsByStaff(session.staffId);
    return NextResponse.json({ incidents });
  } catch (error) {
    console.error("[Staff Incidents GET] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getMobileSession(request);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (!session.staffId) {
      return NextResponse.json({ error: "Not a staff session" }, { status: 400 });
    }

    const body = await request.json();
    const incident = await securityService.createIncident({
      societyId: session.societyId,
      reportedBy: session.staffId,
      severity: body.severity,
      title: body.title,
      description: body.description,
      location: body.location,
      latitude: body.latitude,
      longitude: body.longitude,
      photoUrls: body.photoUrls,
    });

    return NextResponse.json({ incident }, { status: 201 });
  } catch (error) {
    console.error("[Staff Incidents POST] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
