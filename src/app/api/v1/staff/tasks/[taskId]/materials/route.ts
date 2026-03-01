import { NextResponse } from "next/server";
import { getMobileSession } from "@/lib/auth/mobile-session";
import * as materialService from "@/services/material-usage.service";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const session = await getMobileSession(request);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { taskId } = await params;
    const materials = await materialService.getMaterialUsageForTask(taskId);
    return NextResponse.json({ materials });
  } catch (error) {
    console.error("[Task Materials GET] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const session = await getMobileSession(request);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (!session.staffId) {
      return NextResponse.json({ error: "Not a staff session" }, { status: 400 });
    }

    const { taskId } = await params;
    const body = await request.json();

    const usage = await materialService.logMaterialUsage({
      societyId: session.societyId,
      staffId: session.staffId,
      taskId,
      inventoryItemId: body.inventoryItemId,
      quantityUsed: body.quantityUsed,
      notes: body.notes,
    });

    return NextResponse.json({ usage }, { status: 201 });
  } catch (error: any) {
    if (error?.message?.includes("Insufficient stock")) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("[Task Materials POST] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
