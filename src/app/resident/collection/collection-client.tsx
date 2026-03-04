"use client";

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
import { formatINR } from "@/lib/utils/currency";

const METHOD_LABELS: Record<string, string> = {
  cash: "Cash",
  cheque: "Cheque",
  neft: "NEFT",
  rtgs: "RTGS",
  upi: "UPI",
  razorpay: "Razorpay",
  demand_draft: "Demand Draft",
};

interface OutstandingRow {
  unitId: string;
  unitNumber: string;
  blockName: string;
  memberName: string;
  totalBilled: number;
  totalPaid: number;
  totalOutstanding: number;
  invoiceCount: number;
}

interface Props {
  collection: {
    byMethod: Array<{
      method: string;
      count: number;
      total: number;
    }>;
    grandTotal: number;
  };
  outstanding: OutstandingRow[];
  financialYear: string;
}

export function CollectionClient({
  collection,
  outstanding,
  financialYear,
}: Props) {
  // Group outstanding by block
  const blockSummary = outstanding.reduce<
    Record<string, { billed: number; paid: number; outstanding: number; units: number }>
  >((acc, row) => {
    if (!acc[row.blockName]) {
      acc[row.blockName] = { billed: 0, paid: 0, outstanding: 0, units: 0 };
    }
    acc[row.blockName].billed += row.totalBilled;
    acc[row.blockName].paid += row.totalPaid;
    acc[row.blockName].outstanding += row.totalOutstanding;
    acc[row.blockName].units += 1;
    return acc;
  }, {});

  const totals = outstanding.reduce(
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
        <h1 className="text-2xl font-bold">Collection Summary</h1>
        <p className="text-muted-foreground">FY {financialYear}</p>
      </div>

      {/* Overall Stats */}
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

      {/* Collection by Method */}
      <Card>
        <CardHeader>
          <CardTitle>
            Collection by Payment Method — Total:{" "}
            {formatINR(collection.grandTotal)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {collection.byMethod.length === 0 ? (
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
                {collection.byMethod.map((row) => (
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

      {/* Block-wise Outstanding */}
      <Card>
        <CardHeader>
          <CardTitle>Block-wise Outstanding</CardTitle>
        </CardHeader>
        <CardContent>
          {Object.keys(blockSummary).length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No billing data available.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Block</TableHead>
                  <TableHead className="text-right">Units</TableHead>
                  <TableHead className="text-right">Billed</TableHead>
                  <TableHead className="text-right">Paid</TableHead>
                  <TableHead className="text-right">Outstanding</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(blockSummary).map(([block, data]) => (
                  <TableRow key={block}>
                    <TableCell className="font-medium">{block}</TableCell>
                    <TableCell className="text-right">{data.units}</TableCell>
                    <TableCell className="text-right">
                      {formatINR(data.billed)}
                    </TableCell>
                    <TableCell className="text-right text-green-600">
                      {formatINR(data.paid)}
                    </TableCell>
                    <TableCell
                      className={`text-right font-medium ${
                        data.outstanding > 0 ? "text-destructive" : ""
                      }`}
                    >
                      {formatINR(data.outstanding)}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="font-bold">
                  <TableCell>Total</TableCell>
                  <TableCell className="text-right">
                    {outstanding.length}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatINR(totals.billed)}
                  </TableCell>
                  <TableCell className="text-right text-green-600">
                    {formatINR(totals.paid)}
                  </TableCell>
                  <TableCell className="text-right text-destructive font-bold">
                    {formatINR(totals.outstanding)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
