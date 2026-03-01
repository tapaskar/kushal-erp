import { NextResponse } from "next/server";
import { getMobileSession } from "@/lib/auth/mobile-session";
import * as hkService from "@/services/housekeeping.service";

export async function GET(request: Request) {
  try {
    const session = await getMobileSession(request);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (!session.staffId) {
      return NextResponse.json({ error: "Not a staff session" }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date") || new Date().toISOString().split("T")[0];

    const schedule = await hkService.getCleaningLogsForStaff(session.staffId, date);
    return NextResponse.json({ schedule });
  } catch (error) {
    console.error("[Staff Cleaning GET] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
