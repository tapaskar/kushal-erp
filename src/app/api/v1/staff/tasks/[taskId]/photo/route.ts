import { NextResponse } from "next/server";
import { getMobileSession } from "@/lib/auth/mobile-session";
import * as staffService from "@/services/staff.service";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const session = await getMobileSession(request);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { taskId } = await params;
    const { type, photoUrl } = await request.json();
    if (!type || !photoUrl) {
      return NextResponse.json({ error: "type and photoUrl are required" }, { status: 400 });
    }
    if (type !== "before" && type !== "after") {
      return NextResponse.json({ error: "type must be 'before' or 'after'" }, { status: 400 });
    }

    const existing = await staffService.getStaffTask(taskId);
    if (!existing) return NextResponse.json({ error: "Task not found" }, { status: 404 });

    const updateData = type === "before"
      ? { beforePhotoUrl: photoUrl }
      : { afterPhotoUrl: photoUrl };

    const task = await staffService.updateTaskStatus(taskId, existing.status, updateData);
    return NextResponse.json({ task });
  } catch (error) {
    console.error("[Staff Task Photo] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
