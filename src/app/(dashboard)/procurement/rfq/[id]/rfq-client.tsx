"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  Mail,
  CheckCircle,
  Clock,
  Trophy,
  Medal,
  Award,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { createPurchaseOrder } from "@/services/procurement.service";

type RfqData = Awaited<ReturnType<typeof import("@/services/procurement.service").getRfq>>;

const RANK_CONFIG = [
  { rank: 1, label: "L1", icon: Trophy, color: "text-yellow-600", bg: "bg-yellow-50", border: "border-yellow-200" },
  { rank: 2, label: "L2", icon: Medal, color: "text-gray-500", bg: "bg-gray-50", border: "border-gray-200" },
  { rank: 3, label: "L3", icon: Award, color: "text-orange-500", bg: "bg-orange-50", border: "border-orange-200" },
];

function fmt(n: string | null | undefined) {
  if (!n) return "—";
  return `₹${parseFloat(n).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
}

export function RfqClient({ data }: { data: NonNullable<RfqData> }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [poDialog, setPoDialog] = useState<{ quotationId: string; vendorName: string; rank: number } | null>(null);
  const [remark, setRemark] = useState("");

  const { rfq, pr, prItems, invited, quotations } = data;
  const rankedQuotes = [...quotations].sort(
    (a, b) => (a.quotation.rank ?? 99) - (b.quotation.rank ?? 99)
  );

  function openPoDialog(quotationId: string, vendorName: string, rank: number) {
    setRemark("");
    setPoDialog({ quotationId, vendorName, rank });
  }

  function handleCreatePO() {
    if (!poDialog) return;
    if (poDialog.rank > 1 && !remark.trim()) {
      toast.error("Justification required when not selecting L1 vendor");
      return;
    }
    startTransition(async () => {
      try {
        const po = await createPurchaseOrder(
          rfq.id,
          poDialog.quotationId,
          remark || undefined
        );
        toast.success("Purchase Order created — pending L1 approval");
        setPoDialog(null);
        router.push(`/procurement/orders/${po.id}`);
      } catch (err) {
        toast.error((err as Error).message || "Failed to create PO");
      }
    });
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/procurement/requests">
            <ArrowLeft className="h-4 w-4 mr-1" /> Requests
          </Link>
        </Button>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">{rfq.referenceNo}</h1>
          <p className="text-muted-foreground">{pr.title}</p>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline">Deadline: {rfq.deadline}</Badge>
            <Badge
              className={rfq.status === "sent" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"}
            >
              {rfq.status}
            </Badge>
          </div>
        </div>
      </div>

      <Tabs defaultValue={quotations.length > 0 ? "comparison" : "vendors"}>
        <TabsList>
          <TabsTrigger value="vendors">
            Invited Vendors ({invited.length})
          </TabsTrigger>
          <TabsTrigger value="comparison">
            Comparative Statement ({quotations.length} quotes)
          </TabsTrigger>
        </TabsList>

        {/* Vendors tab */}
        <TabsContent value="vendors" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Vendor Invitation Status</CardTitle></CardHeader>
            <CardContent>
              {invited.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
                  <p>No matching approved vendors found for this category.</p>
                  <p className="text-sm mt-1">
                    <Link href="/vendors/new" className="text-primary underline">
                      Add vendors
                    </Link>{" "}
                    and approve them first.
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Vendor</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Email Sent</TableHead>
                      <TableHead>Quote Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invited.map(({ rfqVendor, vendor }) => {
                      const quote = quotations.find(
                        (q) => q.vendor.id === vendor.id
                      );
                      return (
                        <TableRow key={rfqVendor.id}>
                          <TableCell className="font-medium">{vendor.name}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {vendor.email}
                          </TableCell>
                          <TableCell>
                            {rfqVendor.emailSentAt ? (
                              <span className="flex items-center gap-1 text-green-600 text-sm">
                                <CheckCircle className="h-3 w-3" /> Sent
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-muted-foreground text-sm">
                                <Clock className="h-3 w-3" /> Pending
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            {quote ? (
                              <Badge className="bg-green-100 text-green-700">
                                Quote Received
                              </Badge>
                            ) : (
                              <Badge variant="outline">Awaiting</Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Comparative Statement */}
        <TabsContent value="comparison" className="space-y-4">
          {quotations.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <Clock className="h-8 w-8 mx-auto mb-2" />
                <p>No quotations received yet.</p>
                <p className="text-sm mt-1">
                  Vendors will submit quotes via their unique links.
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Rank summary cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {rankedQuotes.slice(0, 3).map(({ quotation, vendor }) => {
                  const cfg = RANK_CONFIG.find((r) => r.rank === quotation.rank);
                  if (!cfg) return null;
                  return (
                    <Card key={quotation.id} className={`border-2 ${cfg.border}`}>
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-lg font-bold ${cfg.color}`}>
                            {cfg.label}
                          </span>
                          <cfg.icon className={`h-5 w-5 ${cfg.color}`} />
                        </div>
                        <p className="font-semibold">{vendor.name}</p>
                        <p className="text-2xl font-bold mt-1">
                          {fmt(quotation.totalAmount)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Delivery: {quotation.deliveryDays ?? "—"} days ·
                          Valid till: {quotation.validUntil ?? "—"}
                        </p>
                        {quotation.status !== "accepted" &&
                          quotation.status !== "rejected" && (
                            <Button
                              className="w-full mt-3"
                              size="sm"
                              variant={quotation.rank === 1 ? "default" : "outline"}
                              onClick={() =>
                                openPoDialog(quotation.id, vendor.name, quotation.rank ?? 99)
                              }
                            >
                              Create PO — {cfg.label}
                            </Button>
                          )}
                        {quotation.status === "accepted" && (
                          <Badge className="w-full justify-center mt-3 bg-green-100 text-green-700">
                            PO Created
                          </Badge>
                        )}
                        {quotation.status === "rejected" && (
                          <Badge className="w-full justify-center mt-3 bg-red-100 text-red-700">
                            Not Selected
                          </Badge>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Detailed comparison table */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Line Item Comparison</CardTitle>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead>Qty</TableHead>
                        {rankedQuotes.map(({ quotation, vendor }) => (
                          <TableHead key={quotation.id}>
                            <div>
                              <span className="font-bold">
                                {RANK_CONFIG.find((r) => r.rank === quotation.rank)?.label}
                              </span>{" "}
                              {vendor.name}
                            </div>
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {prItems.map((prItem) => (
                        <TableRow key={prItem.id}>
                          <TableCell className="font-medium">
                            {prItem.itemName}
                            {prItem.specification && (
                              <p className="text-xs text-muted-foreground">
                                {prItem.specification}
                              </p>
                            )}
                          </TableCell>
                          <TableCell className="text-sm">
                            {prItem.quantity} {prItem.unit}
                          </TableCell>
                          {rankedQuotes.map(({ quotation, items }) => {
                            const lineItem = items.find(
                              (i) => i.prItemId === prItem.id
                            );
                            return (
                              <TableCell key={quotation.id} className="text-sm">
                                {lineItem ? (
                                  <div>
                                    <p>
                                      {fmt(lineItem.unitPrice)}/{lineItem.unit}
                                    </p>
                                    <p className="text-muted-foreground text-xs">
                                      Total: {fmt(lineItem.lineTotal)}
                                    </p>
                                  </div>
                                ) : (
                                  <span className="text-muted-foreground">—</span>
                                )}
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      ))}
                      {/* Totals */}
                      <TableRow className="font-medium border-t-2">
                        <TableCell colSpan={2} className="font-semibold">
                          Subtotal
                        </TableCell>
                        {rankedQuotes.map(({ quotation }) => (
                          <TableCell key={quotation.id}>
                            {fmt(quotation.subtotal)}
                          </TableCell>
                        ))}
                      </TableRow>
                      <TableRow>
                        <TableCell colSpan={2} className="text-muted-foreground">
                          GST
                        </TableCell>
                        {rankedQuotes.map(({ quotation }) => (
                          <TableCell key={quotation.id} className="text-muted-foreground">
                            {fmt(quotation.gstAmount)}
                          </TableCell>
                        ))}
                      </TableRow>
                      <TableRow className="bg-muted/30">
                        <TableCell colSpan={2} className="font-bold text-base">
                          Grand Total
                        </TableCell>
                        {rankedQuotes.map(({ quotation }, idx) => (
                          <TableCell
                            key={quotation.id}
                            className={`font-bold text-base ${idx === 0 ? "text-green-700" : ""}`}
                          >
                            {fmt(quotation.totalAmount)}
                            {idx === 0 && (
                              <Trophy className="inline h-4 w-4 ml-1 text-yellow-500" />
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                      <TableRow>
                        <TableCell colSpan={2} className="text-muted-foreground text-sm">
                          Delivery
                        </TableCell>
                        {rankedQuotes.map(({ quotation }) => (
                          <TableCell key={quotation.id} className="text-sm">
                            {quotation.deliveryDays
                              ? `${quotation.deliveryDays} days`
                              : "—"}
                          </TableCell>
                        ))}
                      </TableRow>
                      <TableRow>
                        <TableCell colSpan={2} className="text-muted-foreground text-sm">
                          Valid Until
                        </TableCell>
                        {rankedQuotes.map(({ quotation }) => (
                          <TableCell key={quotation.id} className="text-sm">
                            {quotation.validUntil ?? "—"}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* Create PO Dialog */}
      <Dialog open={!!poDialog} onOpenChange={(o) => !o && setPoDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Create Purchase Order —{" "}
              {RANK_CONFIG.find((r) => r.rank === poDialog?.rank)?.label}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <p className="text-sm">
              You are creating a PO for{" "}
              <strong>{poDialog?.vendorName}</strong>.
            </p>
            {poDialog && poDialog.rank > 1 && (
              <div className="space-y-1.5">
                <Label>
                  Justification for not selecting L1 *
                </Label>
                <textarea
                  className="w-full border rounded-md p-2 text-sm min-h-[80px] resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Reason for choosing a higher-ranked vendor (e.g., better quality, faster delivery, prior relationship)..."
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                />
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              The PO will enter the L1 → L2 → L3 approval chain before being issued.
            </p>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setPoDialog(null)}>
                Cancel
              </Button>
              <Button onClick={handleCreatePO} disabled={isPending}>
                {isPending ? "Creating..." : "Create PO"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
