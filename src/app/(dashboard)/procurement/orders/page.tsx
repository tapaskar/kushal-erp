import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getPurchaseOrders } from "@/services/procurement.service";
import { OrdersClient } from "./orders-client";

export default async function OrdersPage() {
  const session = await getSession();
  if (!session?.societyId) redirect("/society/setup");

  const orders = await getPurchaseOrders(session.societyId);

  return <OrdersClient orders={orders} userRole={session.role ?? ""} userId={session.userId ?? ""} />;
}
