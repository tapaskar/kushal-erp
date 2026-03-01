import { NextResponse } from "next/server";
import { getMobileSession } from "@/lib/auth/mobile-session";
import {
  getUserPermissions,
  getSocietyModules,
} from "@/services/permission.service";

export async function GET(request: Request) {
  try {
    const session = await getMobileSession(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = session.staffRole || session.userRole;
    const roleType = session.userType;

    if (!role) {
      return NextResponse.json(
        { error: "No role assigned to this user" },
        { status: 403 }
      );
    }

    const [permissions, modules] = await Promise.all([
      getUserPermissions(session.societyId, role, roleType),
      getSocietyModules(session.societyId),
    ]);

    return NextResponse.json({ modules, permissions });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "An error occurred";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
