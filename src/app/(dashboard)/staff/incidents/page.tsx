import { IncidentsClient } from "./incidents-client";
import { getIncidentsList } from "@/services/security-admin.service";

export default async function IncidentsPage() {
  const rawIncidents = await getIncidentsList();

  const incidents = rawIncidents.map((r) => ({
    id: r.incident.id,
    title: r.incident.title,
    description: r.incident.description,
    severity: r.incident.severity,
    status: r.incident.status,
    location: r.incident.location,
    reporterName: r.reporterName,
    resolvedAt: r.incident.resolvedAt?.toISOString() ?? null,
    resolution: r.incident.resolution,
    createdAt: r.incident.createdAt,
  }));

  return <IncidentsClient incidents={incidents} />;
}
