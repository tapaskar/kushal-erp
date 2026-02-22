"use client";

import Link from "next/link";
import {
  ShoppingCart,
  FileText,
  Clock,
  CheckCircle,
  Package,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PR_STATUS_COLORS, PO_STATUS_COLORS } from "@/lib/constants";

type Stats = {
  openPRs: number;
  pendingRFQs: number;
  pendingQuotes: number;
  pendingApproval: number;
  approved: number;
  issued: number;
};

export function ProcurementClient({
  stats,
  recentPRs,
  recentPOs,
  userRole,
}: {
  stats: Stats;
  recentPRs: Array<{
    pr: { id: string; referenceNo: string; title: string; status: string; priority: string; createdAt: Date };
  }>;
  recentPOs: Array<{
    po: { id: string; referenceNo: string; status: string; totalAmount: string | null };
    vendor: { name: string };
  }>;
  userRole: string;
}) {
  const statCards = [
    {
      label: "Open Requests",
      value: stats.openPRs,
      icon: FileText,
      color: "text-blue-600",
      bg: "bg-blue-50",
      href: "/procurement/requests",
    },
    {
      label: "Awaiting Quotes",
      value: stats.pendingQuotes,
      icon: Clock,
      color: "text-yellow-600",
      bg: "bg-yellow-50",
      href: "/procurement/requests",
    },
    {
      label: "POs Pending Approval",
      value: stats.pendingApproval,
      icon: Package,
      color: "text-orange-600",
      bg: "bg-orange-50",
      href: "/procurement/orders",
    },
    {
      label: "POs Issued",
      value: stats.issued,
      icon: CheckCircle,
      color: "text-green-600",
      bg: "bg-green-50",
      href: "/procurement/orders",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ShoppingCart className="h-6 w-6" /> Procurement
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage purchase requests, RFQs, quotations, and purchase orders
          </p>
        </div>
        <Button asChild>
          <Link href="/procurement/requests/new">
            <FileText className="h-4 w-4 mr-2" /> New Request
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <Link key={s.label} href={s.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="pt-4">
                <div className={`inline-flex p-2 rounded-lg ${s.bg} mb-2`}>
                  <s.icon className={`h-5 w-5 ${s.color}`} />
                </div>
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent PRs */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base">Recent Purchase Requests</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/procurement/requests">
                View all <ArrowRight className="h-3 w-3 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentPRs.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No purchase requests yet
              </p>
            ) : (
              recentPRs.map(({ pr }) => (
                <Link
                  key={pr.id}
                  href={`/procurement/requests`}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium">{pr.title}</p>
                    <p className="text-xs text-muted-foreground">{pr.referenceNo}</p>
                  </div>
                  <span
                    className={`text-xs rounded-full px-2 py-0.5 font-medium ${
                      PR_STATUS_COLORS[pr.status] || "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {pr.status.replace(/_/g, " ")}
                  </span>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        {/* Recent POs */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base">Recent Purchase Orders</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/procurement/orders">
                View all <ArrowRight className="h-3 w-3 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentPOs.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No purchase orders yet
              </p>
            ) : (
              recentPOs.map(({ po, vendor }) => (
                <Link
                  key={po.id}
                  href={`/procurement/orders/${po.id}`}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium">{po.referenceNo}</p>
                    <p className="text-xs text-muted-foreground">{vendor.name}</p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-xs rounded-full px-2 py-0.5 font-medium ${
                        PO_STATUS_COLORS[po.status] || "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {po.status.replace(/_/g, " ")}
                    </span>
                    {po.totalAmount && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        ₹{parseFloat(po.totalAmount).toLocaleString("en-IN")}
                      </p>
                    )}
                  </div>
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Button variant="outline" asChild className="h-auto py-3">
          <Link href="/procurement/requests/new" className="flex flex-col gap-1">
            <span className="font-medium">New Purchase Request</span>
            <span className="text-xs text-muted-foreground">Raise a procurement need</span>
          </Link>
        </Button>
        <Button variant="outline" asChild className="h-auto py-3">
          <Link href="/procurement/requests" className="flex flex-col gap-1">
            <span className="font-medium">Manage RFQs</span>
            <span className="text-xs text-muted-foreground">Send quotes to vendors</span>
          </Link>
        </Button>
        <Button variant="outline" asChild className="h-auto py-3">
          <Link href="/procurement/orders" className="flex flex-col gap-1">
            <span className="font-medium">Purchase Orders</span>
            <span className="text-xs text-muted-foreground">Approve & track orders</span>
          </Link>
        </Button>
      </div>
    </div>
  );
}
