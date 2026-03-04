"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatINR } from "@/lib/utils/currency";
import { formatDate } from "@/lib/utils/dates";
import {
  IndianRupee,
  TrendingUp,
  AlertTriangle,
  Users,
  MessageSquare,
  CheckCircle,
  Building2,
  Pin,
} from "lucide-react";

const CATEGORY_COLORS: Record<string, string> = {
  general: "bg-gray-100 text-gray-800",
  maintenance: "bg-blue-100 text-blue-800",
  meeting: "bg-purple-100 text-purple-800",
  event: "bg-green-100 text-green-800",
  emergency: "bg-red-100 text-red-800",
  financial: "bg-amber-100 text-amber-800",
  rule_update: "bg-orange-100 text-orange-800",
};

interface Props {
  billingStats: {
    totalInvoices: number;
    totalBilled: number;
    totalPaid: number;
    totalOutstanding: number;
  };
  paymentStats: {
    totalPayments: number;
    totalCollected: number;
    cashCount: number;
    onlineCount: number;
  };
  complaintStats: {
    total: number;
    open: number;
    resolved: number;
  };
  notices: Array<{
    notice: {
      id: string;
      title: string;
      body: string;
      category: string;
      isPinned: boolean;
      createdAt: Date;
    };
    author: { name: string | null } | null;
  }>;
  overview: {
    totalUnits: number;
    occupied: number;
    vacant: number;
    totalMembers: number;
    owners: number;
    tenants: number;
  };
}

export function ResidentDashboardClient({
  billingStats,
  paymentStats,
  complaintStats,
  notices,
  overview,
}: Props) {
  const collectionEfficiency =
    billingStats.totalBilled > 0
      ? Math.round((billingStats.totalPaid / billingStats.totalBilled) * 100)
      : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Society Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of society finances and operations
        </p>
      </div>

      {/* Financial Summary */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Billed</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatINR(billingStats.totalBilled)}
            </div>
            <p className="text-xs text-muted-foreground">
              {billingStats.totalInvoices} invoices generated
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Collected
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatINR(paymentStats.totalCollected)}
            </div>
            <p className="text-xs text-muted-foreground">
              {paymentStats.totalPayments} payments received
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {formatINR(billingStats.totalOutstanding)}
            </div>
            <p className="text-xs text-muted-foreground">Pending collection</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Collection Efficiency
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {collectionEfficiency}%
            </div>
            <p className="text-xs text-muted-foreground">
              Cash: {paymentStats.cashCount} | Online:{" "}
              {paymentStats.onlineCount}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Society & Complaints Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Society Members
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.totalMembers}</div>
            <p className="text-xs text-muted-foreground">
              {overview.owners} owners, {overview.tenants} tenants
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Units
            </CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.totalUnits}</div>
            <p className="text-xs text-muted-foreground">
              {overview.occupied} occupied, {overview.vacant} vacant
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Complaints</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{complaintStats.total}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-orange-600">{complaintStats.open} open</span>
              {" | "}
              <span className="text-green-600">
                {complaintStats.resolved} resolved
              </span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Notices */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Recent Notices</h2>
          <Link
            href="/resident/notices"
            className="text-sm text-primary hover:underline"
          >
            View all
          </Link>
        </div>

        {notices.length === 0 ? (
          <Card className="border-dashed border-2">
            <CardContent className="pt-6 text-center text-sm text-muted-foreground">
              No notices published yet.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {notices.map((row) => (
              <Card
                key={row.notice.id}
                className={
                  row.notice.isPinned ? "border-primary/50" : undefined
                }
              >
                <CardContent className="pt-4 pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {row.notice.isPinned && (
                          <Pin className="h-3 w-3 text-primary shrink-0" />
                        )}
                        <h3 className="font-medium text-sm truncate">
                          {row.notice.title}
                        </h3>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {row.notice.body}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          CATEGORY_COLORS[row.notice.category] ||
                          CATEGORY_COLORS.general
                        }`}
                      >
                        {row.notice.category.replace("_", " ")}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(row.notice.createdAt)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
