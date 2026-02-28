import { NextResponse } from "next/server";
import { getMobileSession } from "@/lib/auth/mobile-session";
import * as securityService from "@/services/security.service";

export async function GET(request: Request) {
  try {
    const session = await getMobileSession(request);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date") || new Date().toISOString().split("T")[0];
    const status = searchParams.get("status") || undefined;

    const visitors = await securityService.getVisitorLogs(session.societyId, {
      date,
      status,
    });
    return NextResponse.json({ visitors });
  } catch (error) {
    console.error("[Staff Visitors GET] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getMobileSession(request);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const visitor = await securityService.createVisitorLog({
      societyId: session.societyId,
      staffId: session.staffId,
      visitorName: body.visitorName,
      visitorPhone: body.visitorPhone,
      visitorType: body.visitorType,
      unitId: body.unitId,
      purpose: body.purpose,
      vehicleNumber: body.vehicleNumber,
      photoUrl: body.photoUrl,
      idProofUrl: body.idProofUrl,
      checkInGate: body.checkInGate,
      notes: body.notes,
    });

    return NextResponse.json({ visitor }, { status: 201 });
  } catch (error) {
    console.error("[Staff Visitors POST] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
