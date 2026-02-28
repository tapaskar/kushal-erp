"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/session";
import * as staffService from "./staff.service";

export async function getStaffList(filters?: {
  role?: string;
  isActive?: boolean;
}) {
  const session = await getSession();
  if (!session?.societyId) throw new Error("Unauthorized");
  return staffService.getStaffBySociety(session.societyId, filters);
}

export async function getStaffMember(staffId: string) {
  return staffService.getStaffById(staffId);
}

export async function addStaff(data: {
  employeeCode: string;
  name: string;
  phone: string;
  email?: string;
  role: "security" | "housekeeping" | "maintenance" | "gardener" | "electrician" | "plumber" | "supervisor";
  department?: string;
  aadhaarLast4?: string;
  emergencyContact?: string;
  employedSince?: string;
  contractorName?: string;
  monthlySalary?: string;
}) {
  const session = await getSession();
  if (!session?.societyId) throw new Error("Unauthorized");

  const result = await staffService.createStaff({
    ...data,
    societyId: session.societyId,
    createdBy: session.userId,
  });
  revalidatePath("/staff");
  return result;
}

export async function editStaff(
  staffId: string,
  data: Partial<{
    name: string;
    phone: string;
    email: string;
    role: "security" | "housekeeping" | "maintenance" | "gardener" | "electrician" | "plumber" | "supervisor";
    department: string;
    photoUrl: string;
    aadhaarLast4: string;
    emergencyContact: string;
    contractorName: string;
    monthlySalary: string;
    isActive: boolean;
  }>
) {
  const result = await staffService.updateStaff(staffId, data);
  revalidatePath("/staff");
  return result;
}

export async function getShiftsByDate(date: string) {
  const session = await getSession();
  if (!session?.societyId) throw new Error("Unauthorized");
  return staffService.getShiftsForSociety(session.societyId, date);
}

export async function scheduleShift(data: {
  staffId: string;
  date: string;
  scheduledStart: Date;
  scheduledEnd: Date;
}) {
  const session = await getSession();
  if (!session?.societyId) throw new Error("Unauthorized");

  const result = await staffService.createShift({
    ...data,
    societyId: session.societyId,
  });
  revalidatePath("/staff/shifts");
  return result;
}

export async function scheduleShiftsBulk(
  shiftList: {
    staffId: string;
    date: string;
    scheduledStart: Date;
    scheduledEnd: Date;
  }[]
) {
  const session = await getSession();
  if (!session?.societyId) throw new Error("Unauthorized");

  const result = await staffService.createShiftsBulk(
    shiftList.map((s) => ({ ...s, societyId: session.societyId! }))
  );
  revalidatePath("/staff/shifts");
  return result;
}

export async function getStaffTasks(filters?: {
  status?: string;
  staffId?: string;
}) {
  const session = await getSession();
  if (!session?.societyId) throw new Error("Unauthorized");
  return staffService.getTasksForSociety(session.societyId, filters);
}

export async function assignTask(data: {
  staffId?: string;
  taskType: "complaint" | "maintenance" | "patrol" | "ad_hoc" | "inspection";
  title: string;
  description?: string;
  priority?: "low" | "medium" | "high" | "urgent";
  complaintId?: string;
  maintenanceScheduleId?: string;
  location?: string;
  dueBy?: Date;
}) {
  const session = await getSession();
  if (!session?.societyId) throw new Error("Unauthorized");

  const result = await staffService.createStaffTask({
    ...data,
    societyId: session.societyId,
    assignedBy: session.userId,
  });
  revalidatePath("/staff/tasks");
  return result;
}

export async function getPatrolRoutesList() {
  const session = await getSession();
  if (!session?.societyId) throw new Error("Unauthorized");
  return staffService.getPatrolRoutes(session.societyId);
}

export async function addPatrolRoute(data: {
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
  const session = await getSession();
  if (!session?.societyId) throw new Error("Unauthorized");

  const result = await staffService.createPatrolRoute({
    ...data,
    societyId: session.societyId,
  });
  revalidatePath("/staff/patrols");
  return result;
}

export async function getPatrolLogsList(filters?: {
  date?: string;
  status?: string;
}) {
  const session = await getSession();
  if (!session?.societyId) throw new Error("Unauthorized");
  return staffService.getPatrolLogsForSociety(session.societyId, filters);
}

export async function getBeaconsList() {
  const session = await getSession();
  if (!session?.societyId) throw new Error("Unauthorized");
  return staffService.getBeaconsForSociety(session.societyId);
}

export async function addBeacon(data: {
  uuid: string;
  major: number;
  minor: number;
  label: string;
  location?: string;
  latitude?: string;
  longitude?: string;
  floor?: number;
}) {
  const session = await getSession();
  if (!session?.societyId) throw new Error("Unauthorized");

  const result = await staffService.createBeacon({
    ...data,
    societyId: session.societyId,
  });
  revalidatePath("/staff/beacons");
  return result;
}

export async function getStaffDashboardStats() {
  const session = await getSession();
  if (!session?.societyId) throw new Error("Unauthorized");
  return staffService.getStaffStats(session.societyId);
}

export async function getAttendance(date: string) {
  const session = await getSession();
  if (!session?.societyId) throw new Error("Unauthorized");
  return staffService.getAttendanceReport(session.societyId, date);
}

export async function getStaffLocation(staffId: string) {
  return staffService.getLatestLocation(staffId);
}

export async function getStaffLocationTrail(
  staffId: string,
  from: string,
  to: string
) {
  return staffService.getLocationHistory(
    staffId,
    new Date(from),
    new Date(to)
  );
}

export async function getActiveStaffLocations() {
  const session = await getSession();
  if (!session?.societyId) throw new Error("Unauthorized");
  return staffService.getLatestLocationsForSociety(session.societyId);
}

export async function getAttendanceReportData(from: string, to: string) {
  const session = await getSession();
  if (!session?.societyId) throw new Error("Unauthorized");
  return staffService.getAttendanceReportRange(session.societyId, from, to);
}

export async function getPatrolCompletionReportData(from: string, to: string) {
  const session = await getSession();
  if (!session?.societyId) throw new Error("Unauthorized");
  return staffService.getPatrolCompletionReport(session.societyId, from, to);
}

export async function getAreaPresenceReportData(from: string, to: string) {
  const session = await getSession();
  if (!session?.societyId) throw new Error("Unauthorized");
  return staffService.getAreaPresenceReport(session.societyId, from, to);
}

export async function getStaffActivities(staffId: string) {
  const [shiftHistory, tasks, cleaningLogs, patrols, latestLocation, summary] =
    await Promise.all([
      staffService.getRecentShiftsForStaff(staffId, 10),
      staffService.getRecentTasksForStaff(staffId, 20),
      staffService.getCleaningLogsForStaffDetail(staffId, 20),
      staffService.getRecentPatrolsForStaff(staffId, 10),
      staffService.getLatestLocation(staffId),
      staffService.getStaffActivitySummary(staffId),
    ]);

  return {
    shiftHistory,
    tasks,
    cleaningLogs,
    patrols,
    latestLocation,
    summary,
  };
}

export async function getLocationReportData(
  staffId: string,
  from: string,
  to: string
) {
  return staffService.getLocationReportForStaff(staffId, from, to);
}

export async function getActiveStaffList() {
  const session = await getSession();
  if (!session?.societyId) throw new Error("Unauthorized");
  return staffService.getStaffBySociety(session.societyId, { isActive: true });
}
