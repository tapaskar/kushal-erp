import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import {
  getIncomeExpenseReport,
  getFundPosition,
} from "@/services/report.service";
import { getFinancialYear } from "@/lib/utils/dates";
import { FinancialsClient } from "./financials-client";

export default async function ResidentFinancialsPage() {
  const session = await getSession();
  if (!session?.societyId) redirect("/login");

  const fy = getFinancialYear(new Date());
  const [startYear] = fy.split("-");
  const fromDate = `${startYear}-04-01`;
  const toDate = `${Number(startYear) + 1}-03-31`;

  const [incomeExpense, fundPosition] = await Promise.all([
    getIncomeExpenseReport(session.societyId, fromDate, toDate),
    getFundPosition(session.societyId),
  ]);

  return (
    <FinancialsClient
      incomeExpense={incomeExpense}
      fundPosition={fundPosition}
      financialYear={fy}
    />
  );
}
