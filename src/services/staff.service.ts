import { db } from "@/db";
import {
  staff,
  shifts,
  locationLogs,
  beacons,
  beaconEvents,
  patrolRoutes,
  patrolLogs,
  staffTasks,
  complaints,
} from "@/db/schema";
import { eq, and, desc, sql, gte, lte, inArray } from "drizzle-orm";

// ─── Staff CRUD ───

export async function getStaffBySociety(
  societyId: string,
  filters?: { role?: string; isActive?: boolean }
) {
  const conditions = [eq(staff.societyId, societyId)];
  if (filters?.role) {
    conditions.push(
      eq(staff.role, filters.role as typeof staff.role.enumValues[number])
    );
  }
  if (filters?.isActive !== undefined) {
    conditions.push(eq(staff.isActive, filters.isActive));
  }

  return db
    .select()
    .from(staff)
    .where(and(...conditions))
    .orderBy(staff.name);
}

export async function getStaffById(staffId: string) {
  const [result] = await db
    .select()
    .from(staff)
    .where(eq(staff.id, staffId))
    .limit(1);
  return result;
}

export async function createStaff(data: {
  societyId: string;
  employeeCode: string;
  name: string;
  phone: string;
  email?: string;
  role: typeof staff.role.enumValues[number];
  department?: string;
  aadhaarLast4?: string;
  emergencyContact?: string;
  employedSince?: string;
  contractorName?: string;
  monthlySalary?: string;
  createdBy?: string;
}) {
  const [result] = await db.insert(staff).values(data).returning();
  return result;
}

export async function updateStaff(
  staffId: string,
  data: Partial<{
    name: string;
    phone: string;
    email: string;
    role: typeof staff.role.enumValues[number];
    department: string;
    photoUrl: string;
    aadhaarLast4: string;
    emergencyContact: string;
    contractorName: string;
    monthlySalary: string;
    isActive: boolean;
  }>
) {
  const [result] = await db
    .update(staff)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(staff.id, staffId))
    .returning();
  return result;
}

// ─── Shifts ───

export async function getShiftsForStaff(
  staffId: string,
  dateFrom?: string,
  dateTo?: string
) {
  const conditions = [eq(shifts.staffId, staffId)];
  if (dateFrom) conditions.push(gte(shifts.date, dateFrom));
  if (dateTo) conditions.push(lte(shifts.date, dateTo));

  return db
    .select()
    .from(shifts)
    .where(and(...conditions))
    .orderBy(desc(shifts.date));
}

export async function getShiftsForSociety(societyId: string, date: string) {
  return db
    .select({
      shift: shifts,
      staffName: staff.name,
      staffRole: staff.role,
      staffPhone: staff.phone,
    })
    .from(shifts)
    .innerJoin(staff, eq(shifts.staffId, staff.id))
    .where(and(eq(shifts.societyId, societyId), eq(shifts.date, date)))
    .orderBy(shifts.scheduledStart);
}

export async function getCurrentShift(staffId: string) {
  const today = new Date().toISOString().split("T")[0];
  const [result] = await db
    .select()
    .from(shifts)
    .where(
      and(
        eq(shifts.staffId, staffId),
        eq(shifts.date, today),
        inArray(shifts.status, ["scheduled", "checked_in"])
      )
    )
    .orderBy(shifts.scheduledStart)
    .limit(1);
  return result;
}

export async function createShift(data: {
  societyId: string;
  staffId: string;
  date: string;
  scheduledStart: Date;
  scheduledEnd: Date;
}) {
  const [result] = await db.insert(shifts).values(data).returning();
  return result;
}

export async function createShiftsBulk(
  shiftList: {
    societyId: string;
    staffId: string;
    date: string;
    scheduledStart: Date;
    scheduledEnd: Date;
  }[]
) {
  return db.insert(shifts).values(shiftList).returning();
}

export async function checkIn(
  shiftId: string,
  data: {
    lat: string;
    lng: string;
    photoUrl?: string;
  }
) {
  const [result] = await db
    .update(shifts)
    .set({
      status: "checked_in",
      actualCheckIn: new Date(),
      checkInLat: data.lat,
      checkInLng: data.lng,
      checkInPhotoUrl: data.photoUrl,
      updatedAt: new Date(),
    })
    .where(eq(shifts.id, shiftId))
    .returning();
  return result;
}

