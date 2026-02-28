import { VisitorsClient } from "./visitors-client";
import { getVisitorLogsList } from "@/services/security-admin.service";

export default async function VisitorsPage() {
  const rawVisitors = await getVisitorLogsList();

  const visitors = rawVisitors.map((r) => ({
    id: r.visitor.id,
    visitorName: r.visitor.visitorName,
    visitorPhone: r.visitor.visitorPhone,
    visitorType: r.visitor.visitorType,
    purpose: r.visitor.purpose,
    vehicleNumber: r.visitor.vehicleNumber,
    status: r.visitor.status,
    checkInAt: r.visitor.checkInAt?.toISOString() ?? null,
    checkOutAt: r.visitor.checkOutAt?.toISOString() ?? null,
    checkInGate: r.visitor.checkInGate,
    checkOutGate: r.visitor.checkOutGate,
    staffName: r.staffName,
    createdAt: r.visitor.createdAt,
  }));

  return <VisitorsClient visitors={visitors} />;
}
