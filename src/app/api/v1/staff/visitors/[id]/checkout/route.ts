import { NextResponse } from "next/server";
import { getMobileSession } from "@/lib/auth/mobile-session";
import * as securityService from "@/services/security.service";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getMobileSession(request);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await request.json();
    const visitor = await securityService.checkOutVisitor(id, {
      checkOutGate: body.checkOutGate,
      notes: body.notes,
    });

    return NextResponse.json({ visitor });
  } catch (error) {
    console.error("[Visitor Checkout] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
