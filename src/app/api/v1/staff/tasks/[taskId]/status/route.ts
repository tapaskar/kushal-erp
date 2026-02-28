import { NextResponse } from "next/server";
import { getMobileSession } from "@/lib/auth/mobile-session";
import * as staffService from "@/services/staff.service";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const session = await getMobileSession(request);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { taskId } = await params;
    const { status, resolution, beforePhotoUrl, afterPhotoUrl } = await request.json();
    if (!status) {
      return NextResponse.json({ error: "status is required" }, { status: 400 });
    }

    const task = await staffService.updateTaskStatus(taskId, status, {
      resolution,
      beforePhotoUrl,
      afterPhotoUrl,
    });
    return NextResponse.json({ task });
  } catch (error) {
    console.error("[Staff Task Status] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
