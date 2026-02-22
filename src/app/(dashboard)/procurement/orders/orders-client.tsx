"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Package, Search, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { approvePO } from "@/services/procurement.service";
import { PO_STATUS_COLORS } from "@/lib/constants";

type Order = {
  po: {
    id: string;
    referenceNo: string;
    status: string;
    totalAmount: string | null;
    createdAt: Date;
  };
  vendor: { name: string; email: string };
  rfq: { referenceNo: string };
  createdByUser: { name: string } | null;
};

// Role → which approval level they can approve
const ROLE_LEVEL: Record<string, "l1" | "l2" | "l3" | null> = {
  committee_member: "l1",
  treasurer: "l2",
  society_admin: "l3",
};

const APPROVAL_STATUS = {
  l1: "pending_l1",
  l2: "pending_l2",
  l3: "pending_l3",
};

function fmt(n: string | null) {
  if (!n) return "—";
  return `₹${parseFloat(n).toLocaleString("en-IN")}`;
}

export function OrdersClient({
  orders,
  userRole,
  userId,
}: {
  orders: Order[];
  userRole: string;
  userId: string;
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isPending, startTransition] = useTransition();

  const approvalLevel = ROLE_LEVEL[userRole] ?? null;

  const filtered = orders.filter(({ po, vendor }) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      po.referenceNo.toLowerCase().includes(q) ||
      vendor.name.toLowerCase().includes(q);
    const matchStatus = statusFilter === "all" || po.status === statusFilter;
    return matchSearch && matchStatus;
  });

  function handleApprove(poId: string) {
    if (!approvalLevel) return;
    startTransition(async () => {
      try {
        await approvePO(poId, approvalLevel);
        toast.success("PO approved successfully");
        router.refresh();
      } catch (err) {
        toast.error((err as Error).message || "Failed to approve");
      }
    });
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Package className="h-6 w-6" /> Purchase Orders
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Approve and track procurement orders
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">All Purchase Orders</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by PO number or vendor..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending_l1">Pending L1</SelectItem>
                <SelectItem value="pending_l2">Pending L2</SelectItem>
                <SelectItem value="pending_l3">Pending L3</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="issued">Issued</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>PO Number</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>RFQ</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No purchase orders found
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map(({ po, vendor, rfq, createdByUser }) => {
                  const canApprove =
                    approvalLevel &&
                    po.status === APPROVAL_STATUS[approvalLevel];

                  return (
                    <TableRow key={po.id}>
                      <TableCell>
                        <Link
                          href={`/procurement/orders/${po.id}`}
                          className="font-mono text-sm font-medium hover:underline"
                        >
                          {po.referenceNo}
                        </Link>
                        <p className="text-xs text-muted-foreground">
                          {new Date(po.createdAt).toLocaleDateString("en-IN")}
                        </p>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium text-sm">{vendor.name}</p>
                        <p className="text-xs text-muted-foreground">{vendor.email}</p>
                      </TableCell>
                      <TableCell className="text-xs font-mono text-muted-foreground">
                        {rfq.referenceNo}
                      </TableCell>
                      <TableCell className="font-medium">
                        {fmt(po.totalAmount)}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                            PO_STATUS_COLORS[po.status] || "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {po.status.replace(/_/g, " ")}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {canApprove && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-green-600 border-green-200 hover:bg-green-50"
                              disabled={isPending}
                              onClick={() => handleApprove(po.id)}
                            >
                              <CheckCircle className="h-3 w-3 mr-1" /> Approve
                            </Button>
                          )}
                          <Button size="sm" variant="ghost" asChild>
                            <Link href={`/procurement/orders/${po.id}`}>View</Link>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
