import { getAdminStats, getAllSocieties } from "@/services/admin.service";
import { getInfraStatus } from "@/services/aws-infra.service";
import { AdminDashboardClient } from "./admin-dashboard-client";

export default async function AdminDashboardPage() {
  const [stats, societies, infraStatus] = await Promise.all([
    getAdminStats(),
    getAllSocieties(),
    getInfraStatus(),
  ]);

  return (
    <AdminDashboardClient
      stats={stats}
      recentSocieties={societies.slice(0, 5)}
      infraStatus={infraStatus}
    />
  );
}
