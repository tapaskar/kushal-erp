import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import {
  getCollectionSummary,
  getOutstandingReport,
} from "@/services/report.service";
import { getFinancialYear } from "@/lib/utils/dates";
import { CollectionClient } from "./collection-client";

export default async function ResidentCollectionPage() {
  const session = await getSession();
  if (!session?.societyId) redirect("/login");

  const fy = getFinancialYear(new Date());
  const [startYear] = fy.split("-");
  const fromDate = `${startYear}-04-01`;
  const toDate = `${Number(startYear) + 1}-03-31`;

  const [collection, outstanding] = await Promise.all([
    getCollectionSummary(session.societyId, fromDate, toDate),
    getOutstandingReport(session.societyId),
  ]);

  return (
    <CollectionClient
      collection={collection}
      outstanding={outstanding}
      financialYear={fy}
    />
  );
}
