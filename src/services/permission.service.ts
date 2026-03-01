import { db } from "@/db";
import { societyModules, societyRolePermissions } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { seedSocietyPermissions } from "@/db/seed/default-permissions";

// ─── Get Society Modules ───
// List all modules with enabled status for a society, ordered by moduleKey

export async function getSocietyModules(societyId: string) {
  return db
    .select()
    .from(societyModules)
    .where(eq(societyModules.societyId, societyId))
    .orderBy(societyModules.moduleKey);
}

// ─── Toggle Module ───
// Update module enabled status for a society

export async function toggleModule(
  societyId: string,
  moduleKey: string,
  isEnabled: boolean,
  configuredBy: string
) {
  return db
    .update(societyModules)
    .set({
      isEnabled,
      configuredBy,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(societyModules.societyId, societyId),
        eq(societyModules.moduleKey, moduleKey)
      )
    )
    .returning();
}

// ─── Get Role Permissions ───
// Get all permissions, optionally filtered by role and/or moduleKey

export async function getRolePermissions(
  societyId: string,
  role?: string,
  moduleKey?: string
) {
  const conditions = [eq(societyRolePermissions.societyId, societyId)];

  if (role) {
    conditions.push(eq(societyRolePermissions.role, role));
  }

  if (moduleKey) {
    conditions.push(eq(societyRolePermissions.moduleKey, moduleKey));
  }

  return db
    .select()
    .from(societyRolePermissions)
    .where(and(...conditions));
}

// ─── Update Permission ───
// Toggle a single permission using upsert (insert on conflict update)

export async function updatePermission(
  societyId: string,
  role: string,
  moduleKey: string,
  permission: string,
  isGranted: boolean,
  configuredBy: string,
  roleType: "user" | "staff" = "user"
) {
  return db
    .insert(societyRolePermissions)
    .values({
      societyId,
      role,
      roleType,
      moduleKey,
      permission,
      isGranted,
      configuredBy,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [
        societyRolePermissions.societyId,
        societyRolePermissions.role,
        societyRolePermissions.moduleKey,
        societyRolePermissions.permission,
      ],
      set: {
        isGranted,
        configuredBy,
        updatedAt: new Date(),
      },
    })
    .returning();
}

// ─── Get User Permissions ───
// Get all GRANTED permissions for a specific role, only from ENABLED modules.
// Returns string[] like ["nfa_procurement.view", "nfa_procurement.create", ...]

export async function getUserPermissions(
  societyId: string,
  role: string,
  roleType: "user" | "staff"
): Promise<string[]> {
  const result = await db.execute(sql`
    SELECT ${societyRolePermissions.moduleKey} || '.' || ${societyRolePermissions.permission} AS perm
    FROM ${societyRolePermissions}
    JOIN ${societyModules}
      ON ${societyModules.societyId} = ${societyRolePermissions.societyId}
      AND ${societyModules.moduleKey} = ${societyRolePermissions.moduleKey}
    WHERE ${societyRolePermissions.societyId} = ${societyId}
      AND ${societyRolePermissions.role} = ${role}
      AND ${societyRolePermissions.roleType} = ${roleType}
      AND ${societyRolePermissions.isGranted} = true
      AND ${societyModules.isEnabled} = true
  `);

  return (result as unknown as { perm: string }[]).map((row) => row.perm);
}

// ─── Reset to Defaults ───
// Delete all existing permissions and modules for the society, then re-seed

export async function resetToDefaults(
  societyId: string,
  configuredBy: string
) {
  await db
    .delete(societyRolePermissions)
    .where(eq(societyRolePermissions.societyId, societyId));

  await db
    .delete(societyModules)
    .where(eq(societyModules.societyId, societyId));

  await seedSocietyPermissions(societyId, configuredBy);
}
