"use server";

import { db } from "@/db";
import { members, units, blocks } from "@/db/schema";
import { eq, and, asc, desc, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getMembers(societyId: string) {
  return db
    .select({
      member: members,
      unit: units,
      block: blocks,
    })
    .from(members)
    .innerJoin(units, eq(members.unitId, units.id))
    .innerJoin(blocks, eq(units.blockId, blocks.id))
    .where(and(eq(members.societyId, societyId), eq(members.isActive, true)))
    .orderBy(asc(blocks.sortOrder), asc(units.unitNumber), desc(members.validFrom));
}

export async function getMember(memberId: string) {
  const [result] = await db
    .select({
      member: members,
      unit: units,
      block: blocks,
    })
    .from(members)
    .innerJoin(units, eq(members.unitId, units.id))
    .innerJoin(blocks, eq(units.blockId, blocks.id))
    .where(eq(members.id, memberId))
    .limit(1);
  return result;
}

export async function createMember(data: {
  societyId: string;
  unitId: string;
  memberType: "owner" | "tenant" | "family_member";
  name: string;
  phone: string;
  email?: string;
  validFrom: string;
  validTo?: string;
}) {
  const [member] = await db.insert(members).values(data).returning();

  // Update unit occupancy status based on member type
  const occupancy =
    data.memberType === "owner" ? "owner_occupied" : "tenant_occupied";
  await db
    .update(units)
    .set({ occupancyStatus: occupancy, updatedAt: new Date() })
    .where(eq(units.id, data.unitId));

  revalidatePath("/members");
  return member;
}

export async function updateMember(
  memberId: string,
  data: Partial<{
    name: string;
    phone: string;
    email: string;
    memberType: "owner" | "tenant" | "family_member";
    validFrom: string;
    validTo: string;
    isActive: boolean;
  }>
) {
  const [updated] = await db
    .update(members)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(members.id, memberId))
    .returning();
  revalidatePath("/members");
  return updated;
}

export async function deactivateMember(memberId: string) {
  const [member] = await db
    .update(members)
    .set({
      isActive: false,
      validTo: new Date().toISOString().split("T")[0],
      updatedAt: new Date(),
    })
    .where(eq(members.id, memberId))
    .returning();

  // Check if unit still has active members; if not, set to vacant
  const activeMembers = await db
    .select({ count: sql<number>`count(*)` })
    .from(members)
    .where(and(eq(members.unitId, member.unitId), eq(members.isActive, true)));

  if (activeMembers[0].count === 0) {
    await db
      .update(units)
      .set({ occupancyStatus: "vacant", updatedAt: new Date() })
      .where(eq(units.id, member.unitId));
  }

  revalidatePath("/members");
  return member;
}

export async function getMemberStats(societyId: string) {
  const [stats] = await db
    .select({
      total: sql<number>`count(*)`,
      owners: sql<number>`count(*) filter (where ${members.memberType} = 'owner')`,
      tenants: sql<number>`count(*) filter (where ${members.memberType} = 'tenant')`,
    })
    .from(members)
    .where(and(eq(members.societyId, societyId), eq(members.isActive, true)));
  return stats;
}
