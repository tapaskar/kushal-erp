import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getMembers, getMemberStats } from "@/services/member.service";
import { MembersClient } from "./members-client";

export default async function MembersPage() {
  const session = await getSession();
  if (!session?.societyId) redirect("/society/setup");

  const [memberList, stats] = await Promise.all([
    getMembers(session.societyId),
    getMemberStats(session.societyId),
  ]);

  return <MembersClient members={memberList} stats={stats} />;
}
