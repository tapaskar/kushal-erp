import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getProcurementStats, getPurchaseRequests, getPurchaseOrders } from "@/services/procurement.service";
import { ProcurementClient } from "./procurement-client";

export default async function ProcurementPage() {
  const session = await getSession();
  if (!session?.societyId) redirect("/society/setup");

  const [stats, recentPRs, recentPOs] = await Promise.all([
    getProcurementStats(session.societyId),
    getPurchaseRequests(session.societyId),
    getPurchaseOrders(session.societyId),
  ]);

  return (
    <ProcurementClient
      stats={stats}
      recentPRs={recentPRs.slice(0, 5)}
      recentPOs={recentPOs.slice(0, 5)}
      userRole={session.role ?? ""}
    />
  );
}
