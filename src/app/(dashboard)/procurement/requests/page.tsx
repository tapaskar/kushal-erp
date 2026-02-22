import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getPurchaseRequests } from "@/services/procurement.service";
import { RequestsClient } from "./requests-client";

export default async function RequestsPage() {
  const session = await getSession();
  if (!session?.societyId) redirect("/society/setup");

  const requests = await getPurchaseRequests(session.societyId);

  return <RequestsClient requests={requests} societyId={session.societyId} />;
}
