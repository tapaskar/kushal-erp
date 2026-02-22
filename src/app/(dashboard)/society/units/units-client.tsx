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
import { Plus, Wand2, Trash2 } from "lucide-react";
import {
  createUnit,
  deleteUnit,
  generateUnits,
} from "@/services/society.service";
import Link from "next/link";

interface Block {
  id: string;
  name: string;
  code: string;
  totalFloors: number;
}

interface UnitRow {
  unit: {
    id: string;
    unitNumber: string;
    unitType: string;
    areaSqft: string | null;
    occupancyStatus: string;
    isBillable: boolean;
  };
  block: { name: string; code: string };
  floor: { floorNumber: number };
}

const STATUS_COLORS: Record<string, string> = {
  owner_occupied: "bg-green-100 text-green-800",
  tenant_occupied: "bg-blue-100 text-blue-800",
  vacant: "bg-gray-100 text-gray-800",
};

export function UnitsClient({
  societyId,
  blocks,
  initialUnits,
}: {
  societyId: string;
  blocks: Block[];
  initialUnits: UnitRow[];
}) {
  const router = useRouter();
  const [addOpen, setAddOpen] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleAddUnit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);

    try {
      // Get first floor of block for simplicity (user can change later)
      await createUnit({
        societyId,
        blockId: fd.get("blockId") as string,
        floorId: fd.get("floorId") as string,
        unitNumber: fd.get("unitNumber") as string,
        unitType: (fd.get("unitType") as string) as "apartment",
        areaSqft: (fd.get("areaSqft") as string) || undefined,
      });
      setAddOpen(false);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function handleBulkGenerate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);

    try {
      const count = await generateUnits({
        societyId,
        blockId: fd.get("blockId") as string,
        prefix: fd.get("prefix") as string,
        unitsPerFloor: Number(fd.get("unitsPerFloor")),
        areaSqft: (fd.get("areaSqft") as string) || undefined,
      });
      alert(`Created ${count} units`);
      setBulkOpen(false);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(unitId: string) {
    if (!confirm("Delete this unit?")) return;
    await deleteUnit(unitId);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Units / Flats</h1>
          <p className="text-muted-foreground">
            {initialUnits.length} units across {blocks.length} blocks
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={bulkOpen} onOpenChange={setBulkOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Wand2 className="mr-2 h-4 w-4" />
                Bulk Generate
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Bulk Generate Units</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleBulkGenerate} className="space-y-4">
                <div className="space-y-2">
                  <Label>Block</Label>
                  <Select name="blockId" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select block" />
                    </SelectTrigger>
                    <SelectContent>
                      {blocks.map((b) => (
                        <SelectItem key={b.id} value={b.id}>
                          {b.name} ({b.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prefix">Unit Prefix</Label>
                  <Input
                    id="prefix"
                    name="prefix"
                    placeholder="A"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Units will be named A101, A102, A201, etc.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unitsPerFloor">Units per Floor</Label>
                  <Input
                    id="unitsPerFloor"
                    name="unitsPerFloor"
                    type="number"
                    min={1}
                    max={50}
                    placeholder="4"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="areaSqft">Area (sq.ft.) per unit</Label>
                  <Input
                    id="areaSqft"
                    name="areaSqft"
                    type="number"
                    placeholder="1050"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Generating..." : "Generate Units"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Unit
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Single Unit</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddUnit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Block</Label>
                  <Select name="blockId" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select block" />
                    </SelectTrigger>
                    <SelectContent>
                      {blocks.map((b) => (
                        <SelectItem key={b.id} value={b.id}>
                          {b.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <input type="hidden" name="floorId" value="" />
                <div className="space-y-2">
                  <Label htmlFor="unitNumber">Unit Number</Label>
                  <Input
                    id="unitNumber"
                    name="unitNumber"
                    placeholder="A-101"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select name="unitType" defaultValue="apartment">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="apartment">Apartment</SelectItem>
                      <SelectItem value="shop">Shop</SelectItem>
                      <SelectItem value="office">Office</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="areaSqft">Area (sq.ft.)</Label>
                  <Input
                    id="areaSqft"
                    name="areaSqft"
                    type="number"
                    placeholder="1050"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Adding..." : "Add Unit"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {initialUnits.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardHeader className="text-center">
            <CardTitle>No units yet</CardTitle>
            <CardDescription>
              Use &quot;Bulk Generate&quot; to quickly create units for all
              floors, or add them individually
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Unit</TableHead>
                <TableHead>Block</TableHead>
                <TableHead>Floor</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Area</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-20"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {initialUnits.map((row) => (
                <TableRow key={row.unit.id}>
                  <TableCell className="font-medium">
                    {row.unit.unitNumber}
                  </TableCell>
                  <TableCell>{row.block.name}</TableCell>
                  <TableCell>
                    {row.floor.floorNumber === 0
                      ? "Ground"
                      : `Floor ${row.floor.floorNumber}`}
                  </TableCell>
                  <TableCell className="capitalize">
                    {row.unit.unitType}
                  </TableCell>
                  <TableCell>
                    {row.unit.areaSqft
                      ? `${row.unit.areaSqft} sq.ft.`
                      : "—"}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                        STATUS_COLORS[row.unit.occupancyStatus] || ""
                      }`}
                    >
                      {row.unit.occupancyStatus.replace("_", " ")}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(row.unit.id)}
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

      <div className="flex justify-between">
        <Link href="/society/blocks">
          <Button variant="outline">Back to Blocks</Button>
        </Link>
        <Link href="/members">
          <Button>Continue to Members</Button>
        </Link>
      </div>
    </div>
  );
}
