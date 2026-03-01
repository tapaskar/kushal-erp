import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { db } from "@/db";
import { staff, societies, users, userSocietyRoles } from "@/db/schema";
import { getMobileSession } from "@/lib/auth/mobile-session";

export async function GET(request: Request) {
  try {
    const session = await getMobileSession(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // User profile path
    if (session.userType === "user" || !session.staffId) {
      const [userRecord] = await db
        .select()
        .from(users)
        .where(eq(users.id, session.userId));

      if (!userRecord) {
        return NextResponse.json(
          { error: "User not found" },
          { status: 404 }
        );
      }

      // Get role
      const roles = await db
        .select()
        .from(userSocietyRoles)
        .where(
          and(
            eq(userSocietyRoles.userId, session.userId),
            eq(userSocietyRoles.societyId, session.societyId)
          )
        );

      // Get society
      const [society] = await db
        .select()
        .from(societies)
        .where(eq(societies.id, session.societyId));

      // Get permissions
      const { getUserPermissions } = await import(
        "@/services/permission.service"
      );
      const role =
        session.userRole || (roles[0]?.role ?? "resident");
      const permissions = await getUserPermissions(
        session.societyId,
        role,
        "user"
      );

      return NextResponse.json({
        userType: "user",
        user: {
          id: userRecord.id,
          name: userRecord.name,
          phone: userRecord.phone,
          email: userRecord.email,
          role: role,
          avatarUrl: userRecord.avatarUrl,
          isActive: userRecord.isActive,
        },
        society: society
          ? {
              id: society.id,
              name: society.name,
              address: society.address || "",
              city: society.city || "",
            }
          : null,
        permissions,
      });
    }

    // Staff profile path
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

    // Get staff permissions
    const { getUserPermissions } = await import(
      "@/services/permission.service"
    );
    const staffPermissions = await getUserPermissions(
      session.societyId,
      session.staffRole || "security",
      "staff"
    );

    return NextResponse.json({
      userType: "staff",
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
      permissions: staffPermissions,
    });
  } catch (error) {
    console.error("[Mobile Auth] Me error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
