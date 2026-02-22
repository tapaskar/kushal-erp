"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Plus, Trash2, FileText } from "lucide-react";
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
import { createPurchaseRequest } from "@/services/procurement.service";
import { VENDOR_CATEGORIES, QUANTITY_UNITS } from "@/lib/constants";

type LineItem = {
  id: string;
  itemName: string;
  specification: string;
  quantity: string;
  unit: string;
  estimatedUnitPrice: string;
};

export function NewPRClient({ societyId }: { societyId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [items, setItems] = useState<LineItem[]>([
    { id: crypto.randomUUID(), itemName: "", specification: "", quantity: "", unit: "pcs", estimatedUnitPrice: "" },
  ]);

  function addItem() {
    setItems((prev) => [
      ...prev,
      { id: crypto.randomUUID(), itemName: "", specification: "", quantity: "", unit: "pcs", estimatedUnitPrice: "" },
    ]);
  }

  function removeItem(id: string) {
    if (items.length === 1) return;
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  function updateItem(id: string, field: keyof LineItem, value: string) {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, [field]: value } : i))
    );
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    const invalidItems = items.filter((i) => !i.itemName || !i.quantity);
    if (invalidItems.length > 0) {
      toast.error("Fill in item name and quantity for all rows");
      return;
    }

    startTransition(async () => {
      try {
        await createPurchaseRequest({
          societyId,
          title: fd.get("title") as string,
          description: fd.get("description") as string,
          category: fd.get("category") as Parameters<typeof createPurchaseRequest>[0]["category"],
          priority: fd.get("priority") as "low" | "normal" | "urgent",
          requiredByDate: fd.get("requiredByDate") as string,
          items: items.map((i) => ({
            itemName: i.itemName,
            specification: i.specification || undefined,
            quantity: i.quantity,
            unit: i.unit,
            estimatedUnitPrice: i.estimatedUnitPrice || undefined,
          })),
        });

        toast.success("Purchase request created");
        router.push("/procurement/requests");
      } catch (err) {
        toast.error((err as Error).message || "Failed to create request");
      }
    });
  }

  const minDate = new Date().toISOString().split("T")[0];

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/procurement/requests">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="h-5 w-5" /> New Purchase Request
          </h1>
          <p className="text-sm text-muted-foreground">
            Describe what you need — an RFQ will be sent to matching vendors
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header Details */}
        <Card>
          <CardHeader><CardTitle className="text-base">Request Details</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                name="title"
                required
                placeholder="e.g., Housekeeping Supplies for Q1"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="category">Category *</Label>
              <Select name="category" required>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <p className="text-xs text-muted-foreground px-2 py-1">Products</p>
                  {VENDOR_CATEGORIES.filter((c) => c.type === "product").map((c) => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                  <p className="text-xs text-muted-foreground px-2 py-1 mt-1">Services</p>
                  {VENDOR_CATEGORIES.filter((c) => c.type === "service").map((c) => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="priority">Priority</Label>
              <Select name="priority" defaultValue="normal">
                <SelectTrigger id="priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="requiredByDate">Required By</Label>
              <Input id="requiredByDate" name="requiredByDate" type="date" min={minDate} />
            </div>
            <div className="sm:col-span-2 space-y-1.5">
              <Label htmlFor="description">Description / Justification</Label>
              <textarea
                id="description"
                name="description"
                className="w-full border rounded-md p-2 text-sm min-h-[80px] resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Why is this needed? Any specific requirements..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Line Items */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Items / Services Required</CardTitle>
            <Button type="button" size="sm" variant="outline" onClick={addItem}>
              <Plus className="h-3 w-3 mr-1" /> Add Row
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {items.map((item, idx) => (
              <div
                key={item.id}
                className="border rounded-lg p-3 space-y-3 relative"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground font-medium">
                    Item {idx + 1}
                  </span>
                  {items.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-destructive"
                      onClick={() => removeItem(item.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div className="col-span-2 space-y-1">
                    <Label className="text-xs">Item Name *</Label>
                    <Input
                      value={item.itemName}
                      onChange={(e) => updateItem(item.id, "itemName", e.target.value)}
                      placeholder="e.g., Phenyl 5L"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Qty *</Label>
                    <Input
                      type="number"
                      min="0.01"
                      step="any"
                      value={item.quantity}
                      onChange={(e) => updateItem(item.id, "quantity", e.target.value)}
                      placeholder="10"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Unit</Label>
                    <Select
                      value={item.unit}
                      onValueChange={(v) => updateItem(item.id, "unit", v)}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {QUANTITY_UNITS.map((u) => (
                          <SelectItem key={u} value={u}>{u}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2 space-y-1">
                    <Label className="text-xs">Specification</Label>
                    <Input
                      value={item.specification}
                      onChange={(e) => updateItem(item.id, "specification", e.target.value)}
                      placeholder="Size, brand preference, quality standard..."
                    />
                  </div>
                  <div className="col-span-2 space-y-1">
                    <Label className="text-xs">Est. Unit Price (₹)</Label>
                    <Input
                      type="number"
                      min="0"
                      step="any"
                      value={item.estimatedUnitPrice}
                      onChange={(e) => updateItem(item.id, "estimatedUnitPrice", e.target.value)}
                      placeholder="Optional budget"
                    />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex gap-3 justify-end">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Creating..." : "Create Purchase Request"}
          </Button>
        </div>
      </form>
    </div>
  );
}
