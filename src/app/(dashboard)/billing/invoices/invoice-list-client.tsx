"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
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
import { getMonthName } from "@/lib/utils/invoice-number";

interface InvoiceRow {
  invoice: {
    id: string;
    invoiceNumber: string;
    billingMonth: number;
    billingYear: number;
    totalAmount: string;
    paidAmount: string;
    balanceDue: string;
    status: string;
    dueDate: string;
  };
  unit: { unitNumber: string };
  block: { name: string };
  member: { name: string };
}

const STATUS_BADGE: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  draft: "secondary",
  sent: "outline",
  partially_paid: "secondary",
  paid: "default",
  overdue: "destructive",
  cancelled: "secondary",
};

export function InvoiceListClient({ invoices }: { invoices: InvoiceRow[] }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Invoices</h1>
          <p className="text-muted-foreground">
            {invoices.length} invoices total
          </p>
        </div>
        <Link href="/billing/generate">
          <Button>Generate New</Button>
        </Link>
      </div>

      {invoices.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardHeader className="text-center">
            <CardTitle>No invoices yet</CardTitle>
            <CardDescription>
              Configure fee structure and generate monthly invoices
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Member</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((row) => (
                <TableRow key={row.invoice.id}>
                  <TableCell>
                    <Link
                      href={`/billing/invoices/${row.invoice.id}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {row.invoice.invoiceNumber}
                    </Link>
                  </TableCell>
                  <TableCell>
                    {row.unit.unitNumber} ({row.block.name})
                  </TableCell>
                  <TableCell>{row.member.name}</TableCell>
                  <TableCell>
                    {getMonthName(row.invoice.billingMonth)}{" "}
                    {row.invoice.billingYear}
                  </TableCell>
                  <TableCell>{formatINR(row.invoice.totalAmount)}</TableCell>
                  <TableCell
                    className={
                      parseFloat(row.invoice.balanceDue) > 0
                        ? "text-destructive font-medium"
                        : "text-green-600"
                    }
                  >
                    {formatINR(row.invoice.balanceDue)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={STATUS_BADGE[row.invoice.status] || "outline"}>
                      {row.invoice.status.replace("_", " ")}
                    </Badge>
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
