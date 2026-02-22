import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getInvoices } from "@/services/billing.service";
import { InvoiceListClient } from "./invoice-list-client";

export default async function InvoicesPage() {
  const session = await getSession();
  if (!session?.societyId) redirect("/society/setup");

  const invoiceList = await getInvoices(session.societyId);

  return <InvoiceListClient invoices={invoiceList} />;
}
