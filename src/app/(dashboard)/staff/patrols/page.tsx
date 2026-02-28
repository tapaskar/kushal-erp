import { PatrolsClient } from "./patrols-client";
import {
  getPatrolRoutesList,
  getPatrolLogsList,
} from "@/services/staff-admin.service";

export default async function PatrolsPage() {
  const [rawRoutes, rawLogs] = await Promise.all([
    getPatrolRoutesList(),
    getPatrolLogsList(),
  ]);

  const routes = rawRoutes.map((r) => ({
    id: r.id,
    name: r.name,
    description: r.description,
    estimatedDurationMin: r.estimatedDurationMin,
    checkpointCount: Array.isArray(r.checkpoints) ? r.checkpoints.length : 0,
    createdAt: r.createdAt,
  }));

  const logs = rawLogs.map((r) => ({
    id: r.log.id,
    routeName: r.routeName,
    staffName: r.staffName,
    status: r.log.status,
    startedAt: r.log.startedAt?.toISOString() ?? null,
    completedAt: r.log.completedAt?.toISOString() ?? null,
    completionPercentage:
      r.log.totalCheckpoints > 0
        ? Math.round((r.log.visitedCheckpoints / r.log.totalCheckpoints) * 100)
        : 0,
    createdAt: r.log.createdAt,
  }));

  return <PatrolsClient routes={routes} logs={logs} />;
}
