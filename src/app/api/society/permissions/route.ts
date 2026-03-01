import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import * as permService from "@/services/permission.service";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "society_admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const modules = await permService.getSocietyModules(session.societyId!);
  const permissions = await permService.getRolePermissions(session.societyId!);

  return NextResponse.json({ modules, permissions });
}

export async function PUT(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "society_admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  if (body.action === "updatePermission") {
    const result = await permService.updatePermission(
      session.societyId!,
      body.role,
      body.moduleKey,
      body.permission,
      body.isGranted,
      session.userId
    );
    return NextResponse.json({ success: true, permission: result });
  }

  if (body.action === "resetToDefaults") {
    await permService.resetToDefaults(session.societyId!, session.userId);
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
