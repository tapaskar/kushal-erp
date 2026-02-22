import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getUnits } from "@/services/society.service";
import { AddMemberClient } from "./add-member-client";

export default async function AddMemberPage() {
  const session = await getSession();
  if (!session?.societyId) redirect("/society/setup");

  const unitList = await getUnits(session.societyId);

  return (
    <AddMemberClient
      societyId={session.societyId}
      units={unitList}
    />
  );
}
