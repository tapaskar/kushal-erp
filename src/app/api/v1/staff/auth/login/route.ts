import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { db } from "@/db";
import { staff } from "@/db/schema";
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
        return NextResponse.json(
          { error: "Staff member not found. Contact your society admin." },
          { status: 401 }
        );
      }

      const token = await createMobileToken({
        userId: staffMember.userId || staffMember.id,
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
