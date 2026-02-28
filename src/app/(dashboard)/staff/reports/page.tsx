import { ReportsClient } from "./reports-client";
import { getStaffDashboardStats, getAttendance } from "@/services/staff-admin.service";
import { getSecurityDashboardStats } from "@/services/security-admin.service";
import { getCleaningDashboardStats } from "@/services/housekeeping-admin.service";

function todayIST() {
  return new Date().toISOString().split("T")[0];
}

export default async function ReportsPage() {
  const [staffStats, securityStats, cleaningStats, attendance] = await Promise.all([
    getStaffDashboardStats(),
    getSecurityDashboardStats(),
    getCleaningDashboardStats(),
    getAttendance(todayIST()),
  ]);

  const attendanceRows = attendance.map((r) => ({
    staffName: r.staffName,
    staffRole: r.staffRole,
    employeeCode: r.staffEmployeeCode,
    status: r.shift.status,
    scheduledStart: r.shift.scheduledStart.toISOString(),
    scheduledEnd: r.shift.scheduledEnd.toISOString(),
    actualCheckIn: r.shift.actualCheckIn?.toISOString() ?? null,
    actualCheckOut: r.shift.actualCheckOut?.toISOString() ?? null,
  }));

  return (
    <ReportsClient
      staffStats={staffStats}
      securityStats={securityStats}
      cleaningStats={cleaningStats}
      attendance={attendanceRows}
    />
  );
}
