import { NextResponse } from "next/server";
import { getMobileSession } from "@/lib/auth/mobile-session";
import * as staffService from "@/services/staff.service";

export async function GET(request: Request) {
  try {
    const session = await getMobileSession(request);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const shift = await staffService.getCurrentShift(session.staffId);
    return NextResponse.json({ shift: shift || null });
  } catch (error) {
    console.error("[Staff Current Shift] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
