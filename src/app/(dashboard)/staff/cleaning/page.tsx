import { CleaningClient } from "./cleaning-client";
import {
  getZonesList,
  getCleaningScheduleByDate,
  getCleaningDashboardStats,
} from "@/services/housekeeping-admin.service";

function todayIST() {
  return new Date().toISOString().split("T")[0];
}

export default async function CleaningPage() {
  const [zones, rawSchedule, stats] = await Promise.all([
    getZonesList(),
    getCleaningScheduleByDate(todayIST()),
    getCleaningDashboardStats(),
  ]);

  const schedule = rawSchedule.map((r) => ({
    id: r.log.id,
    zoneName: r.zoneName,
    zoneType: r.zoneType,
    zoneFloor: r.zoneFloor,
    staffName: r.staffName,
    status: r.log.status,
    scheduledDate: r.log.scheduledDate,
    startedAt: r.log.startedAt?.toISOString() ?? null,
    completedAt: r.log.completedAt?.toISOString() ?? null,
    rating: r.log.rating,
  }));

  return <CleaningClient zones={zones} schedule={schedule} stats={stats} />;
}
