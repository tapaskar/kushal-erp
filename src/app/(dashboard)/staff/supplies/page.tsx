import { SuppliesClient } from "./supplies-client";
import { getSupplyRequestsList } from "@/services/housekeeping-admin.service";

export default async function SuppliesPage() {
  const rawRequests = await getSupplyRequestsList();

  const requests = rawRequests.map((r) => ({
    id: r.request.id,
    itemName: r.request.itemName,
    quantity: r.request.quantity,
    urgency: r.request.urgency,
    reason: r.request.reason,
    status: r.request.status,
    staffName: r.staffName,
    createdAt: r.request.createdAt,
  }));

  return <SuppliesClient requests={requests} />;
}
