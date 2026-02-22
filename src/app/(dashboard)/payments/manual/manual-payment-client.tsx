"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { recordManualPayment } from "@/services/payment.service";
import { formatINR } from "@/lib/utils/currency";
import { getMonthName } from "@/lib/utils/invoice-number";
import Link from "next/link";

interface InvoiceRow {
  invoice: {
    id: string;
    invoiceNumber: string;
    billingMonth: number;
    billingYear: number;
    totalAmount: string;
    balanceDue: string;
  };
  unit: { unitNumber: string };
  block: { name: string };
  member: { name: string };
}

export function ManualPaymentClient({
  societyId,
  invoices,
}: {
  societyId: string;
  invoices: InvoiceRow[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceRow | null>(
    null
  );
  const [method, setMethod] = useState<string>("cash");

  function onInvoiceChange(invoiceId: string) {
    const inv = invoices.find((i) => i.invoice.id === invoiceId);
    setSelectedInvoice(inv || null);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const fd = new FormData(e.currentTarget);

    try {
      await recordManualPayment({
        societyId,
        invoiceId: fd.get("invoiceId") as string,
        amount: fd.get("amount") as string,
        paymentDate: fd.get("paymentDate") as string,
        paymentMethod: method as "cash",
        instrumentNumber: (fd.get("instrumentNumber") as string) || undefined,
        instrumentDate: (fd.get("instrumentDate") as string) || undefined,
        bankName: (fd.get("bankName") as string) || undefined,
        transactionReference:
          (fd.get("transactionReference") as string) || undefined,
        notes: (fd.get("notes") as string) || undefined,
      });
      router.push("/payments");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to record payment"
      );
    } finally {
      setLoading(false);
    }
  }

  const showInstrumentFields = method === "cheque" || method === "demand_draft";
  const showRefField = method === "neft" || method === "rtgs" || method === "upi";

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Record Payment</h1>
        <p className="text-muted-foreground">
          Manually record a cash, cheque, or bank transfer payment
        </p>
      </div>

      {invoices.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardHeader className="text-center">
            <CardTitle>No unpaid invoices</CardTitle>
            <CardDescription>
              All invoices are fully paid. Generate new invoices first.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Payment Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Invoice *</Label>
                <Select
                  name="invoiceId"
                  required
                  onValueChange={onInvoiceChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select invoice" />
                  </SelectTrigger>
                  <SelectContent>
                    {invoices.map((row) => (
                      <SelectItem key={row.invoice.id} value={row.invoice.id}>
                        {row.invoice.invoiceNumber} — {row.unit.unitNumber} (
                        {row.block.name}) — {row.member.name} — Due:{" "}
                        {formatINR(row.invoice.balanceDue)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedInvoice && (
                <div className="rounded-md bg-muted p-3 text-sm">
                  <div className="flex justify-between">
                    <span>Invoice Total</span>
                    <span>
                      {formatINR(selectedInvoice.invoice.totalAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between font-medium text-destructive">
                    <span>Balance Due</span>
                    <span>
                      {formatINR(selectedInvoice.invoice.balanceDue)}
                    </span>
                  </div>
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (₹) *</Label>
                  <Input
                    id="amount"
                    name="amount"
                    type="number"
                    step="0.01"
                    min="1"
                    placeholder={
                      selectedInvoice?.invoice.balanceDue || "0"
                    }
                    defaultValue={selectedInvoice?.invoice.balanceDue || ""}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="paymentDate">Payment Date *</Label>
                  <Input
                    id="paymentDate"
                    name="paymentDate"
                    type="date"
                    defaultValue={new Date().toISOString().split("T")[0]}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Payment Method *</Label>
                  <Select
                    value={method}
                    onValueChange={setMethod}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="cheque">Cheque</SelectItem>
                      <SelectItem value="neft">NEFT</SelectItem>
                      <SelectItem value="rtgs">RTGS</SelectItem>
                      <SelectItem value="upi">UPI</SelectItem>
                      <SelectItem value="demand_draft">Demand Draft</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {showInstrumentFields && (
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="instrumentNumber">
                      {method === "cheque" ? "Cheque" : "DD"} Number
                    </Label>
                    <Input
                      id="instrumentNumber"
                      name="instrumentNumber"
                      placeholder="123456"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="instrumentDate">Date</Label>
                    <Input
                      id="instrumentDate"
                      name="instrumentDate"
                      type="date"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bankName">Bank Name</Label>
                    <Input
                      id="bankName"
                      name="bankName"
                      placeholder="SBI"
                    />
                  </div>
                </div>
              )}

              {showRefField && (
                <div className="space-y-2">
                  <Label htmlFor="transactionReference">
                    Transaction Reference / UTR
                  </Label>
                  <Input
                    id="transactionReference"
                    name="transactionReference"
                    placeholder="UTR1234567890"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Input
                  id="notes"
                  name="notes"
                  placeholder="Optional payment notes"
                />
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <div className="flex gap-3">
                <Link href="/payments">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" disabled={loading}>
                  {loading ? "Recording..." : "Record Payment"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
