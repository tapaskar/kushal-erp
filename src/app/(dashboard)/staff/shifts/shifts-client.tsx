"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Badge } from "@/components/ui/badge";
import { Plus, ArrowLeft, Clock } from "lucide-react";
import { scheduleShift, getShiftsByDate } from "@/services/staff-admin.service";
import { SHIFT_STATUS_COLORS } from "@/lib/constants";

interface ShiftRow {
  id: string;
  staffId: string;
  staffName: string;
  date: string;
  scheduledStart: string;
  scheduledEnd: string;
  actualStart: string | null;
  actualEnd: string | null;
  status: string;
}

interface StaffRow {
  id: string;
  employeeCode: string;
  name: string;
  phone: string;
  role: string;
  department: string | null;
  contractorName: string | null;
  isActive: boolean;
}

export function ShiftsClient({
  shifts: initialShifts,
  staffList,
  today,
}: {
  shifts: ShiftRow[];
  staffList: StaffRow[];
  today: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(today);
  const [shifts, setShifts] = useState(initialShifts);
  const [dateLoading, setDateLoading] = useState(false);

  async function handleDateChange(date: string) {
    setSelectedDate(date);
    setDateLoading(true);
    try {
      const rawShifts = await getShiftsByDate(date);
      setShifts(
        rawShifts.map((r: { shift: { id: string; staffId: string; date: string; scheduledStart: Date; scheduledEnd: Date; actualCheckIn: Date | null; actualCheckOut: Date | null; status: string }; staffName: string }) => ({
          id: r.shift.id,
          staffId: r.shift.staffId,
          staffName: r.staffName,
          date: r.shift.date,
          scheduledStart: r.shift.scheduledStart.toISOString(),
          scheduledEnd: r.shift.scheduledEnd.toISOString(),
          actualStart: r.shift.actualCheckIn?.toISOString() ?? null,
          actualEnd: r.shift.actualCheckOut?.toISOString() ?? null,
          status: r.shift.status,
        }))
      );
    } finally {
      setDateLoading(false);
    }
  }

  function formatTime(dateStr: string | null) {
    if (!dateStr) return "---";
    const d = new Date(dateStr);
    return d.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }

  async function handleSchedule(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);

    const date = fd.get("date") as string;
    const startTime = fd.get("startTime") as string;
    const endTime = fd.get("endTime") as string;

    try {
      await scheduleShift({
        staffId: fd.get("staffId") as string,
        date,
        scheduledStart: new Date(`${date}T${startTime}`),
        scheduledEnd: new Date(`${date}T${endTime}`),
      });
      setOpen(false);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/staff">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Shift Management</h1>
            <p className="text-muted-foreground">
              Schedule and track staff shifts
            </p>
          </div>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Schedule Shift
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Schedule Shift</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSchedule} className="space-y-4">
              <div className="space-y-2">
                <Label>Staff Member</Label>
                <Select name="staffId" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select staff member" />
                  </SelectTrigger>
                  <SelectContent>
                    {staffList
                      .filter((s) => s.isActive)
                      .map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name} ({s.employeeCode})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  name="date"
                  type="date"
                  defaultValue={selectedDate}
                  required
                />
              </div>
              <div className="grid gap-4 grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="startTime">Start Time</Label>
                  <Input
                    id="startTime"
                    name="startTime"
                    type="time"
                    defaultValue="09:00"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endTime">End Time</Label>
                  <Input
                    id="endTime"
                    name="endTime"
                    type="time"
                    defaultValue="18:00"
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Scheduling..." : "Schedule Shift"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Date Picker */}
      <div className="flex items-center gap-3">
        <Label htmlFor="shiftDate" className="text-sm font-medium">
          Date:
        </Label>
        <Input
          id="shiftDate"
          type="date"
          value={selectedDate}
          onChange={(e) => handleDateChange(e.target.value)}
          className="w-[180px]"
        />
        {dateLoading && (
          <span className="text-sm text-muted-foreground">Loading...</span>
        )}
      </div>

      {/* Shifts Table */}
      {shifts.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardHeader className="text-center">
            <CardTitle>No shifts scheduled</CardTitle>
            <CardDescription>
              No shifts found for {selectedDate}
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Staff Name</TableHead>
                <TableHead>Scheduled Start</TableHead>
                <TableHead>Scheduled End</TableHead>
                <TableHead>Actual Start</TableHead>
                <TableHead>Actual End</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shifts.map((shift) => (
                <TableRow key={shift.id}>
                  <TableCell>
                    <Link
                      href={`/staff/${shift.staffId}`}
                      className="font-medium hover:underline"
                    >
                      {shift.staffName}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    <Clock className="inline h-3 w-3 mr-1" />
                    {formatTime(shift.scheduledStart)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatTime(shift.scheduledEnd)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatTime(shift.actualStart)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatTime(shift.actualEnd)}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        SHIFT_STATUS_COLORS[shift.status] || "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {shift.status.replace("_", " ")}
                    </span>
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
