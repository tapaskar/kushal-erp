import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getComplaintStats } from "@/services/complaint.service";
import { getComplaintCategorySummary } from "@/services/resident.service";
import { ComplaintsClient } from "./complaints-client";

export default async function ResidentComplaintsPage() {
  const session = await getSession();
  if (!session?.societyId) redirect("/login");

  const [stats, categorySummary] = await Promise.all([
    getComplaintStats(session.societyId),
    getComplaintCategorySummary(session.societyId),
  ]);

  return <ComplaintsClient stats={stats} categorySummary={categorySummary} />;
}
