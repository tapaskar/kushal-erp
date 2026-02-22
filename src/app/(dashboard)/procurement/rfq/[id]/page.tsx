import { notFound } from "next/navigation";
import { getRfq, rankQuotations } from "@/services/procurement.service";
import { RfqClient } from "./rfq-client";

export default async function RfqPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const rfq = await getRfq(id);
  if (!rfq) notFound();

  // Auto-rank submitted quotations
  const unranked = rfq.quotations.filter(
    (q) => q.quotation.status === "submitted" && !q.quotation.rank
  );
  if (unranked.length > 0) {
    await rankQuotations(id);
    const updated = await getRfq(id);
    if (updated) return <RfqClient data={updated} />;
  }

  return <RfqClient data={rfq} />;
}
