import { getAdminStats, getAllSocieties } from "@/services/admin.service";
import { AdminDashboardClient } from "./admin-dashboard-client";

export default async function AdminDashboardPage() {
  const [stats, societies] = await Promise.all([
    getAdminStats(),
    getAllSocieties(),
  ]);

  return (
    <AdminDashboardClient
      stats={stats}
      recentSocieties={societies.slice(0, 5)}
    />
  );
}
