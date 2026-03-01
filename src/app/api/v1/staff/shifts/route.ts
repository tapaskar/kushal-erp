import { NextResponse } from "next/server";
import { getMobileSession } from "@/lib/auth/mobile-session";
import * as staffService from "@/services/staff.service";

export async function GET(request: Request) {
  try {
    const session = await getMobileSession(request);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (!session.staffId) {
      return NextResponse.json({ error: "Not a staff session" }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const from = searchParams.get("from") || undefined;
    const to = searchParams.get("to") || undefined;

    const shifts = await staffService.getShiftsForStaff(session.staffId, from, to);
    return NextResponse.json({ shifts });
  } catch (error) {
    console.error("[Staff Shifts] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