export async function checkOut(
  shiftId: string,
  data: {
    lat: string;
    lng: string;
    photoUrl?: string;
  }
) {
  const [result] = await db
    .update(shifts)
    .set({
      status: "checked_out",
      actualCheckOut: new Date(),
      checkOutLat: data.lat,
      checkOutLng: data.lng,
      checkOutPhotoUrl: data.photoUrl,
      updatedAt: new Date(),
    })
    .where(eq(shifts.id, shiftId))
    .returning();
  return result;
}

// ─── Location Logs ───

export async function batchInsertLocationLogs(
  logs: {
    societyId: string;
    staffId: string;
    shiftId?: string;
    latitude: string;
    longitude: string;
    accuracy?: string;
    altitude?: string;
    speed?: string;
    heading?: string;
    source?: typeof locationLogs.source.enumValues[number];
    batteryLevel?: string;
    isMoving?: boolean;
    recordedAt: Date;
  }[]
) {
  if (logs.length === 0) return [];
  return db.insert(locationLogs).values(logs).returning({ id: locationLogs.id });
}

export async function getLatestLocation(staffId: string) {
  const [result] = await db
    .select()
    .from(locationLogs)
    .where(eq(locationLogs.staffId, staffId))
    .orderBy(desc(locationLogs.recordedAt))
    .limit(1);
  return result;
}

export async function getLocationHistory(
  staffId: string,
  from: Date,
  to: Date
) {
  return db
    .select()
    .from(locationLogs)
    .where(
      and(
        eq(locationLogs.staffId, staffId),
        gte(locationLogs.recordedAt, from),
        lte(locationLogs.recordedAt, to)
      )
    )
    .orderBy(locationLogs.recordedAt);
}

export async function getLatestLocationsForSociety(societyId: string) {
  return db
    .select({
      staffId: staff.id,
      staffName: staff.name,
      staffRole: staff.role,
      latitude: locationLogs.latitude,
      longitude: locationLogs.longitude,
      source: locationLogs.source,
      recordedAt: locationLogs.recordedAt,
    })
    .from(locationLogs)
    .innerJoin(staff, eq(locationLogs.staffId, staff.id))
    .where(
      and(
        eq(locationLogs.societyId, societyId),
        eq(staff.isActive, true),
        sql`${locationLogs.id} IN (
          SELECT DISTINCT ON (staff_id) id
          FROM location_logs
          WHERE society_id = ${societyId}
          ORDER BY staff_id, recorded_at DESC
        )`
      )
    )
    .orderBy(staff.name);
}

// ─── Beacons ───

export async function getBeaconById(beaconId: string) {
  const [result] = await db
    .select()
    .from(beacons)
    .where(eq(beacons.id, beaconId))
    .limit(1);
  return result;
}

export async function getBeaconsForSociety(societyId: string) {
  return db
    .select()
    .from(beacons)
    .where(and(eq(beacons.societyId, societyId), eq(beacons.isActive, true)))
    .orderBy(beacons.label);
}

export async function createBeacon(data: {
  societyId: string;
  uuid: string;
  major: number;
  minor: number;
  label: string;
  location?: string;
  latitude?: string;
  longitude?: string;
  floor?: number;
}) {
  const [result] = await db.insert(beacons).values(data).returning();
  return result;
}

export async function updateBeacon(
  beaconId: string,
  data: Partial<{
    label: string;
    location: string;
    latitude: string;
    longitude: string;
    floor: number;
    isActive: boolean;
  }>
) {
  const [result] = await db
    .update(beacons)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(beacons.id, beaconId))
    .returning();
  return result;
}

export async function batchInsertBeaconEvents(
  events: {
    societyId: string;
    staffId: string;
    beaconId: string;
    shiftId?: string;
    eventType: string;
    rssi?: number;
    dwellSeconds?: number;
    recordedAt: Date;
  }[]
) {
  if (events.length === 0) return [];
  return db
    .insert(beaconEvents)
    .values(events)
    .returning({ id: beaconEvents.id });
}

// ─── Patrol Routes ───

export async function getPatrolRoutes(societyId: string) {
  return db
    .select()
    .from(patrolRoutes)
    .where(
      and(eq(patrolRoutes.societyId, societyId), eq(patrolRoutes.isActive, true))
    )
    .orderBy(patrolRoutes.name);
}

