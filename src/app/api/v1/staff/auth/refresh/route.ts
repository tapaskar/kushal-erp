import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { db } from "@/db";
import { staff } from "@/db/schema";
import {
  getMobileSession,
  createMobileToken,
} from "@/lib/auth/mobile-session";

export async function POST(request: Request) {
  try {
    const session = await getMobileSession(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!session.staffId) {
      return NextResponse.json(
        { error: "Not a staff session" },
        { status: 400 }
      );
    }

    // Verify staff still exists and is active
    const [staffMember] = await db
      .select()
      .from(staff)
      .where(
        and(eq(staff.id, session.staffId), eq(staff.isActive, true))
      )
      .limit(1);

    if (!staffMember) {
      return NextResponse.json(
        { error: "Staff account deactivated" },
        { status: 401 }
      );
    }

    const token = await createMobileToken({
      userId: staffMember.userId || staffMember.id,
      userType: "staff",
      staffId: staffMember.id,
      staffRole: staffMember.role,
      name: staffMember.name,
      phone: staffMember.phone,
      email: staffMember.email || undefined,
      societyId: staffMember.societyId,
    });

    return NextResponse.json({ success: true, token });
  } catch (error) {
    console.error("[Mobile Auth] Refresh error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
