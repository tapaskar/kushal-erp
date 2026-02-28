"use client";

import { useState } from "react";
import Link from "next/link";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  expected: "bg-yellow-100 text-yellow-800",
  checked_in: "bg-green-100 text-green-800",
  checked_out: "bg-blue-100 text-blue-800",
  rejected: "bg-red-100 text-red-800",
};

interface VisitorRow {
  id: string;
  visitorName: string;
  visitorPhone: string | null;
  visitorType: string;
  purpose: string | null;
  vehicleNumber: string | null;
  status: string;
  checkInAt: string | null;
  checkOutAt: string | null;
  checkInGate: string | null;
  checkOutGate: string | null;
  staffName: string | null;
  createdAt: Date | string;
}

export function VisitorsClient({ visitors }: { visitors: VisitorRow[] }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const filtered = visitors.filter((v) => {
    const matchesSearch =
      !search ||
      v.visitorName.toLowerCase().includes(search.toLowerCase()) ||
      v.visitorPhone?.includes(search);
    const matchesStatus = !statusFilter || v.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/staff">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Staff
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Visitor Logs</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{visitors.length}</div>
            <p className="text-sm text-muted-foreground">Total Today</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              {visitors.filter((v) => v.status === "checked_in").length}
            </div>
            <p className="text-sm text-muted-foreground">Currently Inside</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">
              {visitors.filter((v) => v.status === "checked_out").length}
            </div>
            <p className="text-sm text-muted-foreground">Checked Out</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">
              {visitors.filter((v) => v.status === "rejected").length}
            </div>
            <p className="text-sm text-muted-foreground">Rejected</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <Input
          placeholder="Search by name or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <select
          className="border rounded-md px-3 py-2 text-sm"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Status</option>
          <option value="checked_in">Checked In</option>
          <option value="checked_out">Checked Out</option>
          <option value="expected">Expected</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Visitor</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Purpose</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Check In</TableHead>
                <TableHead>Check Out</TableHead>
                <TableHead>Gate Staff</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((v) => (
                <TableRow key={v.id}>
                  <TableCell className="font-medium">{v.visitorName}</TableCell>
                  <TableCell className="capitalize">{v.visitorType}</TableCell>
                  <TableCell>{v.visitorPhone || "-"}</TableCell>
                  <TableCell>{v.purpose || "-"}</TableCell>
                  <TableCell>{v.vehicleNumber || "-"}</TableCell>
                  <TableCell>
                    <Badge className={STATUS_COLORS[v.status] || ""}>
                      {v.status.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {v.checkInAt
                      ? new Date(v.checkInAt).toLocaleTimeString()
                      : "-"}
                  </TableCell>
                  <TableCell>
                    {v.checkOutAt
                      ? new Date(v.checkOutAt).toLocaleTimeString()
                      : "-"}
                  </TableCell>
                  <TableCell>{v.staffName || "-"}</TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    No visitor logs found
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
