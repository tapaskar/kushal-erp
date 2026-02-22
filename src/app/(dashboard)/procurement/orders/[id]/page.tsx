import { redirect, notFound } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getPurchaseOrder } from "@/services/procurement.service";
import { PODetailClient } from "./po-detail-client";

export default async function PODetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();
  if (!session?.societyId) redirect("/society/setup");

  const po = await getPurchaseOrder(id);
  if (!po) notFound();

  return <PODetailClient po={po} userRole={session.role ?? ""} />;
}
