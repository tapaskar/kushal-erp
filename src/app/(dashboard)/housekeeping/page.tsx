import { HousekeepingClient } from "./housekeeping-client";
import { getSession } from "@/lib/auth/session";
import * as hkService from "@/services/housekeeping.service";

function todayIST() {
  return new Date().toISOString().split("T")[0];
}

export default async function HousekeepingPage() {
  const session = await getSession();
  if (!session?.societyId) return <div>Please log in</div>;

  const rawSchedule = await hkService.getCleaningSchedule(
    session.societyId,
    todayIST()
  );

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
    ratingComment: r.log.ratingComment,
  }));

  return <HousekeepingClient schedule={schedule} />;
}
