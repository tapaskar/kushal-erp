import { db } from "@/db";
import {
  cleaningZones,
  cleaningLogs,
  supplyRequests,
  staff,
} from "@/db/schema";
import { eq, and, desc, sql, asc } from "drizzle-orm";

// ─── Cleaning Zones ───

export async function getCleaningZones(societyId: string) {
  return db
    .select()
    .from(cleaningZones)
    .where(
      and(
        eq(cleaningZones.societyId, societyId),
        eq(cleaningZones.isActive, true)
      )
    )
    .orderBy(cleaningZones.name);
}

export async function createCleaningZone(data: {
  societyId: string;
  name: string;
  floor?: number;
  blockId?: string;
  zoneType?: string;
  frequency?: typeof cleaningZones.frequency.enumValues[number];
  description?: string;
}) {
  const [result] = await db.insert(cleaningZones).values(data).returning();
  return result;
}

export async function updateCleaningZone(
  id: string,
  data: Partial<{
    name: string;
    floor: number;
    blockId: string;
    zoneType: string;
    frequency: typeof cleaningZones.frequency.enumValues[number];
    description: string;
    isActive: boolean;
  }>
) {
  const [result] = await db
    .update(cleaningZones)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(cleaningZones.id, id))
    .returning();
  return result;
}

// ─── Cleaning Logs ───

export async function getCleaningSchedule(societyId: string, date: string) {
  return db
    .select({
      log: cleaningLogs,
      zoneName: cleaningZones.name,
      zoneType: cleaningZones.zoneType,
      zoneFloor: cleaningZones.floor,
      staffName: staff.name,
    })
    .from(cleaningLogs)
    .innerJoin(cleaningZones, eq(cleaningLogs.zoneId, cleaningZones.id))
    .leftJoin(staff, eq(cleaningLogs.staffId, staff.id))
    .where(
      and(
        eq(cleaningLogs.societyId, societyId),
        eq(cleaningLogs.scheduledDate, date)
      )
    )
    .orderBy(cleaningZones.name);
}

export async function getCleaningLogsForStaff(staffId: string, date: string) {
  return db
    .select({
      log: cleaningLogs,
      zoneName: cleaningZones.name,
      zoneType: cleaningZones.zoneType,
      zoneFloor: cleaningZones.floor,
      zoneDescription: cleaningZones.description,
    })
    .from(cleaningLogs)
    .innerJoin(cleaningZones, eq(cleaningLogs.zoneId, cleaningZones.id))
    .where(
      and(eq(cleaningLogs.staffId, staffId), eq(cleaningLogs.scheduledDate, date))
    )
    .orderBy(cleaningZones.name);
}

export async function createCleaningLog(data: {
  societyId: string;
  zoneId: string;
  staffId?: string;
  shiftId?: string;
  scheduledDate: string;
}) {
  const [result] = await db.insert(cleaningLogs).values(data).returning();
  return result;
}

