import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { AddInventoryItemClient } from "./add-inventory-item-client";

export default async function AddInventoryItemPage() {
  const session = await getSession();
  if (!session?.societyId) redirect("/society/setup");

  return <AddInventoryItemClient societyId={session.societyId} />;
}
