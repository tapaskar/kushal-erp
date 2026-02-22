import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import {
  getInventoryItems,
  getInventoryStats,
  getLowStockItems,
  getUpcomingMaintenance,
} from "@/services/inventory.service";
import { InventoryClient } from "./inventory-client";

export default async function InventoryPage() {
  const session = await getSession();
  if (!session?.societyId) redirect("/society/setup");

  const [items, stats, lowStock, upcomingMaintenance] = await Promise.all([
    getInventoryItems(session.societyId),
    getInventoryStats(session.societyId),
    getLowStockItems(session.societyId),
    getUpcomingMaintenance(session.societyId),
  ]);

  return (
    <InventoryClient
      societyId={session.societyId}
      items={items}
      stats={stats}
      lowStockItems={lowStock}
      upcomingMaintenance={upcomingMaintenance}
    />
  );
}
