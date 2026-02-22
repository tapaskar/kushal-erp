import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getBlocks, getUnits } from "@/services/society.service";
import { UnitsClient } from "./units-client";

export default async function UnitsPage() {
  const session = await getSession();
  if (!session?.societyId) redirect("/society/setup");

  const [blockList, unitList] = await Promise.all([
    getBlocks(session.societyId),
    getUnits(session.societyId),
  ]);

  return (
    <UnitsClient
      societyId={session.societyId}
      blocks={blockList}
      initialUnits={unitList}
    />
  );
}
