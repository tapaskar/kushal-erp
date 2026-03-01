import { NextResponse } from "next/server";
import { getSession, isSuperAdmin } from "@/lib/auth/session";
import * as permService from "@/services/permission.service";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ societyId: string }> }
) {
  const session = await getSession();
  if (!session || !isSuperAdmin(session)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { societyId } = await params;
  const modules = await permService.getSocietyModules(societyId);
  return NextResponse.json({ modules });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ societyId: string }> }
) {
  const session = await getSession();
  if (!session || !isSuperAdmin(session)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { societyId } = await params;
  const body = await request.json();

  if (!body.moduleKey || typeof body.isEnabled !== "boolean") {
    return NextResponse.json(
      { error: "moduleKey and isEnabled are required" },
      { status: 400 }
    );
  }

  const result = await permService.toggleModule(
    societyId,
    body.moduleKey,
    body.isEnabled,
    session.userId
  );

  return NextResponse.json({ success: true, module: result });
}
