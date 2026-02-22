"use client";

import {
  Card,
  CardContent,
  CardDescription,
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
import { Badge } from "@/components/ui/badge";
import { formatINR } from "@/lib/utils/currency";
import { formatDate } from "@/lib/utils/dates";

interface DefaulterRow {
  unitNumber: string;
  blockName: string;
  memberName: string;
  memberPhone: string;
  totalOutstanding: number;
  oldestDueDate: string;
  invoiceCount: number;
}

interface AgingBucket {
  label: string;
  count: number;
  amount: number;
}

const AGING_COLORS = [
  "bg-green-100 text-green-800",
  "bg-yellow-100 text-yellow-800",
  "bg-orange-100 text-orange-800",
  "bg-red-100 text-red-800",
  "bg-red-200 text-red-900",
];

export function DefaultersClient({
  defaulters,
  aging,
}: {
  defaulters: DefaulterRow[];
  aging: AgingBucket[];
}) {
  const totalOutstanding = defaulters.reduce(
    (s, d) => s + d.totalOutstanding,
    0
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Defaulters</h1>
        <p className="text-muted-foreground">
          {defaulters.length} units with outstanding dues totalling{" "}
          {formatINR(totalOutstanding)}
        </p>
      </div>

      {/* Aging buckets */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-5">
        {aging.map((bucket, i) => (
          <Card key={bucket.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                {bucket.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">{formatINR(bucket.amount)}</div>
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium mt-1 ${AGING_COLORS[i]}`}
              >
                {bucket.count} invoices
              </span>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Defaulters table */}
      {defaulters.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardHeader className="text-center">
            <CardTitle>No defaulters</CardTitle>
            <CardDescription>
              All invoices are fully paid. Great job!
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Unit</TableHead>
                <TableHead>Block</TableHead>
                <TableHead>Member</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Invoices</TableHead>
                <TableHead>Oldest Due</TableHead>
                <TableHead className="text-right">Outstanding</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {defaulters.map((d, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium">{d.unitNumber}</TableCell>
                  <TableCell>{d.blockName}</TableCell>
                  <TableCell>{d.memberName}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {d.memberPhone}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{d.invoiceCount}</Badge>
                  </TableCell>
                  <TableCell>{formatDate(d.oldestDueDate)}</TableCell>
                  <TableCell className="text-right font-medium text-destructive">
                    {formatINR(d.totalOutstanding)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
