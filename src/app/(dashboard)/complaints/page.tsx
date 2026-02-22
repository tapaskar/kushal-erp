import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getComplaints, getComplaintStats } from "@/services/complaint.service";
import { ComplaintsClient } from "./complaints-client";

export default async function ComplaintsPage() {
  const session = await getSession();
  if (!session?.societyId) redirect("/society/setup");

  const [complaintList, stats] = await Promise.all([
    getComplaints(session.societyId),
    getComplaintStats(session.societyId),
  ]);

  return (
    <ComplaintsClient
      societyId={session.societyId}
      complaints={complaintList}
      stats={stats}
    />
  );
}
