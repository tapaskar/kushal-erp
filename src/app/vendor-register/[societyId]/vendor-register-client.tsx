"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Store, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { registerVendorPublic } from "@/services/vendor.service";
import { VENDOR_CATEGORIES } from "@/lib/constants";

type Society = { id: string; name: string; city: string };

const PRODUCT_CATS = VENDOR_CATEGORIES.filter((c) => c.type === "product");
const SERVICE_CATS = VENDOR_CATEGORIES.filter((c) => c.type === "service");

export function VendorRegisterClient({
  society,
  societyId,
}: {
  society: Society;
  societyId: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [submitted, setSubmitted] = useState(false);
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
        await registerVendorPublic(societyId, {
          name: fd.get("name") as string,
          contactPerson: fd.get("contactPerson") as string || undefined,
          email: fd.get("email") as string,
          phone: fd.get("phone") as string,
          address: fd.get("address") as string || undefined,
          city: fd.get("city") as string || undefined,
          gstin: fd.get("gstin") as string || undefined,
          pan: fd.get("pan") as string || undefined,
          vendorType,
          notes: fd.get("notes") as string || undefined,
          categories: selectedCats as Parameters<typeof registerVendorPublic>[1]["categories"],
        });
        setSubmitted(true);
      } catch (err) {
        toast.error((err as Error).message || "Registration failed");
      }
    });
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-sm border p-8 text-center">
          <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Registration Submitted!
          </h1>
          <p className="text-gray-500">
            Your vendor registration with{" "}
            <strong>{society.name}</strong> has been received. The society team
            will review your details and contact you once approved.
          </p>
          <p className="text-sm text-gray-400 mt-4">
            You will start receiving RFQs via email once approved.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center gap-3 mb-1">
            <Store className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg text-primary">Kushal-RWA</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Vendor Registration</h1>
          <p className="text-gray-500 mt-1">
            Register as a vendor with{" "}
            <strong>{society.name}</strong>, {society.city}. Your registration
            will be reviewed and approved by the society committee.
          </p>
          <div className="mt-3 bg-blue-50 border border-blue-100 rounded-lg px-4 py-2 text-sm text-blue-700">
            Once approved, you&apos;ll receive quote requests via email when the
            society needs your products or services.
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Vendor Type */}
          <Card>
            <CardHeader><CardTitle className="text-base">What do you provide?</CardTitle></CardHeader>
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
                        : "border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    <p className="font-semibold capitalize">{t === "product" ? "Products" : "Services"}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {t === "product"
                        ? "Housekeeping supplies, furniture, machinery, equipment…"
                        : "Plumbing, electrical, civil, pest control, lift maintenance…"}
                    </p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Categories */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Your {vendorType === "product" ? "Product" : "Service"} Categories *
              </CardTitle>
            </CardHeader>
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
                        : "border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
              {selectedCats.length === 0 && (
                <p className="text-xs text-red-500 mt-2">
                  Select at least one category
                </p>
              )}
            </CardContent>
          </Card>

          {/* Business Info */}
          <Card>
            <CardHeader><CardTitle className="text-base">Business Information</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2 space-y-1.5">
                <Label htmlFor="name">Business / Company Name *</Label>
                <Input id="name" name="name" required placeholder="ABC Supplies Pvt Ltd" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="contactPerson">Contact Person Name</Label>
                <Input id="contactPerson" name="contactPerson" placeholder="Rajesh Kumar" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input id="phone" name="phone" required placeholder="+91 98765 43210" />
              </div>
              <div className="sm:col-span-2 space-y-1.5">
                <Label htmlFor="email">Email Address *</Label>
                <Input id="email" name="email" type="email" required placeholder="vendor@example.com" />
                <p className="text-xs text-gray-400">
                  RFQs and communication will be sent to this email
                </p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="city">City</Label>
                <Input id="city" name="city" placeholder="Mumbai" />
              </div>
              <div className="sm:col-span-2 space-y-1.5">
                <Label htmlFor="address">Business Address</Label>
                <Input id="address" name="address" placeholder="Full business address" />
              </div>
            </CardContent>
          </Card>

          {/* Tax (optional) */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Tax Details{" "}
                <span className="text-sm font-normal text-gray-400">(optional)</span>
              </CardTitle>
            </CardHeader>
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

          {/* Additional notes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Anything else?{" "}
                <span className="text-sm font-normal text-gray-400">(optional)</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                name="notes"
                className="w-full border rounded-lg px-3 py-2 text-sm min-h-[80px] resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Years of experience, certifications, past RWA projects, brands you carry…"
              />
            </CardContent>
          </Card>

          <Button
            type="submit"
            disabled={isPending}
            className="w-full py-3 text-base font-semibold"
          >
            {isPending ? "Submitting Registration…" : "Submit Registration"}
          </Button>

          <p className="text-center text-xs text-gray-400">
            Your information is only shared with {society.name} for procurement
            purposes.
          </p>
        </form>
      </div>
    </div>
  );
}
