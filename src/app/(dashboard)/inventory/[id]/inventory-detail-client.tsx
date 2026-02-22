"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { ArrowLeft, Plus, CheckCircle } from "lucide-react";
import {
  createStockMovement,
  createMaintenanceSchedule,
  completeMaintenanceSchedule,
} from "@/services/inventory.service";
import {
  ASSET_CONDITIONS,
  ASSET_CATEGORIES,
  STOCK_MOVEMENT_REASONS,
  MAINTENANCE_FREQUENCIES,
} from "@/lib/constants";
import { formatINR } from "@/lib/utils/currency";
import { formatDate } from "@/lib/utils/dates";

const Barcode = dynamic(() => import("react-barcode"), { ssr: false });

interface ItemData {
  item: {
    id: string;
    societyId: string;
    barcode: string;
    name: string;
    category: string;
    description: string | null;
    purchaseDate: string | null;
    purchasePrice: string | null;
    vendor: string | null;
    warrantyExpiry: string | null;
    location: string | null;
    condition: string;
    quantity: number;
    minStockLevel: number | null;
    isConsumable: boolean;
    createdAt: Date;
  };
  createdByUser: { name: string } | null;
}

interface MovementRow {
  movement: {
    id: string;
    movementType: string;
    reason: string;
    quantity: number;
    date: string;
    notes: string | null;
    createdAt: Date;
  };
  itemName: string;
  itemBarcode: string;
  performedByUser: { name: string } | null;
}

interface ScheduleRow {
  schedule: {
    id: string;
    maintenanceType: string;
    frequencyDays: number | null;
    scheduledDate: string;
    completedDate: string | null;
    status: string;
    cost: string | null;
    vendor: string | null;
    notes: string | null;
  };
  itemName: string;
  itemBarcode: string;
}

