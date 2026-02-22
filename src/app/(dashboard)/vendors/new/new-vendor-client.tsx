"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Store } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Separator } from "@/components/ui/separator";
import { createVendor } from "@/services/vendor.service";
import { VENDOR_CATEGORIES } from "@/lib/constants";

const PRODUCT_CATS = VENDOR_CATEGORIES.filter((c) => c.type === "product");
const SERVICE_CATS = VENDOR_CATEGORIES.filter((c) => c.type === "service");

export function NewVendorClient({ societyId }: { societyId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [vendorType, setVendorType] = useState<"product" | "service">("product");
  const [selectedCats, setSelectedCats] = useState<string[]>([]);

  const categories = vendorType === "product" ? PRODUCT_CATS : SERVICE_CATS;

  function toggleCat(val: string) {
    setSelectedCats((prev) =>
      prev.includes(val) ? prev.filter((c) => c !== val) : [...prev, val]
    );
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    if (selectedCats.length === 0) {
      toast.error("Select at least one category");
      return;
    }

    startTransition(async () => {
      try {
        await createVendor({
          societyId,
          name: fd.get("name") as string,
          contactPerson: fd.get("contactPerson") as string,
          email: fd.get("email") as string,
          phone: fd.get("phone") as string,
          address: fd.get("address") as string,
          city: fd.get("city") as string,
          gstin: fd.get("gstin") as string,
          pan: fd.get("pan") as string,
          bankName: fd.get("bankName") as string,
          accountNumber: fd.get("accountNumber") as string,
          ifscCode: fd.get("ifscCode") as string,
          vendorType,
          notes: fd.get("notes") as string,
          categories: selectedCats as Parameters<typeof createVendor>[0]["categories"],
        });

        toast.success("Vendor registered successfully");
        router.push("/vendors");
      } catch (err) {
        toast.error((err as Error).message || "Failed to create vendor");
      }
    });
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/vendors">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Store className="h-5 w-5" /> Register Vendor
          </h1>
          <p className="text-sm text-muted-foreground">
            New vendors start as &quot;pending&quot; and must be approved before receiving RFQs
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Vendor Type */}
        <Card>
          <CardHeader><CardTitle className="text-base">Vendor Type</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {(["product", "service"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => { setVendorType(t); setSelectedCats([]); }}
                  className={`border-2 rounded-lg p-4 text-left transition-colors ${
                    vendorType === t
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-muted-foreground"
                  }`}
                >
                  <p className="font-semibold capitalize">{t} Vendor</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t === "product"
                      ? "Supplies physical goods — housekeeping, furniture, machinery, etc."
                      : "Provides services — plumbing, electrical, civil, pest control, etc."}
                  </p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Categories */}
        <Card>
          <CardHeader><CardTitle className="text-base">Service/Product Categories</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => toggleCat(cat.value)}
                  className={`border rounded-md px-3 py-2 text-sm text-left transition-colors ${
                    selectedCats.includes(cat.value)
                      ? "border-primary bg-primary/10 text-primary font-medium"
                      : "border-border hover:border-muted-foreground"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
            {selectedCats.length === 0 && (
              <p className="text-xs text-destructive mt-2">
                Select at least one category
              </p>
            )}
          </CardContent>
        </Card>

        {/* Basic Info */}
        <Card>
          <CardHeader><CardTitle className="text-base">Basic Information</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <Label htmlFor="name">Business Name *</Label>
              <Input id="name" name="name" required placeholder="ABC Supplies Pvt Ltd" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="contactPerson">Contact Person</Label>
              <Input id="contactPerson" name="contactPerson" placeholder="Rajesh Kumar" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone *</Label>
              <Input id="phone" name="phone" required placeholder="+91 98765 43210" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email *</Label>
              <Input id="email" name="email" type="email" required placeholder="vendor@example.com" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="city">City</Label>
              <Input id="city" name="city" placeholder="Mumbai" />
            </div>
            <div className="sm:col-span-2 space-y-1.5">
              <Label htmlFor="address">Address</Label>
              <Input id="address" name="address" placeholder="Full address" />
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* Tax & Compliance */}
        <Card>
          <CardHeader><CardTitle className="text-base">Tax & Compliance</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="gstin">GSTIN</Label>
              <Input id="gstin" name="gstin" placeholder="22AAAAA0000A1Z5" maxLength={15} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pan">PAN</Label>
              <Input id="pan" name="pan" placeholder="AAAAA0000A" maxLength={10} />
            </div>
          </CardContent>
        </Card>

        {/* Bank Details */}
        <Card>
          <CardHeader><CardTitle className="text-base">Bank Details</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="bankName">Bank Name</Label>
              <Input id="bankName" name="bankName" placeholder="State Bank of India" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="accountNumber">Account Number</Label>
              <Input id="accountNumber" name="accountNumber" placeholder="1234567890" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ifscCode">IFSC Code</Label>
              <Input id="ifscCode" name="ifscCode" placeholder="SBIN0001234" maxLength={11} />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3 justify-end">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Registering..." : "Register Vendor"}
          </Button>
        </div>
      </form>
    </div>
  );
}
