import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getVendors, getVendorStats } from "@/services/vendor.service";
import { VendorsClient } from "./vendors-client";

export default async function VendorsPage() {
  const session = await getSession();
  if (!session?.societyId) redirect("/society/setup");

  const [vendorList, stats] = await Promise.all([
    getVendors(session.societyId),
    getVendorStats(session.societyId),
  ]);

  return (
    <VendorsClient
      societyId={session.societyId}
      vendors={vendorList}
      stats={stats}
    />
  );
}