export async function startCleaning(logId: string, staffId: string) {
  const results = await db
    .update(cleaningLogs)
    .set({
      status: "in_progress",
      staffId,
      startedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(cleaningLogs.id, logId))
    .returning();
  if (results.length === 0) {
    throw new Error(`Cleaning log with id ${logId} not found`);
  }
  return results[0];
}

export async function completeCleaning(
  logId: string,
  data: {
    beforePhotoUrl?: string;
    afterPhotoUrl?: string;
    notes?: string;
  }
) {
  const results = await db
    .update(cleaningLogs)
    .set({
      status: "completed",
      completedAt: new Date(),
      beforePhotoUrl: data.beforePhotoUrl,
      afterPhotoUrl: data.afterPhotoUrl,
      notes: data.notes,
      updatedAt: new Date(),
    })
    .where(eq(cleaningLogs.id, logId))
    .returning();
  if (results.length === 0) {
    throw new Error(`Cleaning log with id ${logId} not found`);
  }
  return results[0];
}

export async function verifyCleaning(logId: string, verifiedBy: string) {
  const results = await db
    .update(cleaningLogs)
    .set({
      status: "verified",
      verifiedBy,
      verifiedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(cleaningLogs.id, logId))
    .returning();
  if (results.length === 0) {
    throw new Error(`Cleaning log with id ${logId} not found`);
  }
  return results[0];
}

export async function rateCleaning(
  logId: string,
  rating: number,
  comment: string | undefined,
  ratedBy: string
) {
  const results = await db
    .update(cleaningLogs)
    .set({
      rating,
      ratingComment: comment,
      ratedBy,
      updatedAt: new Date(),
    })
    .where(eq(cleaningLogs.id, logId))
    .returning();
  if (results.length === 0) {
    throw new Error(`Cleaning log with id ${logId} not found`);
  }
  return results[0];
}

// ─── Supply Requests ───

export async function createSupplyRequest(data: {
  societyId: string;
  staffId: string;
  itemName: string;
  quantity?: number;
  urgency?: string;
  reason?: string;
}) {
  const [result] = await db.insert(supplyRequests).values(data).returning();
  return result;
}

export async function getSupplyRequests(
  societyId: string,
  filters?: { status?: string; staffId?: string }
) {
  const conditions = [eq(supplyRequests.societyId, societyId)];
  if (filters?.status) {
    conditions.push(eq(supplyRequests.status, filters.status));
  }
  if (filters?.staffId) {
    conditions.push(eq(supplyRequests.staffId, filters.staffId));
  }

  return db
    .select({
      request: supplyRequests,
      staffName: staff.name,
    })
    .from(supplyRequests)
    .innerJoin(staff, eq(supplyRequests.staffId, staff.id))
    .where(and(...conditions))
    .orderBy(desc(supplyRequests.createdAt));
}

export async function approveSupplyRequest(
  id: string,
  approvedBy: string,
  inventoryItemId?: string
) {
  const [result] = await db
    .update(supplyRequests)
    .set({
      status: "approved",
      approvedBy,
      inventoryItemId,
      updatedAt: new Date(),
    })
    .where(eq(supplyRequests.id, id))
    .returning();
  return result;
}

export async function fulfillSupplyRequest(id: string) {
  const [result] = await db
    .update(supplyRequests)
    .set({
      status: "fulfilled",
      fulfilledAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(supplyRequests.id, id))
    .returning();
  return result;
}

export async function rejectSupplyRequest(
  id: string,
  approvedBy: string,
  notes?: string
) {
  const [result] = await db
    .update(supplyRequests)
    .set({
      status: "rejected",
      approvedBy,
      notes,
      updatedAt: new Date(),
    })
    .where(eq(supplyRequests.id, id))
    .returning();
  return result;
}

// ─── Cleaning Stats ───

export async function getCleaningStats(societyId: string) {
  const today = new Date().toISOString().split("T")[0];

  const [stats] = await db
    .select({
      totalToday: sql<number>`count(*) filter (where ${cleaningLogs.scheduledDate} = ${today})`,
      completedToday: sql<number>`count(*) filter (where ${cleaningLogs.scheduledDate} = ${today} and ${cleaningLogs.status} in ('completed', 'verified'))`,
      inProgressToday: sql<number>`count(*) filter (where ${cleaningLogs.scheduledDate} = ${today} and ${cleaningLogs.status} = 'in_progress')`,
      avgRating: sql<string>`coalesce(round(avg(${cleaningLogs.rating})::numeric, 1), 0)`,
    })
    .from(cleaningLogs)
    .where(eq(cleaningLogs.societyId, societyId));

  const [zoneStats] = await db
    .select({
      totalZones: sql<number>`count(*)`,
    })
    .from(cleaningZones)
    .where(
      and(
        eq(cleaningZones.societyId, societyId),
        eq(cleaningZones.isActive, true)
      )
    );

  const [supplyStats] = await db
    .select({
      pendingRequests: sql<number>`count(*) filter (where ${supplyRequests.status} = 'pending')`,
    })
    .from(supplyRequests)
    .where(eq(supplyRequests.societyId, societyId));

  return {
    totalZones: zoneStats.totalZones,
    today: {
      total: stats.totalToday,
      completed: stats.completedToday,
      inProgress: stats.inProgressToday,
      completionRate:
        stats.totalToday > 0
          ? Math.round((stats.completedToday / stats.totalToday) * 100)
          : 0,
    },
    avgRating: parseFloat(stats.avgRating),
    pendingSupplyRequests: supplyStats.pendingRequests,
  };
}

// ─── Resident-Facing ───

export async function getCleaningScheduleForBlock(
  societyId: string,
  blockId: string,
  date: string
) {
  return db
    .select({
      log: cleaningLogs,
      zoneName: cleaningZones.name,
      zoneType: cleaningZones.zoneType,
      zoneFloor: cleaningZones.floor,
      staffName: staff.name,
    })
    .from(cleaningLogs)
    .innerJoin(cleaningZones, eq(cleaningLogs.zoneId, cleaningZones.id))
    .leftJoin(staff, eq(cleaningLogs.staffId, staff.id))
    .where(
      and(
        eq(cleaningLogs.societyId, societyId),
        eq(cleaningZones.blockId, blockId),
        eq(cleaningLogs.scheduledDate, date)
      )
    )
    .orderBy(cleaningZones.name);
}
