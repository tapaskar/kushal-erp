import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { db } from "@/db";
import { staff, users, userSocietyRoles } from "@/db/schema";
import { createMobileToken } from "@/lib/auth/mobile-session";

export async function POST(request: Request) {
  try {
    const { phone, password } = await request.json();

    if (!phone || !password) {
      return NextResponse.json(
        { error: "Phone and password required" },
        { status: 400 }
      );
    }

    const normalizedPhone = phone
      .replace(/\s+/g, "")
      .replace(/^(\d{10})$/, "+91$1");

    // Dev mode: accept "staff123" as password
    // Production: replace with OTP verification via AWS Cognito
    if (!process.env.COGNITO_USER_POOL_ID && password === "staff123") {
      const [staffMember] = await db
        .select()
        .from(staff)
        .where(
          and(eq(staff.phone, normalizedPhone), eq(staff.isActive, true))
        )
        .limit(1);

      if (!staffMember) {
        // If not found as staff, try users table
        const [userRecord] = await db
          .select()
          .from(users)
          .where(
            and(eq(users.phone, normalizedPhone), eq(users.isActive, true))
          );

        if (!userRecord) {
          return NextResponse.json(
            { error: "Invalid credentials" },
            { status: 401 }
          );
        }

        // Dev mode: accept "admin123" as password for users
        // Production: replace with OTP verification via AWS Cognito

        // Get user's role for this society (or first society)
        const roles = await db
          .select()
          .from(userSocietyRoles)
          .where(eq(userSocietyRoles.userId, userRecord.id));

        if (roles.length === 0) {
          return NextResponse.json(
            { error: "User has no assigned role" },
            { status: 401 }
          );
        }

        // Pick the default role, or first one
        const primaryRole = roles.find((r) => r.isDefault) || roles[0];

        // Create token with userType: "user"
        const token = await createMobileToken({
          userId: userRecord.id,
          userType: "user",
          userRole: primaryRole.role,
          name: userRecord.name,
          phone: userRecord.phone,
          email: userRecord.email || undefined,
          societyId: primaryRole.societyId || "",
        });

        return NextResponse.json({
          success: true,
          token,
          userType: "user",
          user: {
            id: userRecord.id,
            name: userRecord.name,
            role: primaryRole.role,
            societyId: primaryRole.societyId,
            avatarUrl: userRecord.avatarUrl,
          },
        });
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

      return NextResponse.json({
        success: true,
        token,
        staff: {
          id: staffMember.id,
          name: staffMember.name,
          role: staffMember.role,
          societyId: staffMember.societyId,
          photoUrl: staffMember.photoUrl,
          consentGiven: !!staffMember.consentGivenAt,
        },
      });
    }

    return NextResponse.json(
      { error: "Invalid credentials" },
      { status: 401 }
    );
  } catch (error) {
    console.error("[Mobile Auth] Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
