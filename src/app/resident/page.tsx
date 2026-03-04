import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getBillingStats } from "@/services/billing.service";
import { getPaymentStats } from "@/services/payment.service";
import { getComplaintStats } from "@/services/complaint.service";
import { getNotices } from "@/services/notice.service";
import { getSocietyOverview } from "@/services/resident.service";
import { ResidentDashboardClient } from "./dashboard-client";

export default async function ResidentDashboardPage() {
  const session = await getSession();
  if (!session?.societyId) redirect("/login");

  const [billingStats, paymentStats, complaintStats, notices, overview] =
    await Promise.all([
      getBillingStats(session.societyId),
      getPaymentStats(session.societyId),
      getComplaintStats(session.societyId),
      getNotices(session.societyId),
      getSocietyOverview(session.societyId),
    ]);

  return (
    <ResidentDashboardClient
      billingStats={billingStats}
      paymentStats={paymentStats}
      complaintStats={complaintStats}
      notices={notices.slice(0, 5)}
      overview={overview}
    />
  );
}
