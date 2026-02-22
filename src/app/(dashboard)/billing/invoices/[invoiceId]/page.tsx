import { redirect, notFound } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getInvoiceDetail } from "@/services/billing.service";
import { InvoiceDetailClient } from "./invoice-detail-client";

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ invoiceId: string }>;
}) {
  const session = await getSession();
  if (!session?.societyId) redirect("/society/setup");

  const { invoiceId } = await params;
  const data = await getInvoiceDetail(invoiceId);
  if (!data) notFound();

  return <InvoiceDetailClient data={data} />;
}
