"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowLeft, Store, Mail, Phone, MapPin, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
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
import { updateVendorStatus } from "@/services/vendor.service";
import { VENDOR_CATEGORY_LABEL } from "@/lib/constants";

type VendorDetail = {
  vendor: {
    id: string;
    name: string;
    email: string;
    phone: string;
    vendorType: "product" | "service";
    status: "pending" | "approved" | "suspended" | "blacklisted";
    contactPerson: string | null;
    city: string | null;
    address: string | null;
    gstin: string | null;
    pan: string | null;
    bankName: string | null;
    accountNumber: string | null;
    ifscCode: string | null;
    notes: string | null;
    createdAt: Date;
  };
  createdByUser: { name: string } | null;
  categories: string[];
};

const STATUS_COLORS = {
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  suspended: "bg-orange-100 text-orange-800",
  blacklisted: "bg-red-100 text-red-800",
};

export function VendorDetailClient({ vendor: data }: { vendor: VendorDetail }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { vendor, categories } = data;

  function handleStatusChange(status: string) {
    startTransition(async () => {
      try {
        await updateVendorStatus(
          vendor.id,
          status as "pending" | "approved" | "suspended" | "blacklisted"
        );
        toast.success("Status updated");
        router.refresh();
      } catch {
        toast.error("Failed to update status");
      }
    });
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/vendors">
            <ArrowLeft className="h-4 w-4 mr-1" /> Vendors
          </Link>
        </Button>
      </div>

      {/* Header card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Store className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold">{vendor.name}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="capitalize">
                    {vendor.vendorType}
                  </Badge>
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[vendor.status]}`}
                  >
                    {vendor.status}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Select
                value={vendor.status}
                onValueChange={handleStatusChange}
                disabled={isPending}
              >
                <SelectTrigger className="w-[160px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="blacklisted">Blacklisted</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Categories */}
          <div className="mt-4 flex flex-wrap gap-2">
            {categories.map((cat) => (
              <Badge key={cat} variant="secondary">
                {VENDOR_CATEGORY_LABEL[cat] || cat}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contact */}
        <Card>
          <CardHeader><CardTitle className="text-sm">Contact Information</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            {vendor.contactPerson && (
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span>{vendor.contactPerson}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{vendor.phone}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{vendor.email}</span>
            </div>
            {vendor.address && (
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <span>
                  {vendor.address}
                  {vendor.city ? `, ${vendor.city}` : ""}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tax & Bank */}
        <Card>
          <CardHeader><CardTitle className="text-sm">Tax & Banking</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">GSTIN</span>
              <span className="font-mono">{vendor.gstin || "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">PAN</span>
              <span className="font-mono">{vendor.pan || "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Bank</span>
              <span>{vendor.bankName || "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Account</span>
              <span className="font-mono">{vendor.accountNumber || "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">IFSC</span>
              <span className="font-mono">{vendor.ifscCode || "—"}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {vendor.notes && (
        <Card>
          <CardHeader><CardTitle className="text-sm">Notes</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm">{vendor.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
