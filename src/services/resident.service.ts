"use server";

import { db } from "@/db";
import { units, members, complaints } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";

export async function getSocietyOverview(societyId: string) {
  const [unitStats] = await db
    .select({
      totalUnits: sql<number>`count(*)`,
      occupied: sql<number>`count(*) filter (where ${units.occupancyStatus} != 'vacant')`,
      vacant: sql<number>`count(*) filter (where ${units.occupancyStatus} = 'vacant')`,
    })
    .from(units)
    .where(eq(units.societyId, societyId));

  const [memberStats] = await db
    .select({
      totalMembers: sql<number>`count(*)`,
      owners: sql<number>`count(*) filter (where ${members.memberType} = 'owner')`,
      tenants: sql<number>`count(*) filter (where ${members.memberType} = 'tenant')`,
    })
    .from(members)
    .where(and(eq(members.societyId, societyId), eq(members.isActive, true)));

  return {
    totalUnits: unitStats.totalUnits,
    occupied: unitStats.occupied,
    vacant: unitStats.vacant,
    totalMembers: memberStats.totalMembers,
    owners: memberStats.owners,
    tenants: memberStats.tenants,
  };
}

export async function getComplaintCategorySummary(societyId: string) {
  const result = await db
    .select({
      category: complaints.category,
      total: sql<number>`count(*)`,
      open: sql<number>`count(*) filter (where ${complaints.status} in ('open', 'assigned', 'in_progress', 'reopened'))`,
      resolved: sql<number>`count(*) filter (where ${complaints.status} in ('resolved', 'closed'))`,
    })
    .from(complaints)
    .where(eq(complaints.societyId, societyId))
    .groupBy(complaints.category);

  return result.map((r) => ({
    category: r.category,
    total: r.total,
    open: r.open,
    resolved: r.resolved,
    resolutionRate: r.total > 0 ? Math.round((r.resolved / r.total) * 100) : 0,
  }));
}
