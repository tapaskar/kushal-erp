"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Package,
  IndianRupee,
  AlertTriangle,
  Wrench,
  Plus,
  ScanBarcode,
  ArrowRight,
} from "lucide-react";
import { ASSET_CATEGORIES, ASSET_CONDITIONS } from "@/lib/constants";
import { formatINR } from "@/lib/utils/currency";

interface InventoryItem {
  item: {
    id: string;
    barcode: string;
    name: string;
    category: string;
    location: string | null;
    condition: string;
    quantity: number;
    purchasePrice: string | null;
    isConsumable: boolean;
    minStockLevel: number | null;
  };
  createdByUser: { name: string } | null;
}

interface Stats {
  totalItems: number;
  totalValue: number;
  lowStockCount: number;
  maintenanceDueCount: number;
}

export function InventoryClient({
  items,
  stats,
  lowStockItems,
  upcomingMaintenance,
}: {
  societyId: string;
  items: InventoryItem[];
  stats: Stats;
  lowStockItems: { id: string; name: string; quantity: number; minStockLevel: number | null }[];
  upcomingMaintenance: { schedule: { scheduledDate: string }; itemName: string }[];
}) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [conditionFilter, setConditionFilter] = useState("all");

  const filtered = items.filter((row) => {
    const matchesSearch =
      !search ||
      row.item.name.toLowerCase().includes(search.toLowerCase()) ||
      row.item.barcode.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || row.item.category === categoryFilter;
    const matchesCondition =
      conditionFilter === "all" || row.item.condition === conditionFilter;
    return matchesSearch && matchesCategory && matchesCondition;
  });

  const conditionColor = (c: string) =>
    ASSET_CONDITIONS.find((ac) => ac.value === c)?.color ||
    "bg-gray-100 text-gray-800";

  const categoryLabel = (c: string) =>
    ASSET_CATEGORIES.find((ac) => ac.value === c)?.label || c;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Inventory</h1>
          <p className="text-muted-foreground">
            Track society assets and consumables
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/inventory/scan">
            <Button variant="outline">
              <ScanBarcode className="mr-2 h-4 w-4" />
              Scan
            </Button>
          </Link>
          <Link href="/inventory/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Asset
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
            <Package className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalItems}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <IndianRupee className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatINR(stats.totalValue)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.lowStockCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Maintenance Due
            </CardTitle>
            <Wrench className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.maintenanceDueCount}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {(lowStockItems.length > 0 || upcomingMaintenance.length > 0) && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Alerts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {lowStockItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between text-sm">
                <span>
                  <AlertTriangle className="inline h-3 w-3 text-red-500 mr-1" />
                  <strong>{item.name}</strong> — stock: {item.quantity} (min: {item.minStockLevel})
                </span>
                <Link href={`/inventory/${item.id}`}>
                  <Button variant="ghost" size="sm">
                    View <ArrowRight className="ml-1 h-3 w-3" />
                  </Button>
                </Link>
              </div>
            ))}
            {upcomingMaintenance.map((m, i) => (
              <div key={i} className="text-sm">
                <Wrench className="inline h-3 w-3 text-orange-500 mr-1" />
                <strong>{m.itemName}</strong> — maintenance due {m.schedule.scheduledDate}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="Search by name or barcode..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {ASSET_CATEGORIES.map((c) => (
              <SelectItem key={c.value} value={c.value}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={conditionFilter} onValueChange={setConditionFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Condition" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Conditions</SelectItem>
            {ASSET_CONDITIONS.map((c) => (
              <SelectItem key={c.value} value={c.value}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Link href="/inventory/movements">
          <Button variant="outline" size="default">
            Movement History
          </Button>
        </Link>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardHeader className="text-center">
            <CardTitle>No inventory items</CardTitle>
            <CardDescription>
              {items.length === 0
                ? "Add your first asset to get started"
                : "No items match your filters"}
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Barcode</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Condition</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="text-right">Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((row) => (
                <TableRow key={row.item.id}>
                  <TableCell>
                    <Link
                      href={`/inventory/${row.item.id}`}
                      className="font-mono text-xs text-primary hover:underline"
                    >
                      {row.item.barcode}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/inventory/${row.item.id}`}
                      className="font-medium hover:underline"
                    >
                      {row.item.name}
                    </Link>
                    {row.item.isConsumable && (
                      <Badge variant="outline" className="ml-2 text-xs">
                        Consumable
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {categoryLabel(row.item.category)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {row.item.location || "—"}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${conditionColor(
                        row.item.condition
                      )}`}
                    >
                      {row.item.condition}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">{row.item.quantity}</TableCell>
                  <TableCell className="text-right">
                    {row.item.purchasePrice
                      ? formatINR(parseFloat(row.item.purchasePrice))
                      : "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
