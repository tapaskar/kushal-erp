import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getCollectionSummary } from "@/services/report.service";
import { formatINR } from "@/lib/utils/currency";
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
import { getFinancialYear } from "@/lib/utils/dates";

const METHOD_LABELS: Record<string, string> = {
  cash: "Cash",
  cheque: "Cheque",
  neft: "NEFT",
  rtgs: "RTGS",
  upi: "UPI",
  razorpay: "Razorpay",
  demand_draft: "Demand Draft",
};

export default async function CollectionReportPage() {
  const session = await getSession();
  if (!session?.societyId) redirect("/society/setup");

  // Current financial year: Apr 1 to Mar 31
  const fy = getFinancialYear(new Date());
  const [startYear] = fy.split("-");
  const fromDate = `${startYear}-04-01`;
  const toDate = `${Number(startYear) + 1}-03-31`;

  const data = await getCollectionSummary(session.societyId, fromDate, toDate);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Collection Summary</h1>
        <p className="text-muted-foreground">FY {fy}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Total Collected: {formatINR(data.grandTotal)}</CardTitle>
        </CardHeader>
        <CardContent>
          {data.byMethod.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No payments recorded in this period.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Payment Method</TableHead>
                  <TableHead className="text-right">Count</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.byMethod.map((row) => (
                  <TableRow key={row.method}>
                    <TableCell className="font-medium">
                      {METHOD_LABELS[row.method] || row.method}
                    </TableCell>
                    <TableCell className="text-right">{row.count}</TableCell>
                    <TableCell className="text-right">
                      {formatINR(row.total)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
