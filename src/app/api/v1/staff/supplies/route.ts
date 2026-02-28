import { NextResponse } from "next/server";
import { getMobileSession } from "@/lib/auth/mobile-session";
import * as hkService from "@/services/housekeeping.service";

export async function GET(request: Request) {
  try {
    const session = await getMobileSession(request);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || undefined;

    const requests = await hkService.getSupplyRequests(session.societyId, {
      status,
      staffId: session.staffId,
    });
    return NextResponse.json({ requests });
  } catch (error) {
    console.error("[Staff Supplies GET] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getMobileSession(request);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const supplyRequest = await hkService.createSupplyRequest({
      societyId: session.societyId,
      staffId: session.staffId,
      itemName: body.itemName,
      quantity: body.quantity,
      urgency: body.urgency,
      reason: body.reason,
    });

    return NextResponse.json({ request: supplyRequest }, { status: 201 });
  } catch (error) {
    console.error("[Staff Supplies POST] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
