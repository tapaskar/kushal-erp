"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Store,
  Plus,
  Search,
  CheckCircle,
  Clock,
  XCircle,
  ShieldOff,
  Link2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { updateVendorStatus } from "@/services/vendor.service";
import { VENDOR_CATEGORY_LABEL } from "@/lib/constants";

type Vendor = {
  vendor: {
    id: string;
    name: string;
    email: string;
    phone: string;
    vendorType: "product" | "service";
    status: "pending" | "approved" | "suspended" | "blacklisted";
    contactPerson: string | null;
    city: string | null;
    createdAt: Date;
  };
  createdByUser: { name: string } | null;
  categories: string[];
};

const STATUS_CONFIG = {
  pending: { label: "Pending", color: "bg-yellow-100 text-yellow-800", icon: Clock },
  approved: { label: "Approved", color: "bg-green-100 text-green-800", icon: CheckCircle },
  suspended: { label: "Suspended", color: "bg-orange-100 text-orange-800", icon: ShieldOff },
  blacklisted: { label: "Blacklisted", color: "bg-red-100 text-red-800", icon: XCircle },
};

export function VendorsClient({
  societyId,
  vendors,
  stats,
}: {
  societyId: string;
  vendors: Vendor[];
  stats: { total: number; pending: number; approved: number; suspended: number };
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [isPending, startTransition] = useTransition();

  const filtered = vendors.filter((v) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      v.vendor.name.toLowerCase().includes(q) ||
      v.vendor.email.toLowerCase().includes(q) ||
      (v.vendor.contactPerson || "").toLowerCase().includes(q);
    const matchStatus =
      statusFilter === "all" || v.vendor.status === statusFilter;
    const matchType =
      typeFilter === "all" || v.vendor.vendorType === typeFilter;
    return matchSearch && matchStatus && matchType;
  });

  function handleApprove(vendorId: string) {
    startTransition(async () => {
      try {
        await updateVendorStatus(vendorId, "approved");
        toast.success("Vendor approved");
        router.refresh();
      } catch {
        toast.error("Failed to update status");
      }
    });
  }

  const registrationUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/vendor-register/${societyId}`;

  function copyLink() {
    navigator.clipboard.writeText(registrationUrl);
    toast.success("Registration link copied!");
  }

  return (
    <div className="p-6 space-y-6">
      {/* Self-registration banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
        <div>
          <p className="font-semibold text-blue-900 flex items-center gap-2">
            <Link2 className="h-4 w-4" /> Vendor Self-Registration Link
          </p>
          <p className="text-sm text-blue-700 mt-0.5">
            Share this link with vendors so they can register themselves. They
            start as &quot;pending&quot; and need your approval.
          </p>
          <code className="text-xs text-blue-600 bg-blue-100 rounded px-2 py-0.5 mt-1 inline-block break-all">
            {registrationUrl}
          </code>
        </div>
        <Button variant="outline" size="sm" onClick={copyLink} className="shrink-0 border-blue-300 text-blue-700 hover:bg-blue-100">
          Copy Link
        </Button>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Store className="h-6 w-6" /> Vendors
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage product and service vendors for procurement
          </p>
        </div>
        <Button asChild>
          <Link href="/vendors/new">
            <Plus className="h-4 w-4 mr-2" /> Add Vendor
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Vendors", value: stats.total, color: "text-foreground" },
          { label: "Pending Approval", value: stats.pending, color: "text-yellow-600" },
          { label: "Approved", value: stats.approved, color: "text-green-600" },
          { label: "Suspended", value: stats.suspended, color: "text-orange-600" },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">{s.label}</p>
              <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Vendor List</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, contact..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="blacklisted">Blacklisted</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="product">Product</SelectItem>
                <SelectItem value="service">Service</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vendor</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Categories</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No vendors found
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map(({ vendor, categories }) => {
                  const cfg = STATUS_CONFIG[vendor.status];
                  return (
                    <TableRow key={vendor.id}>
                      <TableCell>
                        <Link
                          href={`/vendors/${vendor.id}`}
                          className="font-medium hover:underline"
                        >
                          {vendor.name}
                        </Link>
                        {vendor.city && (
                          <p className="text-xs text-muted-foreground">{vendor.city}</p>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {vendor.vendorType}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {categories.slice(0, 2).map((cat) => (
                            <Badge
                              key={cat}
                              variant="secondary"
                              className="text-xs"
                            >
                              {VENDOR_CATEGORY_LABEL[cat] || cat}
                            </Badge>
                          ))}
                          {categories.length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{categories.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>{vendor.contactPerson || "—"}</p>
                          <p className="text-muted-foreground">{vendor.phone}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${cfg.color}`}
                        >
                          <cfg.icon className="h-3 w-3" />
                          {cfg.label}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {vendor.status === "pending" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-green-600 border-green-200 hover:bg-green-50"
                              disabled={isPending}
                              onClick={() => handleApprove(vendor.id)}
                            >
                              Approve
                            </Button>
                          )}
                          <Button size="sm" variant="ghost" asChild>
                            <Link href={`/vendors/${vendor.id}`}>View</Link>
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
