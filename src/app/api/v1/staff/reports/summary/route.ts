import { NextResponse } from "next/server";
import { getMobileSession } from "@/lib/auth/mobile-session";
import * as staffService from "@/services/staff.service";
import * as securityService from "@/services/security.service";
import * as hkService from "@/services/housekeeping.service";

export async function GET(request: Request) {
  try {
    const session = await getMobileSession(request);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Only supervisor role can see reports
    if (session.staffRole !== "supervisor") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const [staffSummary, securityStats, cleaningStats] = await Promise.all([
      staffService.getStaffReportsSummary(session.societyId),
      securityService.getSecurityStats(session.societyId),
      hkService.getCleaningStats(session.societyId),
    ]);

    return NextResponse.json({
      staff: staffSummary,
      security: securityStats,
      cleaning: cleaningStats,
    });
  } catch (error) {
    console.error("[Reports Summary] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
