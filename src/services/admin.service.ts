"use server";

import { db } from "@/db";
import { users, userSocietyRoles, societies, units } from "@/db/schema";
import { eq, sql, ilike, or, desc, count } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// ─── Stats ───

export async function getAdminStats() {
  const [societyCount] = await db
    .select({ count: count() })
    .from(societies);

  const [userCount] = await db
    .select({ count: count() })
    .from(users);

  const [adminCount] = await db
    .select({ count: count() })
    .from(userSocietyRoles)
    .where(eq(userSocietyRoles.role, "society_admin"));

  return {
    totalSocieties: societyCount.count,
    totalUsers: userCount.count,
    totalAdmins: adminCount.count,
  };
}

// ─── Societies ───

export async function getAllSocieties() {
  const result = await db
    .select({
      society: societies,
      unitCount: sql<number>`(SELECT count(*) FROM units WHERE units.society_id = ${societies.id})::int`,
      adminCount: sql<number>`(SELECT count(*) FROM user_society_roles WHERE user_society_roles.society_id = ${societies.id} AND user_society_roles.role = 'society_admin')::int`,
    })
    .from(societies)
    .orderBy(desc(societies.createdAt));

  return result;
}

export async function getSocietyDetail(societyId: string) {
  const [society] = await db
    .select()
    .from(societies)
    .where(eq(societies.id, societyId))
    .limit(1);

  if (!society) return null;

  const admins = await db
    .select({
      roleId: userSocietyRoles.id,
      userId: users.id,
      name: users.name,
      phone: users.phone,
      email: users.email,
      role: userSocietyRoles.role,
      assignedAt: userSocietyRoles.createdAt,
    })
    .from(userSocietyRoles)
    .innerJoin(users, eq(userSocietyRoles.userId, users.id))
    .where(eq(userSocietyRoles.societyId, societyId))
    .orderBy(userSocietyRoles.role);

  const [unitCount] = await db
    .select({ count: count() })
    .from(units)
    .where(eq(units.societyId, societyId));

  return {
    society,
    admins,
    unitCount: unitCount.count,
  };
}

export async function createSocietyAsAdmin(data: {
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone?: string;
  email?: string;
}) {
  const [society] = await db
    .insert(societies)
    .values(data)
    .returning();

  // Seed default RBAC permissions for the new society
  try {
    const { seedSocietyPermissions } = await import("@/db/seed/default-permissions");
    await seedSocietyPermissions(society.id);
  } catch (e) {
    console.error("Failed to seed permissions for new society:", e);
  }

  revalidatePath("/admin/societies");
  return society;
}

// ─── Role Management ───

export async function assignSocietyAdmin(userId: string, societyId: string) {
  const [existing] = await db
    .select()
    .from(userSocietyRoles)
    .where(
      sql`${userSocietyRoles.userId} = ${userId} AND ${userSocietyRoles.societyId} = ${societyId} AND ${userSocietyRoles.role} = 'society_admin'`
    )
    .limit(1);

  if (existing) {
    return { error: "User is already an admin of this society" };
  }

  const [role] = await db
    .insert(userSocietyRoles)
    .values({
      userId,
      societyId,
      role: "society_admin",
      isDefault: true,
    })
    .returning();

  revalidatePath(`/admin/societies/${societyId}`);
  return { success: true, role };
}

export async function removeSocietyAdmin(roleId: string) {
  const [deleted] = await db
    .delete(userSocietyRoles)
    .where(eq(userSocietyRoles.id, roleId))
    .returning();

  if (deleted) {
    revalidatePath(`/admin/societies/${deleted.societyId}`);
  }

  return { success: true };
}

// ─── Users ───

export async function getAllUsers(search?: string) {
  let query = db
    .select({
      user: users,
      roles: sql<string>`COALESCE(
        (SELECT json_agg(json_build_object(
          'societyId', usr.society_id,
          'role', usr.role,
          'societyName', s.name
        ))
        FROM user_society_roles usr
        LEFT JOIN societies s ON s.id = usr.society_id
        WHERE usr.user_id = "users"."id"
        ), '[]'
      )`,
    })
    .from(users)
    .orderBy(desc(users.createdAt));

  if (search && search.trim()) {
    const term = `%${search.trim()}%`;
    query = query.where(
      or(
        ilike(users.name, term),
        ilike(users.phone, term)
      )
    ) as typeof query;
  }

  return query;
}

export async function searchUsersByPhone(phone: string) {
  const term = `%${phone.trim()}%`;
  return db
    .select({
      id: users.id,
      name: users.name,
      phone: users.phone,
      email: users.email,
    })
    .from(users)
    .where(ilike(users.phone, term))
    .limit(10);
}
