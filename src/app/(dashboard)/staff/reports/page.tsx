import { ReportsClient } from "./reports-client";
import {
  getStaffDashboardStats,
  getAttendance,
  getStaffList,
} from "@/services/staff-admin.service";
import { getSecurityDashboardStats } from "@/services/security-admin.service";
import { getCleaningDashboardStats } from "@/services/housekeeping-admin.service";

function todayIST() {
  return new Date().toISOString().split("T")[0];
}

export default async function ReportsPage() {
  const [staffStats, securityStats, cleaningStats, attendance, staffMembers] =
    await Promise.all([
      getStaffDashboardStats(),
      getSecurityDashboardStats(),
      getCleaningDashboardStats(),
      getAttendance(todayIST()),
      getStaffList({ isActive: true }),
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

  const staffList = staffMembers.map((s) => ({
    id: s.id,
    name: s.name,
    role: s.role,
  }));

  return (
    <ReportsClient
      staffStats={staffStats}
      securityStats={securityStats}
      cleaningStats={cleaningStats}
      attendance={attendanceRows}
      staffList={staffList}
    />
  );
}
