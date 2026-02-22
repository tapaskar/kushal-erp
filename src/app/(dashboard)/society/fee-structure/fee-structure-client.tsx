"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2 } from "lucide-react";
import {
  createChargeHead,
  deleteChargeHead,
} from "@/services/billing.service";
import { formatINR } from "@/lib/utils/currency";

interface ChargeHeadRow {
  chargeHead: {
    id: string;
    name: string;
    code: string;
    calculationType: string;
    rate: string;
    frequency: string;
    isGstApplicable: boolean;
    gstRate: string | null;
  };
  account: { code: string; name: string };
}

interface Account {
  id: string;
  code: string;
  name: string;
}

const CALC_LABELS: Record<string, string> = {
  per_sqft: "Per Sq.Ft.",
  flat_rate: "Flat Rate",
  percentage: "Percentage",
  custom: "Custom",
};

export function FeeStructureClient({
  societyId,
  chargeHeads,
  incomeAccounts,
}: {
  societyId: string;
  chargeHeads: ChargeHeadRow[];
  incomeAccounts: Account[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [gstEnabled, setGstEnabled] = useState(false);

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);

    try {
      await createChargeHead({
        societyId,
        name: fd.get("name") as string,
        code: fd.get("code") as string,
        calculationType: fd.get("calculationType") as "per_sqft" | "flat_rate",
        rate: fd.get("rate") as string,
        incomeAccountId: fd.get("incomeAccountId") as string,
        isGstApplicable: gstEnabled,
        gstRate: gstEnabled ? (fd.get("gstRate") as string) : "0",
      });
      setOpen(false);
      setGstEnabled(false);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Deactivate this charge head?")) return;
    await deleteChargeHead(id);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Fee Structure</h1>
          <p className="text-muted-foreground">
            Configure charges that appear on monthly invoices
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Charge
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add Charge Head</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Charge Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Maintenance Charges"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="code">Code</Label>
                <Input
                  id="code"
                  name="code"
                  placeholder="MAINT"
                  maxLength={20}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Calculation Type</Label>
                <Select name="calculationType" defaultValue="flat_rate">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="flat_rate">Flat Rate (fixed per unit)</SelectItem>
                    <SelectItem value="per_sqft">Per Sq.Ft.</SelectItem>
                    <SelectItem value="percentage">Percentage</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="rate">Rate (in ₹)</Label>
                <Input
                  id="rate"
                  name="rate"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="3000"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Income Account</Label>
                <Select name="incomeAccountId" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select account" />
                  </SelectTrigger>
                  <SelectContent>
                    {incomeAccounts.map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.code} — {a.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  id="gst"
                  checked={gstEnabled}
                  onCheckedChange={setGstEnabled}
                />
                <Label htmlFor="gst">GST Applicable</Label>
              </div>
              {gstEnabled && (
                <div className="space-y-2">
                  <Label htmlFor="gstRate">GST Rate (%)</Label>
                  <Input
                    id="gstRate"
                    name="gstRate"
                    type="number"
                    step="0.01"
                    defaultValue="18"
                    required
                  />
                </div>
              )}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Adding..." : "Add Charge Head"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {chargeHeads.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardHeader className="text-center">
            <CardTitle>No charges configured</CardTitle>
            <CardDescription>
              Add maintenance, sinking fund, water, and other charge heads
              before generating invoices
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Charge</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Rate</TableHead>
                <TableHead>GST</TableHead>
                <TableHead>Account</TableHead>
                <TableHead className="w-20"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {chargeHeads.map((row) => (
                <TableRow key={row.chargeHead.id}>
                  <TableCell className="font-medium">
                    {row.chargeHead.name}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{row.chargeHead.code}</Badge>
                  </TableCell>
                  <TableCell>
                    {CALC_LABELS[row.chargeHead.calculationType] || row.chargeHead.calculationType}
                  </TableCell>
                  <TableCell>
                    {row.chargeHead.calculationType === "per_sqft"
                      ? `${formatINR(row.chargeHead.rate)}/sq.ft.`
                      : formatINR(row.chargeHead.rate)}
                  </TableCell>
                  <TableCell>
                    {row.chargeHead.isGstApplicable
                      ? `${row.chargeHead.gstRate}%`
                      : "—"}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {row.account.code} {row.account.name}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(row.chargeHead.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
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
