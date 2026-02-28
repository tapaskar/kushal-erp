import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { staff, societies } from "@/db/schema";
import { getMobileSession } from "@/lib/auth/mobile-session";

export async function GET(request: Request) {
  try {
    const session = await getMobileSession(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [staffMember] = await db
      .select()
      .from(staff)
      .where(eq(staff.id, session.staffId))
      .limit(1);

    if (!staffMember) {
      return NextResponse.json(
        { error: "Staff not found" },
        { status: 404 }
      );
    }

    const [society] = await db
      .select({
        id: societies.id,
        name: societies.name,
        address: societies.address,
        city: societies.city,
      })
      .from(societies)
      .where(eq(societies.id, staffMember.societyId))
      .limit(1);

    return NextResponse.json({
      staff: {
        id: staffMember.id,
        employeeCode: staffMember.employeeCode,
        name: staffMember.name,
        phone: staffMember.phone,
        email: staffMember.email,
        role: staffMember.role,
        department: staffMember.department,
        photoUrl: staffMember.photoUrl,
        employedSince: staffMember.employedSince,
        contractorName: staffMember.contractorName,
        consentGiven: !!staffMember.consentGivenAt,
        consentRevokedAt: staffMember.consentRevokedAt,
        isActive: staffMember.isActive,
      },
      society: society || null,
    });
  } catch (error) {
    console.error("[Mobile Auth] Me error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
