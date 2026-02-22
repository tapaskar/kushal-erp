import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getUnpaidInvoices } from "@/services/payment.service";
import { ManualPaymentClient } from "./manual-payment-client";

export default async function ManualPaymentPage() {
  const session = await getSession();
  if (!session?.societyId) redirect("/society/setup");

  const unpaidInvoices = await getUnpaidInvoices(session.societyId);

  return (
    <ManualPaymentClient
      societyId={session.societyId}
      invoices={unpaidInvoices}
    />
  );
}
