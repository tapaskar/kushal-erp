import { SosClient } from "./sos-client";
import { getSosAlertsList } from "@/services/security-admin.service";

export default async function SosPage() {
  const rawAlerts = await getSosAlertsList();

  const alerts = rawAlerts.map((r) => ({
    id: r.alert.id,
    staffName: r.staffName,
    staffRole: r.staffRole,
    staffPhone: r.staffPhone,
    latitude: r.alert.latitude,
    longitude: r.alert.longitude,
    message: r.alert.message,
    isResolved: r.alert.isResolved,
    createdAt: r.alert.createdAt,
  }));

  return <SosClient alerts={alerts} />;
}