export function InventoryDetailClient({
  societyId,
  data,
  movements,
  maintenanceSchedules,
}: {
  societyId: string;
  data: ItemData;
  movements: MovementRow[];
  maintenanceSchedules: ScheduleRow[];
}) {
  const router = useRouter();
  const { item } = data;

  const [movementOpen, setMovementOpen] = useState(false);
  const [maintenanceOpen, setMaintenanceOpen] = useState(false);
  const [completeOpen, setCompleteOpen] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const conditionMeta = ASSET_CONDITIONS.find((c) => c.value === item.condition);
  const categoryLabel =
    ASSET_CATEGORIES.find((c) => c.value === item.category)?.label ||
    item.category;

  async function handleMovement(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    try {
      await createStockMovement({
        societyId,
        inventoryItemId: item.id,
        movementType: fd.get("movementType") as "stock_in",
        reason: fd.get("reason") as "purchase",
        quantity: parseInt(fd.get("quantity") as string),
        date:
          (fd.get("date") as string) ||
          new Date().toISOString().split("T")[0],
        notes: (fd.get("notes") as string) || undefined,
      });
      setMovementOpen(false);
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleScheduleMaintenance(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    try {
      await createMaintenanceSchedule({
        societyId,
        inventoryItemId: item.id,
        maintenanceType: fd.get("maintenanceType") as string,
        frequencyDays: parseInt(fd.get("frequencyDays") as string) || undefined,
        scheduledDate: fd.get("scheduledDate") as string,
        vendor: (fd.get("vendor") as string) || undefined,
        notes: (fd.get("notes") as string) || undefined,
      });
      setMaintenanceOpen(false);
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleComplete(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!completeOpen) return;
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    try {
      await completeMaintenanceSchedule(completeOpen, {
        completedDate:
          (fd.get("completedDate") as string) ||
          new Date().toISOString().split("T")[0],
        cost: (fd.get("cost") as string) || undefined,
        vendor: (fd.get("vendor") as string) || undefined,
        notes: (fd.get("notes") as string) || undefined,
      });
      setCompleteOpen(null);
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  const [movementType, setMovementType] = useState<"stock_in" | "stock_out">(
    "stock_in"
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/inventory">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{item.name}</h1>
            <Badge variant="secondary">{categoryLabel}</Badge>
            <span
              className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${conditionMeta?.color || "bg-gray-100 text-gray-800"}`}
            >
              {item.condition}
            </span>
          </div>
          <p className="font-mono text-sm text-muted-foreground">
            {item.barcode}
          </p>
        </div>
      </div>

      {/* Item Info + Barcode */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Asset Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs text-muted-foreground">Location</p>
                <p className="font-medium">{item.location || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Quantity</p>
                <p className="font-medium">
                  {item.quantity}
                  {item.isConsumable && item.minStockLevel != null && (
                    <span className="text-xs text-muted-foreground ml-1">
                      (min: {item.minStockLevel})
                    </span>
                  )}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Purchase Date</p>
                <p className="font-medium">{item.purchaseDate || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Purchase Price</p>
                <p className="font-medium">
                  {item.purchasePrice
                    ? formatINR(parseFloat(item.purchasePrice))
                    : "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Vendor</p>
                <p className="font-medium">{item.vendor || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Warranty Expiry</p>
                <p className="font-medium">{item.warrantyExpiry || "—"}</p>
              </div>
              {item.description && (
                <div className="sm:col-span-2">
                  <p className="text-xs text-muted-foreground">Description</p>
                  <p className="font-medium">{item.description}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Barcode</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Barcode
              value={item.barcode}
              width={1.5}
              height={60}
              fontSize={12}
              displayValue={true}
            />
          </CardContent>
        </Card>
      </div>

      {/* Tabs: Movements + Maintenance */}
      <Tabs defaultValue="movements">
        <TabsList>
          <TabsTrigger value="movements">
            Stock Movements ({movements.length})
          </TabsTrigger>
          <TabsTrigger value="maintenance">
            Maintenance ({maintenanceSchedules.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="movements" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={movementOpen} onOpenChange={setMovementOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="mr-2 h-3 w-3" />
                  Record Movement
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Record Stock Movement</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleMovement} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Type *</Label>
                    <Select
                      name="movementType"
                      value={movementType}
                      onValueChange={(v) =>
                        setMovementType(v as "stock_in" | "stock_out")
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="stock_in">Stock In</SelectItem>
                        <SelectItem value="stock_out">Stock Out</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Reason *</Label>
                    <Select name="reason" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select reason" />
                      </SelectTrigger>
                      <SelectContent>
                        {STOCK_MOVEMENT_REASONS[movementType].map((r) => (
                          <SelectItem key={r.value} value={r.value}>
                            {r.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="mvQty">Quantity *</Label>
                      <Input
                        id="mvQty"
                        name="quantity"
                        type="number"
                        min="1"
                        defaultValue="1"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="mvDate">Date *</Label>
                      <Input
                        id="mvDate"
                        name="date"
                        type="date"
                        defaultValue={
                          new Date().toISOString().split("T")[0]
                        }
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mvNotes">Notes</Label>
                    <Input id="mvNotes" name="notes" placeholder="Optional" />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Recording..." : "Record Movement"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {movements.length === 0 ? (
            <Card className="border-dashed">
              <CardHeader className="text-center">
                <CardDescription>No stock movements recorded</CardDescription>
              </CardHeader>
            </Card>
          ) : (
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead>By</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {movements.map((row) => (
                    <TableRow key={row.movement.id}>
                      <TableCell>{row.movement.date}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            row.movement.movementType === "stock_in"
                              ? "default"
                              : "destructive"
                          }
                        >
                          {row.movement.movementType === "stock_in"
                            ? "IN"
                            : "OUT"}
                        </Badge>
                      </TableCell>
                      <TableCell className="capitalize">
                        {row.movement.reason.replace("_", " ")}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {row.movement.movementType === "stock_in" ? "+" : "-"}
                        {row.movement.quantity}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {row.performedByUser?.name || "—"}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs">
                        {row.movement.notes || "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={maintenanceOpen} onOpenChange={setMaintenanceOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="mr-2 h-3 w-3" />
                  Schedule Maintenance
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Schedule Maintenance</DialogTitle>
                </DialogHeader>
                <form
                  onSubmit={handleScheduleMaintenance}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="maintType">Maintenance Type *</Label>
                    <Input
                      id="maintType"
                      name="maintenanceType"
                      placeholder="e.g., Refill, Servicing, Inspection"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="schedDate">Scheduled Date *</Label>
                      <Input
                        id="schedDate"
                        name="scheduledDate"
                        type="date"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Frequency</Label>
                      <Select name="frequencyDays">
                        <SelectTrigger>
                          <SelectValue placeholder="One-time" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">One-time</SelectItem>
                          {MAINTENANCE_FREQUENCIES.map((f) => (
                            <SelectItem
                              key={f.value}
                              value={f.value.toString()}
                            >
                              {f.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maintVendor">Vendor</Label>
                    <Input id="maintVendor" name="vendor" placeholder="Optional" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maintNotes">Notes</Label>
                    <Input id="maintNotes" name="notes" placeholder="Optional" />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Scheduling..." : "Schedule"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {maintenanceSchedules.length === 0 ? (
            <Card className="border-dashed">
              <CardHeader className="text-center">
                <CardDescription>
                  No maintenance schedules configured
                </CardDescription>
              </CardHeader>
            </Card>
          ) : (
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Scheduled</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Cost</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {maintenanceSchedules.map((row) => (
                    <TableRow key={row.schedule.id}>
                      <TableCell className="font-medium">
                        {row.schedule.maintenanceType}
                        {row.schedule.frequencyDays && (
                          <span className="text-xs text-muted-foreground ml-1">
                            (every {row.schedule.frequencyDays}d)
                          </span>
                        )}
                      </TableCell>
                      <TableCell>{row.schedule.scheduledDate}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            row.schedule.status === "completed"
                              ? "default"
                              : row.schedule.status === "overdue"
                                ? "destructive"
                                : "outline"
                          }
                        >
                          {row.schedule.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {row.schedule.cost
                          ? formatINR(parseFloat(row.schedule.cost))
                          : "—"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {row.schedule.vendor || "—"}
                      </TableCell>
                      <TableCell>
                        {row.schedule.status === "scheduled" && (
                          <Dialog
                            open={completeOpen === row.schedule.id}
                            onOpenChange={(open) =>
                              setCompleteOpen(open ? row.schedule.id : null)
                            }
                          >
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <CheckCircle className="mr-1 h-3 w-3" />
                                Complete
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>
                                  Complete Maintenance
                                </DialogTitle>
                              </DialogHeader>
                              <form
                                onSubmit={handleComplete}
                                className="space-y-4"
                              >
                                <div className="space-y-2">
                                  <Label htmlFor="compDate">
                                    Completed Date *
                                  </Label>
                                  <Input
                                    id="compDate"
                                    name="completedDate"
                                    type="date"
                                    defaultValue={
                                      new Date().toISOString().split("T")[0]
                                    }
                                    required
                                  />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="compCost">Cost (INR)</Label>
                                    <Input
                                      id="compCost"
                                      name="cost"
                                      type="number"
                                      step="0.01"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="compVendor">Vendor</Label>
                                    <Input
                                      id="compVendor"
                                      name="vendor"
                                      defaultValue={
                                        row.schedule.vendor || ""
                                      }
                                    />
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="compNotes">Notes</Label>
                                  <Input
                                    id="compNotes"
                                    name="notes"
                                    placeholder="Optional"
                                  />
                                </div>
                                <Button
                                  type="submit"
                                  className="w-full"
                                  disabled={loading}
                                >
                                  {loading
                                    ? "Completing..."
                                    : "Mark Complete"}
                                </Button>
                              </form>
                            </DialogContent>
                          </Dialog>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
