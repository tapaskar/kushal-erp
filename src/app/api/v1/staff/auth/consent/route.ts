import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { staff } from "@/db/schema";
import { getMobileSession } from "@/lib/auth/mobile-session";

export async function PUT(request: Request) {
  try {
    const session = await getMobileSession(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { consent } = await request.json();

    if (consent) {
      await db
        .update(staff)
        .set({
          consentGivenAt: new Date(),
          consentRevokedAt: null,
          updatedAt: new Date(),
        })
        .where(eq(staff.id, session.staffId));
    } else {
      await db
        .update(staff)
        .set({
          consentRevokedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(staff.id, session.staffId));
    }

    return NextResponse.json({
      success: true,
      consentGiven: consent,
    });
  } catch (error) {
    console.error("[Mobile Auth] Consent error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
