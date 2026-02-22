"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
import { ArrowLeft } from "lucide-react";

interface MovementRow {
  movement: {
    id: string;
    movementType: string;
    reason: string;
    quantity: number;
    date: string;
    notes: string | null;
  };
  itemName: string;
  itemBarcode: string;
  performedByUser: { name: string } | null;
}

export function MovementsClient({
  movements,
}: {
  societyId: string;
  movements: MovementRow[];
}) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const filtered = movements.filter((row) => {
    const matchesSearch =
      !search ||
      row.itemName.toLowerCase().includes(search.toLowerCase()) ||
      row.itemBarcode.toLowerCase().includes(search.toLowerCase());
    const matchesType =
      typeFilter === "all" || row.movement.movementType === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/inventory">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Stock Movements</h1>
          <p className="text-muted-foreground">
            Audit trail of all inventory movements
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="Search by item name or barcode..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="stock_in">Stock In</SelectItem>
            <SelectItem value="stock_out">Stock Out</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardHeader className="text-center">
            <CardTitle>No movements</CardTitle>
            <CardDescription>
              {movements.length === 0
                ? "No stock movements have been recorded yet"
                : "No movements match your filters"}
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Item</TableHead>
                <TableHead>Barcode</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead>By</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((row) => (
                <TableRow key={row.movement.id}>
                  <TableCell>{row.movement.date}</TableCell>
                  <TableCell className="font-medium">
                    {row.itemName}
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-xs">
                      {row.itemBarcode}
                    </span>
                  </TableCell>
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
                  <TableCell className="text-muted-foreground text-xs max-w-[200px] truncate">
                    {row.movement.notes || "—"}
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
