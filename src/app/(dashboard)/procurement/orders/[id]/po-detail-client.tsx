"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowLeft,
  Package,
  CheckCircle,
  Clock,
  Building2,
  Mail,
  Phone,
  Send,
  Truck,
} from "lucide-react";
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
import { approvePO, issuePO, markPODelivered, getPurchaseOrder } from "@/services/procurement.service";
import { PO_STATUS_COLORS } from "@/lib/constants";

type PODetail = NonNullable<Awaited<ReturnType<typeof getPurchaseOrder>>>;

const ROLE_LEVEL: Record<string, "l1" | "l2" | "l3" | null> = {
  committee_member: "l1",
  treasurer: "l2",
  society_admin: "l3",
};

function fmt(n: string | null | undefined) {
  if (!n) return "—";
  return `₹${parseFloat(n).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
}

const APPROVAL_STEPS = [
  { key: "l1", label: "L1 — Committee", status: "pending_l1" },
  { key: "l2", label: "L2 — Treasurer", status: "pending_l2" },
  { key: "l3", label: "L3 — Society Admin", status: "pending_l3" },
  { key: "approved", label: "Approved", status: "approved" },
];

export function PODetailClient({
  po: initialPO,
  userRole,
}: {
  po: PODetail;
  userRole: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [po, setPO] = useState<PODetail>(initialPO);

  const { vendor, rfq, items, l1ApproverName, l2ApproverName, l3ApproverName } = po;
  const approvalLevel = ROLE_LEVEL[userRole] ?? null;
  const APPROVAL_STATUS: Record<string, string> = { l1: "pending_l1", l2: "pending_l2", l3: "pending_l3" };
  const canApprove = approvalLevel && po.po.status === APPROVAL_STATUS[approvalLevel];
  const canIssue = po.po.status === "approved" && userRole === "society_admin";
  const canMarkDelivered = po.po.status === "issued";

  const statusOrder = ["pending_l1", "pending_l2", "pending_l3", "approved", "issued", "delivered"];
  const currentStepIdx = statusOrder.indexOf(po.po.status);

  async function refreshPO() {
    const updated = await getPurchaseOrder(po.po.id);
    if (updated) setPO(updated);
  }

  function handleApprove() {
    if (!approvalLevel) return;
    startTransition(async () => {
      try {
        await approvePO(po.po.id, approvalLevel);
        toast.success("PO approved");
        router.refresh();
        await refreshPO();
      } catch (err) {
        toast.error((err as Error).message);
      }
    });
  }

  function handleIssue() {
    startTransition(async () => {
      try {
        await issuePO(po.po.id);
        toast.success("PO issued to vendor");
        await refreshPO();
      } catch (err) {
        toast.error((err as Error).message);
      }
    });
  }

  function handleDelivered() {
    startTransition(async () => {
      try {
        await markPODelivered(po.po.id);
        toast.success("Marked as delivered");
        await refreshPO();
      } catch (err) {
        toast.error((err as Error).message);
      }
    });
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/procurement/orders">
            <ArrowLeft className="h-4 w-4 mr-1" /> Orders
          </Link>
        </Button>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Package className="h-6 w-6" /> {po.po.referenceNo}
          </h1>
          <p className="text-muted-foreground text-sm">
            From RFQ: {rfq.referenceNo}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <span
              className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${
                PO_STATUS_COLORS[po.po.status] || "bg-gray-100 text-gray-700"
              }`}
            >
              {po.po.status.replace(/_/g, " ")}
            </span>
            <span className="text-lg font-bold">
              {fmt(po.po.totalAmount)}
            </span>
          </div>
          {po.po.approvalRemark && (
            <div className="mt-2 text-sm bg-yellow-50 border border-yellow-200 rounded p-2 text-yellow-800">
              <strong>Justification:</strong> {po.po.approvalRemark}
            </div>
          )}
        </div>

        <div className="flex gap-2">
          {canApprove && (
            <Button
              className="bg-green-600 hover:bg-green-700"
              disabled={isPending}
              onClick={handleApprove}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve (
              {APPROVAL_STEPS.find((s) => s.key === approvalLevel)?.label})
            </Button>
          )}
          {canIssue && (
            <Button disabled={isPending} onClick={handleIssue}>
              <Send className="h-4 w-4 mr-2" /> Issue PO
            </Button>
          )}
          {canMarkDelivered && (
            <Button variant="outline" disabled={isPending} onClick={handleDelivered}>
              <Truck className="h-4 w-4 mr-2" /> Mark Delivered
            </Button>
          )}
        </div>
      </div>

      {/* 3-Level Approval Timeline */}
      <Card>
        <CardHeader><CardTitle className="text-base">Approval Timeline</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center gap-0">
            {APPROVAL_STEPS.map((step, idx) => {
              const stepIdx = statusOrder.indexOf(step.status);
              const done = currentStepIdx > stepIdx;
              const active = po.po.status === step.status;
              const approverName =
                step.key === "l1" ? l1ApproverName :
                step.key === "l2" ? l2ApproverName :
                step.key === "l3" ? l3ApproverName : null;
              const approvedAt =
                step.key === "l1" ? po.po.l1ApprovedAt :
                step.key === "l2" ? po.po.l2ApprovedAt :
                step.key === "l3" ? po.po.l3ApprovedAt : null;

              return (
                <div key={step.key} className="flex items-center flex-1 min-w-0">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 ${
                        done
                          ? "bg-green-500 border-green-500 text-white"
                          : active
                          ? "bg-primary border-primary text-white"
                          : "bg-background border-border text-muted-foreground"
                      }`}
                    >
                      {done ? <CheckCircle className="h-4 w-4" /> : active ? <Clock className="h-4 w-4" /> : idx + 1}
                    </div>
                    <div className="text-center mt-1 min-w-[80px]">
                      <p className="text-xs font-medium">{step.label}</p>
                      {approverName && (
                        <p className="text-xs text-muted-foreground">{approverName}</p>
                      )}
                      {approvedAt && (
                        <p className="text-xs text-muted-foreground">
                          {new Date(approvedAt).toLocaleDateString("en-IN")}
                        </p>
                      )}
                    </div>
                  </div>
                  {idx < APPROVAL_STEPS.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 mx-1 ${
                        done ? "bg-green-500" : "bg-border"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Vendor Info */}
        <Card>
          <CardHeader><CardTitle className="text-sm">Vendor</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="font-semibold text-base">{vendor.name}</p>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="h-4 w-4" /> {vendor.email}
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="h-4 w-4" /> {vendor.phone}
            </div>
            {vendor.gstin && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Building2 className="h-4 w-4" /> GSTIN: {vendor.gstin}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Order Terms */}
        <Card>
          <CardHeader><CardTitle className="text-sm">Order Terms</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Delivery</span>
              <span>{po.po.deliveryDays ? `${po.po.deliveryDays} days` : "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Payment Terms</span>
              <span>{po.po.paymentTerms || "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Amount</span>
              <span className="font-bold">{fmt(po.po.totalAmount)}</span>
            </div>
            {po.po.issuedAt && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Issued On</span>
                <span>{new Date(po.po.issuedAt).toLocaleDateString("en-IN")}</span>
              </div>
            )}
            {po.po.deliveredAt && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivered On</span>
                <span>{new Date(po.po.deliveredAt).toLocaleDateString("en-IN")}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Line Items */}
      <Card>
        <CardHeader><CardTitle className="text-base">Order Items</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Unit Price</TableHead>
                <TableHead>GST %</TableHead>
                <TableHead className="text-right">Line Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <p className="font-medium">{item.itemName}</p>
                    {item.notes && (
                      <p className="text-xs text-muted-foreground">{item.notes}</p>
                    )}
                  </TableCell>
                  <TableCell>
                    {item.quantity} {item.unit}
                  </TableCell>
                  <TableCell>{fmt(item.unitPrice)}</TableCell>
                  <TableCell>{item.gstPercent}%</TableCell>
                  <TableCell className="text-right font-medium">
                    {fmt(item.lineTotal)}
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="bg-muted/30 font-bold">
                <TableCell colSpan={4} className="text-right">
                  Grand Total
                </TableCell>
                <TableCell className="text-right">{fmt(po.po.totalAmount)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
