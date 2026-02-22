import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getStockMovements } from "@/services/inventory.service";
import { MovementsClient } from "./movements-client";

export default async function MovementsPage() {
  const session = await getSession();
  if (!session?.societyId) redirect("/society/setup");

  const movements = await getStockMovements(session.societyId);

  return (
    <MovementsClient societyId={session.societyId} movements={movements} />
  );
}
