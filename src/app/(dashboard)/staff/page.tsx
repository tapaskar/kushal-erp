import { StaffClient } from "./staff-client";
import {
  getStaffList,
  getStaffDashboardStats,
} from "@/services/staff-admin.service";

export default async function StaffPage() {
  const [staffList, rawStats] = await Promise.all([
    getStaffList(),
    getStaffDashboardStats(),
  ]);

  const stats = {
    totalStaff: rawStats.totalStaff,
    checkedInToday: rawStats.shiftsToday.checkedIn,
    pendingTasks: rawStats.tasks.pending,
  };

  return <StaffClient staffList={staffList} stats={stats} />;
}
