import { db } from "@/db";
import {
  visitorLogs,
  incidents,
  sosAlerts,
  staff,
} from "@/db/schema";
import { eq, and, desc, sql, gte, lte } from "drizzle-orm";

// ─── Visitor Logs ───

export async function createVisitorLog(data: {
  societyId: string;
  staffId?: string;
  visitorName: string;
  visitorPhone?: string;
  visitorType?: typeof visitorLogs.visitorType.enumValues[number];
  unitId?: string;
  purpose?: string;
  vehicleNumber?: string;
  photoUrl?: string;
  idProofUrl?: string;
  status?: typeof visitorLogs.status.enumValues[number];
  expectedAt?: Date;
  checkInAt?: Date;
  checkInGate?: string;
  approvedBy?: string;
  notes?: string;
}) {
  const [result] = await db
    .insert(visitorLogs)
    .values({
      ...data,
      checkInAt: data.checkInAt || new Date(),
      status: data.status || "checked_in",
    })
    .returning();
  return result;
}

export async function checkOutVisitor(
  logId: string,
  data: { checkOutGate?: string; notes?: string }
) {
  const [result] = await db
    .update(visitorLogs)
    .set({
      status: "checked_out",
      checkOutAt: new Date(),
      checkOutGate: data.checkOutGate,
      notes: data.notes,
    })
    .where(eq(visitorLogs.id, logId))
    .returning();
  return result;
}

export async function getVisitorLogs(
  societyId: string,
  filters?: { date?: string; status?: string; staffId?: string }
) {
  const conditions = [eq(visitorLogs.societyId, societyId)];
  if (filters?.status) {
    conditions.push(
      eq(
        visitorLogs.status,
        filters.status as typeof visitorLogs.status.enumValues[number]
      )
    );
  }
  if (filters?.date) {
    conditions.push(sql`${visitorLogs.createdAt}::date = ${filters.date}`);
  }
  if (filters?.staffId) {
    conditions.push(eq(visitorLogs.staffId, filters.staffId));
  }

  return db
    .select({
      visitor: visitorLogs,
      staffName: staff.name,
    })
    .from(visitorLogs)
    .leftJoin(staff, eq(visitorLogs.staffId, staff.id))
    .where(and(...conditions))
    .orderBy(desc(visitorLogs.createdAt));
}

export async function getActiveVisitors(societyId: string) {
  return db
    .select({
      visitor: visitorLogs,
      staffName: staff.name,
    })
    .from(visitorLogs)
    .leftJoin(staff, eq(visitorLogs.staffId, staff.id))
    .where(
      and(
        eq(visitorLogs.societyId, societyId),
        eq(visitorLogs.status, "checked_in")
      )
    )
    .orderBy(desc(visitorLogs.checkInAt));
}

// ─── Incidents ───

export async function createIncident(data: {
  societyId: string;
  reportedBy: string;
  severity?: typeof incidents.severity.enumValues[number];
  title: string;
  description?: string;
  location?: string;
  latitude?: string;
  longitude?: string;
  photoUrls?: string[];
}) {
  const [result] = await db.insert(incidents).values(data).returning();
  return result;
}

export async function getIncidents(
  societyId: string,
  filters?: { status?: string; severity?: string }
) {
  const conditions = [eq(incidents.societyId, societyId)];
  if (filters?.status) {
    conditions.push(
      eq(
        incidents.status,
        filters.status as typeof incidents.status.enumValues[number]
      )
    );
  }
  if (filters?.severity) {
    conditions.push(
      eq(
        incidents.severity,
        filters.severity as typeof incidents.severity.enumValues[number]
      )
    );
  }

  return db
    .select({
      incident: incidents,
      reporterName: staff.name,
    })
    .from(incidents)
    .innerJoin(staff, eq(incidents.reportedBy, staff.id))
    .where(and(...conditions))
    .orderBy(desc(incidents.createdAt));
}

export async function updateIncidentStatus(
  id: string,
  status: typeof incidents.status.enumValues[number],
  resolution?: string,
  resolvedBy?: string
) {
  const updates: Record<string, unknown> = {
    status,
    updatedAt: new Date(),
  };
  if (status === "resolved") {
    updates.resolvedAt = new Date();
    updates.resolvedBy = resolvedBy;
    updates.resolution = resolution;
  }

  const [result] = await db
    .update(incidents)
    .set(updates)
    .where(eq(incidents.id, id))
    .returning();
  return result;
}

export async function getIncidentsByStaff(staffId: string) {
  return db
    .select()
    .from(incidents)
    .where(eq(incidents.reportedBy, staffId))
    .orderBy(desc(incidents.createdAt));
}

// ─── SOS Alerts ───

export async function createSosAlert(data: {
  societyId: string;
  staffId: string;
  latitude?: string;
  longitude?: string;
  message?: string;
}) {
  const [result] = await db.insert(sosAlerts).values(data).returning();
  return result;
}

export async function getActiveSosAlerts(societyId: string) {
  return db
    .select({
      alert: sosAlerts,
      staffName: staff.name,
      staffRole: staff.role,
      staffPhone: staff.phone,
    })
    .from(sosAlerts)
    .innerJoin(staff, eq(sosAlerts.staffId, staff.id))
    .where(
      and(
        eq(sosAlerts.societyId, societyId),
        eq(sosAlerts.isResolved, false)
      )
    )
    .orderBy(desc(sosAlerts.createdAt));
}

export async function resolveSosAlert(id: string, resolvedBy: string) {
  const [result] = await db
    .update(sosAlerts)
    .set({
      isResolved: true,
      resolvedAt: new Date(),
      resolvedBy,
    })
    .where(eq(sosAlerts.id, id))
    .returning();
  return result;
}

// ─── Security Stats ───

export async function getSecurityStats(
  societyId: string,
  dateFrom?: string,
  dateTo?: string
) {
  const today = new Date().toISOString().split("T")[0];

  const [visitorStats] = await db
    .select({
      todayTotal: sql<number>`count(*) filter (where ${visitorLogs.createdAt}::date = ${today})`,
      activeVisitors: sql<number>`count(*) filter (where ${visitorLogs.status} = 'checked_in')`,
    })
    .from(visitorLogs)
    .where(eq(visitorLogs.societyId, societyId));

  const [incidentStats] = await db
    .select({
      openIncidents: sql<number>`count(*) filter (where ${incidents.status} in ('reported', 'investigating'))`,
      todayReported: sql<number>`count(*) filter (where ${incidents.createdAt}::date = ${today})`,
    })
    .from(incidents)
    .where(eq(incidents.societyId, societyId));

  const [sosStats] = await db
    .select({
      activeAlerts: sql<number>`count(*) filter (where ${sosAlerts.isResolved} = false)`,
    })
    .from(sosAlerts)
    .where(eq(sosAlerts.societyId, societyId));

  return {
    visitors: {
      todayTotal: visitorStats.todayTotal,
      activeVisitors: visitorStats.activeVisitors,
    },
    incidents: {
      openIncidents: incidentStats.openIncidents,
      todayReported: incidentStats.todayReported,
    },
    sos: {
      activeAlerts: sosStats.activeAlerts,
    },
  };
}
