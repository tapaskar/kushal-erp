"use server";

import { db } from "@/db";
import { complaints, complaintAssignments, users, units, blocks } from "@/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/session";
import { COMPLAINT_SLA_HOURS } from "@/lib/constants";

export async function getComplaints(societyId: string) {
  return db
    .select({
      complaint: complaints,
      raisedByUser: { name: users.name },
    })
    .from(complaints)
    .leftJoin(users, eq(complaints.raisedBy, users.id))
    .where(eq(complaints.societyId, societyId))
    .orderBy(desc(complaints.createdAt));
}

export async function getComplaint(complaintId: string) {
  const [result] = await db
    .select({
      complaint: complaints,
      raisedByUser: { name: users.name },
    })
    .from(complaints)
    .leftJoin(users, eq(complaints.raisedBy, users.id))
    .where(eq(complaints.id, complaintId))
    .limit(1);
  return result;
}

export async function createComplaint(data: {
  societyId: string;
  unitId?: string;
  title: string;
  description: string;
  category: string;
  priority?: "low" | "medium" | "high" | "urgent";
}) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  // Generate complaint number: CMP-YYYYMMDD-XXXX
  const today = new Date().toISOString().split("T")[0].replace(/-/g, "");
  const [countResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(complaints)
    .where(eq(complaints.societyId, data.societyId));
  const seq = (countResult.count + 1).toString().padStart(4, "0");
  const complaintNumber = `CMP-${today}-${seq}`;

  const slaHours = COMPLAINT_SLA_HOURS[data.category] || 48;

  const [complaint] = await db
    .insert(complaints)
    .values({
      ...data,
      complaintNumber,
      raisedBy: session.userId,
      slaHours,
    })
    .returning();

  revalidatePath("/complaints");
  return complaint;
}

export async function updateComplaintStatus(
  complaintId: string,
  status: "open" | "assigned" | "in_progress" | "resolved" | "closed" | "reopened",
  resolution?: string
) {
  const updates: Record<string, unknown> = {
    status,
    updatedAt: new Date(),
  };

  if (status === "resolved") {
    updates.resolvedAt = new Date();
    if (resolution) updates.resolution = resolution;
  }
  if (status === "closed") {
    updates.closedAt = new Date();
  }

  const [updated] = await db
    .update(complaints)
    .set(updates)
    .where(eq(complaints.id, complaintId))
    .returning();

  revalidatePath("/complaints");
  return updated;
}

export async function getComplaintStats(societyId: string) {
  const [stats] = await db
    .select({
      total: sql<number>`count(*)`,
      open: sql<number>`count(*) filter (where ${complaints.status} in ('open', 'assigned', 'in_progress', 'reopened'))`,
      resolved: sql<number>`count(*) filter (where ${complaints.status} in ('resolved', 'closed'))`,
    })
    .from(complaints)
    .where(eq(complaints.societyId, societyId));
  return stats;
}
