import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getChargeHeads, getIncomeAccounts } from "@/services/billing.service";
import { FeeStructureClient } from "./fee-structure-client";

export default async function FeeStructurePage() {
  const session = await getSession();
  if (!session?.societyId) redirect("/society/setup");

  const [chargeHeadList, incomeAccountList] = await Promise.all([
    getChargeHeads(session.societyId),
    getIncomeAccounts(session.societyId),
  ]);

  return (
    <FeeStructureClient
      societyId={session.societyId}
      chargeHeads={chargeHeadList}
      incomeAccounts={incomeAccountList}
    />
  );
}
