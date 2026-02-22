"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
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
import { Plus, IndianRupee, Banknote, Smartphone } from "lucide-react";
import { formatINR } from "@/lib/utils/currency";
import { formatDate } from "@/lib/utils/dates";

interface PaymentRow {
  payment: {
    id: string;
    receiptNumber: string;
    amount: string;
    paymentDate: string;
    paymentMethod: string;
    status: string;
  };
  invoice: { invoiceNumber: string };
  unit: { unitNumber: string };
  block: { name: string };
  member: { name: string };
}

interface Stats {
  totalPayments: number;
  totalCollected: number;
  cashCount: number;
  onlineCount: number;
}

const METHOD_LABELS: Record<string, string> = {
  cash: "Cash",
  cheque: "Cheque",
  neft: "NEFT",
  rtgs: "RTGS",
  upi: "UPI",
  razorpay: "Razorpay",
  demand_draft: "DD",
};

export function PaymentsClient({
  payments,
  stats,
}: {
  payments: PaymentRow[];
  stats: Stats;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Payments</h1>
          <p className="text-muted-foreground">Track and record payments</p>
        </div>
        <Link href="/payments/manual">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Record Payment
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Collected
            </CardTitle>
            <IndianRupee className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatINR(stats.totalCollected)}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.totalPayments} payments
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Cash / Cheque
            </CardTitle>
            <Banknote className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.cashCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Online</CardTitle>
            <Smartphone className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.onlineCount}</div>
          </CardContent>
        </Card>
      </div>

      {payments.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardHeader className="text-center">
            <CardTitle>No payments recorded</CardTitle>
            <CardDescription>
              Record a manual payment or wait for online payments via Razorpay
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Receipt #</TableHead>
                <TableHead>Member</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Invoice</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Method</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((row) => (
                <TableRow key={row.payment.id}>
                  <TableCell className="font-medium">
                    {row.payment.receiptNumber}
                  </TableCell>
                  <TableCell>{row.member.name}</TableCell>
                  <TableCell>
                    {row.unit.unitNumber} ({row.block.name})
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {row.invoice.invoiceNumber}
                  </TableCell>
                  <TableCell>{formatDate(row.payment.paymentDate)}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {METHOD_LABELS[row.payment.paymentMethod] ||
                        row.payment.paymentMethod}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatINR(row.payment.amount)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        row.payment.status === "captured"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {row.payment.status}
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