export async function createPatrolRoute(data: {
  societyId: string;
  name: string;
  description?: string;
  estimatedDurationMin?: number;
  checkpoints: {
    order: number;
    beaconId?: string;
    label: string;
    latitude?: number;
    longitude?: number;
    requiredAction?: string;
  }[];
}) {
  const [result] = await db.insert(patrolRoutes).values(data).returning();
  return result;
}

export async function updatePatrolRoute(
  routeId: string,
  data: Partial<{
    name: string;
    description: string;
    estimatedDurationMin: number;
    checkpoints: {
      order: number;
      beaconId?: string;
      label: string;
      latitude?: number;
      longitude?: number;
      requiredAction?: string;
    }[];
    isActive: boolean;
  }>
) {
  const [result] = await db
    .update(patrolRoutes)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(patrolRoutes.id, routeId))
    .returning();
  return result;
}

// ─── Patrol Logs ───

export async function getPatrolLogsForStaff(staffId: string) {
  return db
    .select({
      log: patrolLogs,
      routeName: patrolRoutes.name,
    })
    .from(patrolLogs)
    .innerJoin(patrolRoutes, eq(patrolLogs.patrolRouteId, patrolRoutes.id))
    .where(eq(patrolLogs.staffId, staffId))
    .orderBy(desc(patrolLogs.createdAt));
}

export async function getPatrolLogsForSociety(
  societyId: string,
  filters?: { date?: string; status?: string }
) {
  const conditions = [eq(patrolLogs.societyId, societyId)];

  return db
    .select({
      log: patrolLogs,
      routeName: patrolRoutes.name,
      staffName: staff.name,
      staffRole: staff.role,
    })
    .from(patrolLogs)
    .innerJoin(patrolRoutes, eq(patrolLogs.patrolRouteId, patrolRoutes.id))
    .innerJoin(staff, eq(patrolLogs.staffId, staff.id))
    .where(and(...conditions))
    .orderBy(desc(patrolLogs.createdAt));
}

export async function getPatrolLog(patrolLogId: string) {
  const [result] = await db
    .select({
      log: patrolLogs,
      routeName: patrolRoutes.name,
      routeCheckpoints: patrolRoutes.checkpoints,
    })
    .from(patrolLogs)
    .innerJoin(patrolRoutes, eq(patrolLogs.patrolRouteId, patrolRoutes.id))
    .where(eq(patrolLogs.id, patrolLogId))
    .limit(1);
  return result;
}

export async function createPatrolLog(data: {
  societyId: string;
  patrolRouteId: string;
  staffId: string;
  shiftId?: string;
  totalCheckpoints: number;
}) {
  const [result] = await db.insert(patrolLogs).values(data).returning();
  return result;
}

