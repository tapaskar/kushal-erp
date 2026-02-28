import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import * as hkService from "@/services/housekeeping.service";

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session?.societyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date") || new Date().toISOString().split("T")[0];

    // Get cleaning schedule for the entire society
    const schedule = await hkService.getCleaningSchedule(session.societyId, date);
    return NextResponse.json({ schedule });
  } catch (error) {
    console.error("[Resident Cleaning GET] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
