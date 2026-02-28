"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
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
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { approveSupply, rejectSupply } from "@/services/housekeeping-admin.service";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-gray-100 text-gray-800",
  approved: "bg-green-100 text-green-800",
  fulfilled: "bg-blue-100 text-blue-800",
  rejected: "bg-red-100 text-red-800",
};

const URGENCY_COLORS: Record<string, string> = {
  low: "bg-gray-100 text-gray-800",
  normal: "bg-blue-100 text-blue-800",
  urgent: "bg-red-100 text-red-800",
};

interface SupplyRow {
  id: string;
  itemName: string;
  quantity: number;
  urgency: string;
  reason: string | null;
  status: string;
  staffName: string;
  createdAt: Date | string;
}

export function SuppliesClient({ requests }: { requests: SupplyRow[] }) {
  const [list, setList] = useState(requests);
  const [processing, setProcessing] = useState<string | null>(null);

  const handleApprove = async (id: string) => {
    setProcessing(id);
    try {
      await approveSupply(id);
      setList(list.map((r) => (r.id === id ? { ...r, status: "approved" } : r)));
    } catch {
      // ignore
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (id: string) => {
    setProcessing(id);
    try {
      await rejectSupply(id);
      setList(list.map((r) => (r.id === id ? { ...r, status: "rejected" } : r)));
    } catch {
      // ignore
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/staff">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Staff
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Supply Requests</h1>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-600">
              {list.filter((r) => r.status === "pending").length}
            </div>
            <p className="text-sm text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              {list.filter((r) => r.status === "approved").length}
            </div>
            <p className="text-sm text-muted-foreground">Approved</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">
              {list.filter((r) => r.urgency === "urgent" && r.status === "pending").length}
            </div>
            <p className="text-sm text-muted-foreground">Urgent Pending</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Urgency</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Requested By</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.itemName}</TableCell>
                  <TableCell>{r.quantity}</TableCell>
                  <TableCell>
                    <Badge className={URGENCY_COLORS[r.urgency] || ""}>
                      {r.urgency}
                    </Badge>
                  </TableCell>
                  <TableCell>{r.reason || "-"}</TableCell>
                  <TableCell>{r.staffName}</TableCell>
                  <TableCell>
                    <Badge className={STATUS_COLORS[r.status] || ""}>
                      {r.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(r.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {r.status === "pending" && (
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={processing === r.id}
                          onClick={() => handleApprove(r.id)}
                        >
                          Approve
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={processing === r.id}
                          onClick={() => handleReject(r.id)}
                        >
                          Reject
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {list.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No supply requests
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
