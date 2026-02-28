import { StaffClient } from "./staff-client";
import {
  getStaffList,
  getStaffDashboardStats,
} from "@/services/staff-admin.service";
import { getCleaningDashboardStats } from "@/services/housekeeping-admin.service";

export default async function StaffPage() {
  const [staffList, rawStats, cleaningStats] = await Promise.all([
    getStaffList(),
    getStaffDashboardStats(),
    getCleaningDashboardStats(),
  ]);

  const stats = {
    totalStaff: rawStats.totalStaff,
    checkedInToday: rawStats.shiftsToday.checkedIn,
    pendingTasks: rawStats.tasks.pending,
    cleaningToday: cleaningStats.today,
  };

  return <StaffClient staffList={staffList} stats={stats} />;
}
