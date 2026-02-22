import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users, userSocietyRoles } from "@/db/schema";
import { createSession } from "@/lib/auth/session";

/**
 * Simple phone + password login for local development.
 * In production, this will be replaced by AWS Cognito phone OTP flow.
 *
 * For dev: any phone number that exists in the users table with password "admin123" works.
 * First-time: creates the user automatically (self-registration).
 */
export async function POST(request: Request) {
  try {
    const { phone, password, username } = await request.json();

    // Super admin login (username-based)
    if (username && password) {
      if (username === "Superadmin" && password === "Superadmin123") {
        // Find or create super admin user
        const superAdminPhone = "+910000000000";
        let [user] = await db
          .select()
          .from(users)
          .where(eq(users.phone, superAdminPhone))
          .limit(1);

        if (!user) {
          [user] = await db
            .insert(users)
            .values({
              phone: superAdminPhone,
              name: "Super Admin",
              email: "superadmin@societyerp.in",
            })
            .returning();
        }

        await createSession({
          userId: user.id,
          name: user.name,
          phone: user.phone,
          email: user.email || undefined,
          role: "super_admin",
        });

        return NextResponse.json({
          success: true,
          user: { id: user.id, name: user.name },
          role: "super_admin",
        });
      }

      return NextResponse.json(
        { error: "Invalid admin credentials" },
        { status: 401 }
      );
    }

    // Phone-based login
    if (!phone || !password) {
      return NextResponse.json(
        { error: "Phone and password required" },
        { status: 400 }
      );
    }

    // Normalize phone
    const normalizedPhone = phone.replace(/\s+/g, "").replace(/^(\d{10})$/, "+91$1");

    // Simple auth: accept "admin123" as password until Cognito OTP is wired up
    // Set COGNITO_USER_POOL_ID env var to disable this and use Cognito instead
    if (!process.env.COGNITO_USER_POOL_ID && password === "admin123") {
      // Find or create user
      let [user] = await db
        .select()
        .from(users)
        .where(eq(users.phone, normalizedPhone))
        .limit(1);

      if (!user) {
        // Auto-create user in dev mode
        [user] = await db
          .insert(users)
          .values({
            phone: normalizedPhone,
            name: `User ${normalizedPhone.slice(-4)}`,
          })
          .returning();
      }

      // Get default society role
      const [role] = await db
        .select()
        .from(userSocietyRoles)
        .where(eq(userSocietyRoles.userId, user.id))
        .limit(1);

      await createSession({
        userId: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email || undefined,
        societyId: role?.societyId,
        role: role?.role || "society_admin",
      });

      return NextResponse.json({
        success: true,
        user: { id: user.id, name: user.name },
        role: role?.role || "society_admin",
      });
    }

    return NextResponse.json(
      { error: "Invalid credentials" },
      { status: 401 }
    );
  } catch (error) {
    console.error("[Auth] Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
