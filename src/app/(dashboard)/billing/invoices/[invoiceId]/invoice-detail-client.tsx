"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Download } from "lucide-react";
import { formatINR } from "@/lib/utils/currency";
import { formatDate } from "@/lib/utils/dates";
import { getMonthName } from "@/lib/utils/invoice-number";

interface InvoiceData {
  invoice: {
    id: string;
    invoiceNumber: string;
    billingMonth: number;
    billingYear: number;
    issueDate: string;
    dueDate: string;
    subtotal: string;
    gstAmount: string;
    interestAmount: string;
    totalAmount: string;
    paidAmount: string;
    balanceDue: string;
    previousBalance: string;
    status: string;
  };
  unit: { unitNumber: string };
  block: { name: string };
  member: { name: string; phone: string; email: string | null };
  society: {
    name: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  lineItems: {
    lineItem: {
      description: string;
      rate: string;
      quantity: string;
      amount: string;
      gstRate: string | null;
      gstAmount: string | null;
      totalAmount: string;
      areaSqft: string | null;
    };
    chargeHead: { code: string };
  }[];
}

const STATUS_BADGE: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  draft: "secondary",
  sent: "outline",
  partially_paid: "secondary",
  paid: "default",
  overdue: "destructive",
  cancelled: "secondary",
};

export function InvoiceDetailClient({ data }: { data: InvoiceData }) {
  const { invoice, unit, block, member, society, lineItems } = data;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/billing/invoices">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{invoice.invoiceNumber}</h1>
          <p className="text-muted-foreground">
            {getMonthName(invoice.billingMonth)} {invoice.billingYear}
          </p>
        </div>
        <Badge
          variant={STATUS_BADGE[invoice.status] || "outline"}
          className="text-sm"
        >
          {invoice.status.replace("_", " ")}
        </Badge>
        <a href={`/api/invoices/${invoice.id}/pdf`} target="_blank">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            PDF
          </Button>
        </a>
      </div>

      {/* Invoice header */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground mb-1">
                FROM
              </h3>
              <p className="font-medium">{society.name}</p>
              <p className="text-sm text-muted-foreground">
                {society.address}
                <br />
                {society.city}, {society.state} — {society.pincode}
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground mb-1">
                BILL TO
              </h3>
              <p className="font-medium">{member.name}</p>
              <p className="text-sm text-muted-foreground">
                Unit {unit.unitNumber}, {block.name}
                <br />
                {member.phone}
                {member.email && (
                  <>
                    <br />
                    {member.email}
                  </>
                )}
              </p>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="grid gap-4 grid-cols-2 sm:grid-cols-4 text-sm">
            <div>
              <span className="text-muted-foreground">Invoice #</span>
              <p className="font-medium">{invoice.invoiceNumber}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Issue Date</span>
              <p className="font-medium">{formatDate(invoice.issueDate)}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Due Date</span>
              <p className="font-medium">{formatDate(invoice.dueDate)}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Period</span>
              <p className="font-medium">
                {getMonthName(invoice.billingMonth)} {invoice.billingYear}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Line items */}
      <Card>
        <CardHeader>
          <CardTitle>Charges</CardTitle>
        </CardHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Rate</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right">GST</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lineItems.map((row, i) => (
              <TableRow key={i}>
                <TableCell>
                  {row.lineItem.description}
                  {row.lineItem.areaSqft && (
                    <span className="text-xs text-muted-foreground ml-1">
                      ({row.lineItem.areaSqft} sq.ft.)
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {formatINR(row.lineItem.rate)}
                </TableCell>
                <TableCell className="text-right">
                  {formatINR(row.lineItem.amount)}
                </TableCell>
                <TableCell className="text-right">
                  {parseFloat(row.lineItem.gstAmount || "0") > 0
                    ? formatINR(row.lineItem.gstAmount || "0")
                    : "—"}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatINR(row.lineItem.totalAmount)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Summary */}
      <Card>
        <CardContent className="pt-6">
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd>{formatINR(invoice.subtotal)}</dd>
            </div>
            {parseFloat(invoice.gstAmount) > 0 && (
              <div className="flex justify-between">
                <dt className="text-muted-foreground">GST</dt>
                <dd>{formatINR(invoice.gstAmount)}</dd>
              </div>
            )}
            {parseFloat(invoice.interestAmount) > 0 && (
              <div className="flex justify-between">
                <dt className="text-muted-foreground">
                  Interest on Overdue
                </dt>
                <dd className="text-destructive">
                  {formatINR(invoice.interestAmount)}
                </dd>
              </div>
            )}
            <Separator />
            <div className="flex justify-between font-medium">
              <dt>Current Charges</dt>
              <dd>{formatINR(invoice.totalAmount)}</dd>
            </div>
            {parseFloat(invoice.previousBalance) > 0 && (
              <div className="flex justify-between text-destructive">
                <dt>Previous Outstanding</dt>
                <dd>{formatINR(invoice.previousBalance)}</dd>
              </div>
            )}
            {parseFloat(invoice.paidAmount) > 0 && (
              <div className="flex justify-between text-green-600">
                <dt>Paid</dt>
                <dd>- {formatINR(invoice.paidAmount)}</dd>
              </div>
            )}
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <dt>Balance Due</dt>
              <dd
                className={
                  parseFloat(invoice.balanceDue) > 0
                    ? "text-destructive"
                    : "text-green-600"
                }
              >
                {formatINR(invoice.balanceDue)}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
