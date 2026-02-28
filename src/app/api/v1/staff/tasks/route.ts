import { NextResponse } from "next/server";
import { getMobileSession } from "@/lib/auth/mobile-session";
import * as staffService from "@/services/staff.service";

export async function GET(request: Request) {
  try {
    const session = await getMobileSession(request);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || undefined;
    const taskType = searchParams.get("taskType") || undefined;

    const tasks = await staffService.getTasksForStaff(session.staffId, { status, taskType });
    return NextResponse.json({ tasks });
  } catch (error) {
    console.error("[Staff Tasks] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
