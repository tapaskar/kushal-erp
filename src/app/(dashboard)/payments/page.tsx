import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getPayments, getPaymentStats } from "@/services/payment.service";
import { PaymentsClient } from "./payments-client";

export default async function PaymentsPage() {
  const session = await getSession();
  if (!session?.societyId) redirect("/society/setup");

  const [paymentList, stats] = await Promise.all([
    getPayments(session.societyId),
    getPaymentStats(session.societyId),
  ]);

  return <PaymentsClient payments={paymentList} stats={stats} />;
}
