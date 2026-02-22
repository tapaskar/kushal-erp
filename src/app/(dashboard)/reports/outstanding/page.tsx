import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getOutstandingReport } from "@/services/report.service";
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

export default async function OutstandingReportPage() {
  const session = await getSession();
  if (!session?.societyId) redirect("/society/setup");

  const data = await getOutstandingReport(session.societyId);

  const totals = data.reduce(
    (acc, r) => ({
      billed: acc.billed + r.totalBilled,
      paid: acc.paid + r.totalPaid,
      outstanding: acc.outstanding + r.totalOutstanding,
    }),
    { billed: 0, paid: 0, outstanding: 0 }
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Outstanding Report</h1>
        <p className="text-muted-foreground">Unit-wise financial summary</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Billed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatINR(totals.billed)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatINR(totals.paid)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {formatINR(totals.outstanding)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        {data.length === 0 ? (
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground text-center">
              No invoices found.
            </p>
          </CardContent>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Unit</TableHead>
                <TableHead>Block</TableHead>
                <TableHead>Member</TableHead>
                <TableHead className="text-right">Billed</TableHead>
                <TableHead className="text-right">Paid</TableHead>
                <TableHead className="text-right">Outstanding</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row) => (
                <TableRow key={row.unitId}>
                  <TableCell className="font-medium">
                    {row.unitNumber}
                  </TableCell>
                  <TableCell>{row.blockName}</TableCell>
                  <TableCell>{row.memberName}</TableCell>
                  <TableCell className="text-right">
                    {formatINR(row.totalBilled)}
                  </TableCell>
                  <TableCell className="text-right text-green-600">
                    {formatINR(row.totalPaid)}
                  </TableCell>
                  <TableCell
                    className={`text-right font-medium ${
                      row.totalOutstanding > 0 ? "text-destructive" : ""
                    }`}
                  >
                    {formatINR(row.totalOutstanding)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
