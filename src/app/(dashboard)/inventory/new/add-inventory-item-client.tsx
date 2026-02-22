"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
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
import { createInventoryItem } from "@/services/inventory.service";
import { ASSET_CATEGORIES, ASSET_CONDITIONS } from "@/lib/constants";

export function AddInventoryItemClient({
  societyId,
}: {
  societyId: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefilledBarcode = searchParams.get("barcode") || "";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isConsumable, setIsConsumable] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const fd = new FormData(e.currentTarget);

    try {
      await createInventoryItem({
        societyId,
        name: fd.get("name") as string,
        category: fd.get("category") as "furniture",
        barcode: (fd.get("barcode") as string) || undefined,
        description: (fd.get("description") as string) || undefined,
        purchaseDate: (fd.get("purchaseDate") as string) || undefined,
        purchasePrice: (fd.get("purchasePrice") as string) || undefined,
        vendor: (fd.get("vendor") as string) || undefined,
        warrantyExpiry: (fd.get("warrantyExpiry") as string) || undefined,
        location: (fd.get("location") as string) || undefined,
        condition: (fd.get("condition") as "new") || "new",
        quantity: parseInt(fd.get("quantity") as string) || 1,
        minStockLevel: isConsumable
          ? parseInt(fd.get("minStockLevel") as string) || undefined
          : undefined,
        isConsumable,
      });
      router.push("/inventory");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add item");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Add Asset</h1>
        <p className="text-muted-foreground">
          Register a new asset or consumable in the inventory
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Asset Details</CardTitle>
          <CardDescription>
            Enter the item details. Barcode will be auto-generated if left blank.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Fire Extinguisher 5kg"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Category *</Label>
                <Select name="category" required defaultValue="other">
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {ASSET_CATEGORIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="barcode">Barcode</Label>
                <Input
                  id="barcode"
                  name="barcode"
                  placeholder="Leave blank to auto-generate"
                  defaultValue={prefilledBarcode}
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  name="description"
                  placeholder="Optional description"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="purchaseDate">Purchase Date</Label>
                <Input id="purchaseDate" name="purchaseDate" type="date" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="purchasePrice">Purchase Price (INR)</Label>
                <Input
                  id="purchasePrice"
                  name="purchasePrice"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="vendor">Vendor</Label>
                <Input
                  id="vendor"
                  name="vendor"
                  placeholder="Vendor / Supplier name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="warrantyExpiry">Warranty Expiry</Label>
                <Input
                  id="warrantyExpiry"
                  name="warrantyExpiry"
                  type="date"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  name="location"
                  placeholder="e.g., Clubhouse, Block A Floor 3"
                />
              </div>

              <div className="space-y-2">
                <Label>Condition</Label>
                <Select name="condition" defaultValue="new">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ASSET_CONDITIONS.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  name="quantity"
                  type="number"
                  min="0"
                  defaultValue="1"
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={isConsumable}
                    onChange={(e) => setIsConsumable(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  Consumable Item
                </Label>
                <p className="text-xs text-muted-foreground">
                  Enable for items that are used up (cleaning supplies, etc.)
                </p>
              </div>

              {isConsumable && (
                <div className="space-y-2">
                  <Label htmlFor="minStockLevel">Min Stock Level</Label>
                  <Input
                    id="minStockLevel"
                    name="minStockLevel"
                    type="number"
                    min="0"
                    placeholder="Alert when stock falls below this"
                  />
                </div>
              )}
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex gap-3">
              <Link href="/inventory">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={loading}>
                {loading ? "Adding..." : "Add Asset"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