export async function startPatrol(patrolLogId: string) {
  const [result] = await db
    .update(patrolLogs)
    .set({
      status: "in_progress",
      startedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(patrolLogs.id, patrolLogId))
    .returning();
  return result;
}

export async function recordCheckpoint(
  patrolLogId: string,
  checkpoint: {
    checkpointIndex: number;
    label: string;
    visitedAt: string;
    latitude?: number;
    longitude?: number;
    photoUrl?: string;
    beaconDetected?: boolean;
    notes?: string;
  }
) {
  const log = await getPatrolLog(patrolLogId);
  if (!log) throw new Error("Patrol log not found");

  const currentResults = (log.log.checkpointResults || []) as {
    checkpointIndex: number;
    label: string;
    visitedAt: string;
    latitude?: number;
    longitude?: number;
    photoUrl?: string;
    beaconDetected?: boolean;
    notes?: string;
  }[];
  const updatedResults = [...currentResults, checkpoint];

  const [result] = await db
    .update(patrolLogs)
    .set({
      checkpointResults: updatedResults,
      visitedCheckpoints: updatedResults.length,
      updatedAt: new Date(),
    })
    .where(eq(patrolLogs.id, patrolLogId))
    .returning();
  return result;
}

export async function completePatrol(patrolLogId: string) {
  const log = await getPatrolLog(patrolLogId);
  if (!log) throw new Error("Patrol log not found");

  const visited = log.log.visitedCheckpoints;
  const total = log.log.totalCheckpoints;
  const status = visited >= total ? "completed" : "partial";

  const [result] = await db
    .update(patrolLogs)
    .set({
      status,
      completedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(patrolLogs.id, patrolLogId))
    .returning();
  return result;
}

// ─── Staff Tasks ───

export async function getTasksForStaff(
  staffId: string,
  filters?: { status?: string; taskType?: string }
) {
  const conditions = [eq(staffTasks.staffId, staffId)];
  if (filters?.status) {
    conditions.push(
      eq(
        staffTasks.status,
        filters.status as typeof staffTasks.status.enumValues[number]
      )
    );
  }
  if (filters?.taskType) {
    conditions.push(
      eq(
        staffTasks.taskType,
        filters.taskType as typeof staffTasks.taskType.enumValues[number]
      )
    );
  }

  return db
    .select()
    .from(staffTasks)
    .where(and(...conditions))
    .orderBy(desc(staffTasks.createdAt));
}

export async function getTasksForSociety(
  societyId: string,
  filters?: { status?: string; staffId?: string }
) {
  const conditions = [eq(staffTasks.societyId, societyId)];
  if (filters?.status) {
    conditions.push(
      eq(
        staffTasks.status,
        filters.status as typeof staffTasks.status.enumValues[number]
      )
    );
  }
  if (filters?.staffId) {
    conditions.push(eq(staffTasks.staffId, filters.staffId));
  }

  return db
    .select({
      task: staffTasks,
      staffName: staff.name,
      staffRole: staff.role,
    })
    .from(staffTasks)
    .leftJoin(staff, eq(staffTasks.staffId, staff.id))
    .where(and(...conditions))
    .orderBy(desc(staffTasks.createdAt));
}

export async function getStaffTask(taskId: string) {
  const [result] = await db
    .select()
    .from(staffTasks)
    .where(eq(staffTasks.id, taskId))
    .limit(1);
  return result;
}

export async function createStaffTask(data: {
  societyId: string;
  staffId?: string;
  taskType: typeof staffTasks.taskType.enumValues[number];
  title: string;
  description?: string;
  priority?: "low" | "medium" | "high" | "urgent";
  complaintId?: string;
  maintenanceScheduleId?: string;
  location?: string;
  latitude?: string;
  longitude?: string;
  dueBy?: Date;
  assignedBy?: string;
}) {
  const [result] = await db.insert(staffTasks).values(data).returning();
  return result;
}

export async function updateTaskStatus(
  taskId: string,
  status: typeof staffTasks.status.enumValues[number],
  data?: {
    resolution?: string;
    beforePhotoUrl?: string;
    afterPhotoUrl?: string;
  }
) {
  const updates: Record<string, unknown> = {
    status,
    updatedAt: new Date(),
  };

  if (status === "in_progress") {
    updates.startedAt = new Date();
  }
  if (status === "completed") {
    updates.completedAt = new Date();
  }
  if (data?.resolution) updates.resolution = data.resolution;
  if (data?.beforePhotoUrl) updates.beforePhotoUrl = data.beforePhotoUrl;
  if (data?.afterPhotoUrl) updates.afterPhotoUrl = data.afterPhotoUrl;

  const [result] = await db
    .update(staffTasks)
    .set(updates)
    .where(eq(staffTasks.id, taskId))
    .returning();
  return result;
}

// ─── Reports ───

export async function getStaffReportsSummary(
  societyId: string,
  dateFrom?: string,
  dateTo?: string
) {
  const today = new Date().toISOString().split("T")[0];

  const [staffStats] = await db
    .select({
      totalActive: sql<number>`count(*) filter (where ${staff.isActive} = true)`,
      byRole: sql<Record<string, number>>`jsonb_object_agg(${staff.role}, role_count) filter (where role_count is not null)`,
    })
    .from(
      db
        .select({
          role: staff.role,
          role_count: sql<number>`count(*)`.as("role_count"),
          isActive: staff.isActive,
        })
        .from(staff)
        .where(and(eq(staff.societyId, societyId), eq(staff.isActive, true)))
        .groupBy(staff.role, staff.isActive)
        .as("role_stats")
    );

  const [shiftStats] = await db
    .select({
      todayTotal: sql<number>`count(*)`,
      checkedIn: sql<number>`count(*) filter (where ${shifts.status} = 'checked_in')`,
      checkedOut: sql<number>`count(*) filter (where ${shifts.status} = 'checked_out')`,
      missed: sql<number>`count(*) filter (where ${shifts.status} = 'missed')`,
    })
    .from(shifts)
    .where(and(eq(shifts.societyId, societyId), eq(shifts.date, today)));

  const [taskStats] = await db
    .select({
      pendingTasks: sql<number>`count(*) filter (where ${staffTasks.status} in ('pending', 'accepted'))`,
      inProgressTasks: sql<number>`count(*) filter (where ${staffTasks.status} = 'in_progress')`,
      completedToday: sql<number>`count(*) filter (where ${staffTasks.status} = 'completed' and ${staffTasks.completedAt}::date = ${today})`,
    })
    .from(staffTasks)
    .where(eq(staffTasks.societyId, societyId));

  return {
    staff: {
      totalActive: staffStats.totalActive,
      byRole: staffStats.byRole || {},
    },
    shifts: {
      todayTotal: shiftStats.todayTotal,
      checkedIn: shiftStats.checkedIn,
      checkedOut: shiftStats.checkedOut,
      missed: shiftStats.missed,
    },
    tasks: {
      pending: taskStats.pendingTasks,
      inProgress: taskStats.inProgressTasks,
      completedToday: taskStats.completedToday,
    },
  };
}

export async function getShiftComplianceReport(
  societyId: string,
  dateFrom: string,
  dateTo: string
) {
  return db
    .select({
      staffId: staff.id,
      staffName: staff.name,
      staffRole: staff.role,
      totalShifts: sql<number>`count(*)`,
      checkedIn: sql<number>`count(*) filter (where ${shifts.status} in ('checked_in', 'checked_out'))`,
      missed: sql<number>`count(*) filter (where ${shifts.status} = 'missed')`,
      avgHours: sql<string>`coalesce(round(avg(extract(epoch from (${shifts.actualCheckOut} - ${shifts.actualCheckIn})) / 3600)::numeric, 1), 0)`,
      onTimePercent: sql<number>`round(count(*) filter (where ${shifts.actualCheckIn} <= ${shifts.scheduledStart} + interval '15 minutes' and ${shifts.actualCheckIn} is not null) * 100.0 / nullif(count(*), 0))`,
    })
    .from(shifts)
    .innerJoin(staff, eq(shifts.staffId, staff.id))
    .where(
      and(
        eq(shifts.societyId, societyId),
        sql`${shifts.date} >= ${dateFrom}`,
        sql`${shifts.date} <= ${dateTo}`
      )
    )
    .groupBy(staff.id, staff.name, staff.role)
    .orderBy(staff.name);
}

export async function getAttendanceReport(societyId: string, date: string) {
  return db
    .select({
      shift: shifts,
      staffName: staff.name,
      staffRole: staff.role,
      staffEmployeeCode: staff.employeeCode,
    })
    .from(shifts)
    .innerJoin(staff, eq(shifts.staffId, staff.id))
    .where(and(eq(shifts.societyId, societyId), eq(shifts.date, date)))
    .orderBy(staff.name);
}

export async function getStaffStats(societyId: string) {
  const [stats] = await db
    .select({
      totalStaff: sql<number>`count(*) filter (where ${staff.isActive} = true)`,
      activeShifts: sql<number>`0`,
    })
    .from(staff)
    .where(eq(staff.societyId, societyId));

  const today = new Date().toISOString().split("T")[0];
  const [shiftStats] = await db
    .select({
      checkedIn: sql<number>`count(*) filter (where ${shifts.status} = 'checked_in')`,
      scheduled: sql<number>`count(*) filter (where ${shifts.status} = 'scheduled')`,
      total: sql<number>`count(*)`,
    })
    .from(shifts)
    .where(and(eq(shifts.societyId, societyId), eq(shifts.date, today)));

  const [taskStats] = await db
    .select({
      pending: sql<number>`count(*) filter (where ${staffTasks.status} in ('pending', 'accepted'))`,
      inProgress: sql<number>`count(*) filter (where ${staffTasks.status} = 'in_progress')`,
      completedToday: sql<number>`count(*) filter (where ${staffTasks.status} = 'completed' and ${staffTasks.completedAt}::date = current_date)`,
    })
    .from(staffTasks)
    .where(eq(staffTasks.societyId, societyId));

  return {
    totalStaff: stats.totalStaff,
    shiftsToday: {
      checkedIn: shiftStats.checkedIn,
      scheduled: shiftStats.scheduled,
      total: shiftStats.total,
    },
    tasks: {
      pending: taskStats.pending,
      inProgress: taskStats.inProgress,
      completedToday: taskStats.completedToday,
    },
  };
}

// ─── Detailed Reports ───

export async function getAttendanceReportRange(
  societyId: string,
  dateFrom: string,
  dateTo: string
) {
  return db
    .select({
      staffId: staff.id,
      staffName: staff.name,
      staffRole: staff.role,
      employeeCode: staff.employeeCode,
      date: shifts.date,
      scheduledStart: shifts.scheduledStart,
      scheduledEnd: shifts.scheduledEnd,
      actualCheckIn: shifts.actualCheckIn,
      actualCheckOut: shifts.actualCheckOut,
      status: shifts.status,
      hoursWorked: sql<string>`CASE
        WHEN ${shifts.actualCheckIn} IS NOT NULL AND ${shifts.actualCheckOut} IS NOT NULL
        THEN round(extract(epoch from (${shifts.actualCheckOut} - ${shifts.actualCheckIn})) / 3600.0, 1)::text
        ELSE NULL
      END`,
    })
    .from(shifts)
    .innerJoin(staff, eq(shifts.staffId, staff.id))
    .where(
      and(
        eq(shifts.societyId, societyId),
        sql`${shifts.date} >= ${dateFrom}`,
        sql`${shifts.date} <= ${dateTo}`
      )
    )
    .orderBy(staff.name, shifts.date);
}

export async function getPatrolCompletionReport(
  societyId: string,
  dateFrom: string,
  dateTo: string
) {
  const fromDate = new Date(dateFrom);
  const toDate = new Date(dateTo + "T23:59:59");

  return db
    .select({
      patrolLogId: patrolLogs.id,
      routeName: patrolRoutes.name,
      staffName: staff.name,
      staffRole: staff.role,
      status: patrolLogs.status,
      startedAt: patrolLogs.startedAt,
      completedAt: patrolLogs.completedAt,
      totalCheckpoints: patrolLogs.totalCheckpoints,
      visitedCheckpoints: patrolLogs.visitedCheckpoints,
      completionPercent: sql<number>`CASE
        WHEN ${patrolLogs.totalCheckpoints} > 0
        THEN round(${patrolLogs.visitedCheckpoints} * 100.0 / ${patrolLogs.totalCheckpoints})
        ELSE 0
      END`,
      timeTakenMin: sql<string>`CASE
        WHEN ${patrolLogs.startedAt} IS NOT NULL AND ${patrolLogs.completedAt} IS NOT NULL
        THEN round(extract(epoch from (${patrolLogs.completedAt} - ${patrolLogs.startedAt})) / 60.0)::text
        ELSE NULL
      END`,
    })
    .from(patrolLogs)
    .innerJoin(patrolRoutes, eq(patrolLogs.patrolRouteId, patrolRoutes.id))
    .innerJoin(staff, eq(patrolLogs.staffId, staff.id))
    .where(
      and(
        eq(patrolLogs.societyId, societyId),
        gte(patrolLogs.createdAt, fromDate),
        lte(patrolLogs.createdAt, toDate)
      )
    )
    .orderBy(desc(patrolLogs.createdAt));
}

export async function getAreaPresenceReport(
  societyId: string,
  dateFrom: string,
  dateTo: string
) {
  const fromDate = new Date(dateFrom);
  const toDate = new Date(dateTo + "T23:59:59");

  return db
    .select({
      eventId: beaconEvents.id,
      staffName: staff.name,
      staffRole: staff.role,
      beaconLabel: beacons.label,
      beaconLocation: beacons.location,
      beaconFloor: beacons.floor,
      eventType: beaconEvents.eventType,
      recordedAt: beaconEvents.recordedAt,
    })
    .from(beaconEvents)
    .innerJoin(staff, eq(beaconEvents.staffId, staff.id))
    .innerJoin(beacons, eq(beaconEvents.beaconId, beacons.id))
    .where(
      and(
        eq(beaconEvents.societyId, societyId),
        gte(beaconEvents.recordedAt, fromDate),
        lte(beaconEvents.recordedAt, toDate)
      )
    )
    .orderBy(desc(beaconEvents.recordedAt));
}
