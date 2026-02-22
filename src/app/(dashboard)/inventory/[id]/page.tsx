import { redirect, notFound } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import {
  getInventoryItem,
  getStockMovements,
  getMaintenanceSchedules,
} from "@/services/inventory.service";
import { InventoryDetailClient } from "./inventory-detail-client";

export default async function InventoryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session?.societyId) redirect("/society/setup");

  const { id } = await params;
  const [itemResult, movements, schedules] = await Promise.all([
    getInventoryItem(id),
    getStockMovements(session.societyId, { inventoryItemId: id }),
    getMaintenanceSchedules(session.societyId, { inventoryItemId: id }),
  ]);

  if (!itemResult) notFound();

  return (
    <InventoryDetailClient
      societyId={session.societyId}
      data={itemResult}
      movements={movements}
      maintenanceSchedules={schedules}
    />
  );
}
