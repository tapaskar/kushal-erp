"use server";

import { db } from "@/db";
import { societies, blocks, floors, units } from "@/db/schema";
import { eq, and, asc } from "drizzle-orm";
import { getSession, updateSessionSociety } from "@/lib/auth/session";
import { userSocietyRoles } from "@/db/schema";
import { revalidatePath } from "next/cache";

// ─── Society CRUD ───

export async function createSociety(data: {
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone?: string;
  email?: string;
  registrationNumber?: string;
  gstNumber?: string;
  panNumber?: string;
  billingDueDay?: number;
  latePaymentInterestRate?: string;
  latePaymentGraceDays?: number;
}) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  const [society] = await db.insert(societies).values(data).returning();

  // Assign creator as society_admin
  await db.insert(userSocietyRoles).values({
    userId: session.userId,
    societyId: society.id,
    role: "society_admin",
    isDefault: true,
  });

  // Update session with society context
  await updateSessionSociety(society.id, "society_admin");

  revalidatePath("/");
  return society;
}

export async function getSociety(societyId: string) {
  const [society] = await db
    .select()
    .from(societies)
    .where(eq(societies.id, societyId))
    .limit(1);
  return society;
}

export async function updateSociety(
  societyId: string,
  data: Partial<{
    name: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    phone: string;
    email: string;
    registrationNumber: string;
    gstNumber: string;
    panNumber: string;
    billingDueDay: number;
    latePaymentInterestRate: string;
    latePaymentGraceDays: number;
    isGstRegistered: boolean;
  }>
) {
  const [updated] = await db
    .update(societies)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(societies.id, societyId))
    .returning();
  revalidatePath("/society");
  return updated;
}

// ─── Blocks ───

export async function getBlocks(societyId: string) {
  return db
    .select()
    .from(blocks)
    .where(eq(blocks.societyId, societyId))
    .orderBy(asc(blocks.sortOrder));
}

export async function createBlock(data: {
  societyId: string;
  name: string;
  code: string;
  totalFloors: number;
}) {
  const [block] = await db.insert(blocks).values(data).returning();

  // Auto-create floors
  const floorValues = Array.from({ length: data.totalFloors + 1 }, (_, i) => ({
    blockId: block.id,
    societyId: data.societyId,
    floorNumber: i, // 0 = Ground floor
  }));
  await db.insert(floors).values(floorValues);

  revalidatePath("/society/blocks");
  return block;
}

export async function deleteBlock(blockId: string) {
  await db.delete(blocks).where(eq(blocks.id, blockId));
  revalidatePath("/society/blocks");
}

// ─── Floors ───

export async function getFloors(blockId: string) {
  return db
    .select()
    .from(floors)
    .where(eq(floors.blockId, blockId))
    .orderBy(asc(floors.floorNumber));
}

// ─── Units ───

export async function getUnits(societyId: string) {
  return db
    .select({
      unit: units,
      block: blocks,
      floor: floors,
    })
    .from(units)
    .innerJoin(blocks, eq(units.blockId, blocks.id))
    .innerJoin(floors, eq(units.floorId, floors.id))
    .where(eq(units.societyId, societyId))
    .orderBy(asc(blocks.sortOrder), asc(floors.floorNumber), asc(units.unitNumber));
}

export async function createUnit(data: {
  societyId: string;
  blockId: string;
  floorId: string;
  unitNumber: string;
  unitType?: "apartment" | "shop" | "office" | "parking" | "storage";
  areaSqft?: string;
  occupancyStatus?: "owner_occupied" | "tenant_occupied" | "vacant";
  isBillable?: boolean;
}) {
  const [unit] = await db.insert(units).values(data).returning();
  revalidatePath("/society/units");
  return unit;
}

export async function updateUnit(
  unitId: string,
  data: Partial<{
    unitNumber: string;
    unitType: "apartment" | "shop" | "office" | "parking" | "storage";
    areaSqft: string;
    occupancyStatus: "owner_occupied" | "tenant_occupied" | "vacant";
    isBillable: boolean;
  }>
) {
  const [updated] = await db
    .update(units)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(units.id, unitId))
    .returning();
  revalidatePath("/society/units");
  return updated;
}

export async function deleteUnit(unitId: string) {
  await db.delete(units).where(eq(units.id, unitId));
  revalidatePath("/society/units");
}

// ─── Bulk Unit Generation ───

export async function generateUnits(params: {
  societyId: string;
  blockId: string;
  prefix: string;
  unitsPerFloor: number;
  areaSqft?: string;
}) {
  const blockFloors = await getFloors(params.blockId);

  const unitValues = blockFloors.flatMap((floor) =>
    Array.from({ length: params.unitsPerFloor }, (_, i) => ({
      societyId: params.societyId,
      blockId: params.blockId,
      floorId: floor.id,
      unitNumber: `${params.prefix}${floor.floorNumber * 100 + i + 1}`,
      areaSqft: params.areaSqft,
    }))
  );

  await db.insert(units).values(unitValues);
  revalidatePath("/society/units");
  return unitValues.length;
}

// ─── User's Societies ───

export async function getUserSocieties() {
  const session = await getSession();
  if (!session) return [];

  const roles = await db
    .select({
      role: userSocietyRoles,
      society: societies,
    })
    .from(userSocietyRoles)
    .innerJoin(societies, eq(userSocietyRoles.societyId, societies.id))
    .where(eq(userSocietyRoles.userId, session.userId));

  return roles;
}
