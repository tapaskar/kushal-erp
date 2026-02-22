import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getIncomeExpenseReport } from "@/services/report.service";
import { formatINR } from "@/lib/utils/currency";
import { getFinancialYear } from "@/lib/utils/dates";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";

export default async function IncomeExpenseReportPage() {
  const session = await getSession();
  if (!session?.societyId) redirect("/society/setup");

  const fy = getFinancialYear(new Date());
  const [startYear] = fy.split("-");
  const fromDate = `${startYear}-04-01`;
  const toDate = `${Number(startYear) + 1}-03-31`;

  const data = await getIncomeExpenseReport(
    session.societyId,
    fromDate,
    toDate
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Income & Expense Statement</h1>
        <p className="text-muted-foreground">FY {fy}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Income */}
        <Card>
          <CardHeader>
            <CardTitle className="text-green-700">Income</CardTitle>
          </CardHeader>
          <CardContent>
            {data.income.length === 0 ? (
              <p className="text-sm text-muted-foreground">No income recorded.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Account</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.income.map((item) => (
                    <TableRow key={item.code}>
                      <TableCell>
                        <span className="text-xs text-muted-foreground mr-2">
                          {item.code}
                        </span>
                        {item.name}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatINR(item.amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="font-bold">
                    <TableCell>Total Income</TableCell>
                    <TableCell className="text-right text-green-700">
                      {formatINR(data.totalIncome)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Expenses */}
        <Card>
          <CardHeader>
            <CardTitle className="text-red-700">Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            {data.expenses.length === 0 ? (
              <p className="text-sm text-muted-foreground">No expenses recorded.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Account</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.expenses.map((item) => (
                    <TableRow key={item.code}>
                      <TableCell>
                        <span className="text-xs text-muted-foreground mr-2">
                          {item.code}
                        </span>
                        {item.name}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatINR(item.amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="font-bold">
                    <TableCell>Total Expenses</TableCell>
                    <TableCell className="text-right text-red-700">
                      {formatINR(data.totalExpense)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Surplus/Deficit */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between text-lg font-bold">
            <span>{data.surplus >= 0 ? "Surplus" : "Deficit"}</span>
            <span
              className={data.surplus >= 0 ? "text-green-700" : "text-red-700"}
            >
              {formatINR(Math.abs(data.surplus))}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
