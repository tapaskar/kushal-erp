"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Plus } from "lucide-react";
import { addCleaningZone, verifyCleaningLog } from "@/services/housekeeping-admin.service";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-gray-100 text-gray-800",
  in_progress: "bg-yellow-100 text-yellow-800",
  completed: "bg-green-100 text-green-800",
  verified: "bg-blue-100 text-blue-800",
  issue_reported: "bg-red-100 text-red-800",
};

interface CleaningScheduleRow {
  id: string;
  zoneName: string;
  zoneType: string;
  zoneFloor: number | null;
  staffName: string | null;
  status: string;
  scheduledDate: string;
  startedAt: string | null;
  completedAt: string | null;
  rating: number | null;
}

export function CleaningClient({
  zones,
  schedule,
  stats,
}: {
  zones: any[];
  schedule: CleaningScheduleRow[];
  stats: any;
}) {
  const [list, setList] = useState(schedule);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [verifying, setVerifying] = useState<string | null>(null);

  const handleAddZone = async (formData: FormData) => {
    const data = {
      name: formData.get("name") as string,
      zoneType: formData.get("zoneType") as string,
      floor: formData.get("floor") ? Number(formData.get("floor")) : undefined,
      frequency: formData.get("frequency") as any,
      description: formData.get("description") as string,
    };
    await addCleaningZone(data);
    setDialogOpen(false);
    window.location.reload();
  };

  const handleVerify = async (logId: string) => {
    setVerifying(logId);
    try {
      await verifyCleaningLog(logId);
      setList(list.map((l) => (l.id === logId ? { ...l, status: "verified" } : l)));
    } catch {
      // ignore
    } finally {
      setVerifying(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/staff">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Staff
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Cleaning & Housekeeping</h1>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" /> Add Zone</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Cleaning Zone</DialogTitle>
            </DialogHeader>
            <form action={handleAddZone} className="space-y-4">
              <div>
                <Label>Name</Label>
                <Input name="name" required placeholder="e.g., Block A Lobby" />
              </div>
              <div>
                <Label>Zone Type</Label>
                <select name="zoneType" className="w-full border rounded-md px-3 py-2 text-sm">
                  <option value="common_area">Common Area</option>
                  <option value="staircase">Staircase</option>
                  <option value="lobby">Lobby</option>
                  <option value="parking">Parking</option>
                  <option value="garden">Garden</option>
                  <option value="terrace">Terrace</option>
                  <option value="gym">Gym</option>
                  <option value="pool">Pool</option>
                </select>
              </div>
              <div>
                <Label>Floor</Label>
                <Input name="floor" type="number" placeholder="Optional" />
              </div>
              <div>
                <Label>Frequency</Label>
                <select name="frequency" className="w-full border rounded-md px-3 py-2 text-sm">
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="biweekly">Biweekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
              <div>
                <Label>Description</Label>
                <Input name="description" placeholder="Optional" />
              </div>
              <Button type="submit" className="w-full">Add Zone</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.totalZones}</div>
            <p className="text-sm text-muted-foreground">Total Zones</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              {stats.today?.completionRate || 0}%
            </div>
            <p className="text-sm text-muted-foreground">Today's Completion</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-600">
              {stats.avgRating || "N/A"}
            </div>
            <p className="text-sm text-muted-foreground">Avg Rating</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-orange-600">
              {stats.pendingSupplyRequests}
            </div>
            <p className="text-sm text-muted-foreground">Pending Supplies</p>
          </CardContent>
        </Card>
      </div>

      {/* Today's Schedule */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Zone</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Floor</TableHead>
                <TableHead>Staff</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Started</TableHead>
                <TableHead>Completed</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.zoneName}</TableCell>
                  <TableCell className="capitalize">{item.zoneType.replace("_", " ")}</TableCell>
                  <TableCell>{item.zoneFloor ?? "-"}</TableCell>
                  <TableCell>{item.staffName || "-"}</TableCell>
                  <TableCell>
                    <Badge className={STATUS_COLORS[item.status] || ""}>
                      {item.status.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {item.startedAt ? new Date(item.startedAt).toLocaleTimeString() : "-"}
                  </TableCell>
                  <TableCell>
                    {item.completedAt ? new Date(item.completedAt).toLocaleTimeString() : "-"}
                  </TableCell>
                  <TableCell>{item.rating ? `${item.rating}/5` : "-"}</TableCell>
                  <TableCell>
                    {item.status === "completed" && (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={verifying === item.id}
                        onClick={() => handleVerify(item.id)}
                      >
                        Verify
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {list.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    No cleaning scheduled for today
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
