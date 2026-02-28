import { ShiftsClient } from "./shifts-client";
import { getShiftsByDate, getStaffList } from "@/services/staff-admin.service";
import { todayIST } from "@/lib/utils/dates";

export default async function ShiftsPage() {
  const today = todayIST();
  const [rawShifts, staffList] = await Promise.all([
    getShiftsByDate(today),
    getStaffList(),
  ]);

  const shifts = rawShifts.map((r) => ({
    id: r.shift.id,
    staffId: r.shift.staffId,
    staffName: r.staffName,
    date: r.shift.date,
    scheduledStart: r.shift.scheduledStart.toISOString(),
    scheduledEnd: r.shift.scheduledEnd.toISOString(),
    actualStart: r.shift.actualCheckIn?.toISOString() ?? null,
    actualEnd: r.shift.actualCheckOut?.toISOString() ?? null,
    status: r.shift.status,
  }));

  return <ShiftsClient shifts={shifts} staffList={staffList} today={today} />;
}
