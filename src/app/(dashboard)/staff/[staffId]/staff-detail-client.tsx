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
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft,
  Phone,
  Mail,
  Briefcase,
  Shield,
  User,
  MapPin,
  Calendar,
  Clock,
  CheckCircle,
  ClipboardList,
  Sparkles,
} from "lucide-react";
import { editStaff } from "@/services/staff-admin.service";
import { STAFF_ROLES } from "@/lib/constants";

interface StaffData {
  id: string;
  employeeCode: string;
  name: string;
  phone: string;
  email: string | null;
  role: string;
  department: string | null;
  photoUrl: string | null;
  aadhaarLast4: string | null;
  emergencyContact: string | null;
  contractorName: string | null;
  monthlySalary: string | null;
  employedSince: string | null;
  isActive: boolean;
  createdAt: Date | string;
}

interface Activities {
  shiftHistory: {
    id: string;
    date: string;
    scheduledStart: Date | string;
    scheduledEnd: Date | string;
    actualCheckIn: Date | string | null;
    actualCheckOut: Date | string | null;
    status: string;
  }[];
  tasks: {
    id: string;
    taskType: string;
    title: string;
    status: string;
    priority: string;
    location: string | null;
    dueBy: Date | string | null;
    startedAt: Date | string | null;
    completedAt: Date | string | null;
    createdAt: Date | string;
  }[];
  cleaningLogs: {
    id: string;
    zoneName: string;
    zoneType: string;
    zoneFloor: number | null;
    scheduledDate: string;
    status: string;
    startedAt: Date | string | null;
    completedAt: Date | string | null;
    rating: number | null;
    notes: string | null;
  }[];
  patrols: {
    id: string;
    routeName: string;
    status: string;
    startedAt: Date | string | null;
    completedAt: Date | string | null;
    totalCheckpoints: number;
    visitedCheckpoints: number;
    createdAt: Date | string;
  }[];
  latestLocation: {
    latitude: string;
    longitude: string;
    source: string;
    recordedAt: Date | string;
  } | null;
  summary: {
    shifts: number;
    tasks: { total: number; completed: number };
    cleaning: { total: number; completed: number };
    patrols: { total: number; completed: number };
  };
}

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  scheduled: "bg-gray-100 text-gray-800",
  checked_in: "bg-green-100 text-green-800",
  checked_out: "bg-blue-100 text-blue-800",
  missed: "bg-red-100 text-red-800",
  cancelled: "bg-gray-100 text-gray-600",
  in_progress: "bg-purple-100 text-purple-800",
  completed: "bg-green-100 text-green-800",
  verified: "bg-emerald-100 text-emerald-800",
  accepted: "bg-blue-100 text-blue-800",
  partial: "bg-orange-100 text-orange-800",
};

function StatusBadge({ status }: { status: string }) {
  const cls = STATUS_COLORS[status] || "bg-gray-100 text-gray-800";
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${cls}`}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
}

function formatDate(d: Date | string | null) {
  if (!d) return "---";
  return new Date(d).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatTime(d: Date | string | null) {
  if (!d) return "---";
  return new Date(d).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDateTime(d: Date | string | null) {
  if (!d) return "---";
  return new Date(d).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function StaffDetailClient({
  staff,
  activities,
}: {
  staff: StaffData;
  activities: Activities;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const roleLabel =
    STAFF_ROLES.find((r) => r.value === staff.role)?.label || staff.role;

  async function handleEdit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);

    try {
      await editStaff(staff.id, {
        name: fd.get("name") as string,
        phone: fd.get("phone") as string,
        email: (fd.get("email") as string) || undefined,
        role: fd.get("role") as "security",
        department: (fd.get("department") as string) || undefined,
        contractorName: (fd.get("contractorName") as string) || undefined,
        emergencyContact: (fd.get("emergencyContact") as string) || undefined,
      });
      setEditing(false);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleActive() {
    const action = staff.isActive ? "deactivate" : "activate";
    if (!confirm(`Are you sure you want to ${action} ${staff.name}?`)) return;
    await editStaff(staff.id, { isActive: !staff.isActive });
    router.refresh();
  }

  const { summary } = activities;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/staff">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{staff.name}</h1>
          <p className="text-muted-foreground">
            {staff.employeeCode} &middot; {roleLabel}
          </p>
        </div>
        <Badge
          variant={staff.isActive ? "default" : "secondary"}
          className="text-sm"
        >
          {staff.isActive ? "Active" : "Inactive"}
        </Badge>
      </div>

      {/* Activity Summary */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Shifts</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.shifts}</div>
            <p className="text-xs text-muted-foreground">Total shifts</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Tasks</CardTitle>
            <ClipboardList className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary.tasks.completed}
              <span className="text-sm font-normal text-muted-foreground">
                /{summary.tasks.total}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Cleaning</CardTitle>
            <Sparkles className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary.cleaning.completed}
              <span className="text-sm font-normal text-muted-foreground">
                /{summary.cleaning.total}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Patrols</CardTitle>
            <CheckCircle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary.patrols.completed}
              <span className="text-sm font-normal text-muted-foreground">
                /{summary.patrols.total}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Profile Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Profile Details</CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditing(!editing)}
            >
              {editing ? "Cancel" : "Edit"}
            </Button>
            <Button
              variant={staff.isActive ? "destructive" : "default"}
              size="sm"
              onClick={handleToggleActive}
            >
              {staff.isActive ? "Deactivate" : "Activate"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {editing ? (
            <form onSubmit={handleEdit} className="space-y-4">
              <div className="grid gap-4 grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    name="name"
                    defaultValue={staff.name}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    defaultValue={staff.phone}
                    required
                  />
                </div>
              </div>
              <div className="grid gap-4 grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    defaultValue={staff.email || ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Select name="role" defaultValue={staff.role}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STAFF_ROLES.map((r) => (
                        <SelectItem key={r.value} value={r.value}>
                          {r.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-4 grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    name="department"
                    defaultValue={staff.department || ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contractorName">Contractor Name</Label>
                  <Input
                    id="contractorName"
                    name="contractorName"
                    defaultValue={staff.contractorName || ""}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergencyContact">Emergency Contact</Label>
                <Input
                  id="emergencyContact"
                  name="emergencyContact"
                  defaultValue={staff.emergencyContact || ""}
                />
              </div>
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{staff.phone}</span>
              </div>
              {staff.email && (
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{staff.email}</span>
                </div>
              )}
              <div className="flex items-center gap-3">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <span>
                  {roleLabel}
                  {staff.department && (
                    <span className="text-muted-foreground">
                      {" "}
                      &middot; {staff.department}
                    </span>
                  )}
                </span>
              </div>
              {staff.contractorName && (
                <div className="flex items-center gap-3">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <span>Contractor: {staff.contractorName}</span>
                </div>
              )}
              {staff.emergencyContact && (
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>Emergency: {staff.emergencyContact}</span>
                </div>
              )}
              {staff.employedSince && (
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Since: {staff.employedSince}</span>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabs with Real Data */}
      <Tabs defaultValue="cleaning">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="cleaning">
            Cleaning ({activities.cleaningLogs.length})
          </TabsTrigger>
          <TabsTrigger value="shifts">
            Shifts ({activities.shiftHistory.length})
          </TabsTrigger>
          <TabsTrigger value="tasks">
            Tasks ({activities.tasks.length})
          </TabsTrigger>
          <TabsTrigger value="patrols">
            Patrols ({activities.patrols.length})
          </TabsTrigger>
          <TabsTrigger value="location">Location</TabsTrigger>
        </TabsList>

        {/* Cleaning Tab */}
        <TabsContent value="cleaning" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Cleaning Logs</CardTitle>
            </CardHeader>
            <CardContent>
              {activities.cleaningLogs.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  No cleaning logs found
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Zone</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Floor</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Started</TableHead>
                      <TableHead>Completed</TableHead>
                      <TableHead>Rating</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activities.cleaningLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-medium">
                          {formatDate(log.scheduledDate)}
                        </TableCell>
                        <TableCell>{log.zoneName}</TableCell>
                        <TableCell className="capitalize text-muted-foreground">
                          {log.zoneType?.replace(/_/g, " ")}
                        </TableCell>
                        <TableCell>
                          {log.zoneFloor != null
                            ? `Floor ${log.zoneFloor}`
                            : "---"}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={log.status} />
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatTime(log.startedAt)}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatTime(log.completedAt)}
                        </TableCell>
                        <TableCell>
                          {log.rating != null ? (
                            <span className="font-medium text-yellow-600">
                              {log.rating}/5
                            </span>
                          ) : (
                            <span className="text-muted-foreground">---</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Shifts Tab */}
        <TabsContent value="shifts" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent Shifts</CardTitle>
            </CardHeader>
            <CardContent>
              {activities.shiftHistory.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  No shift history found
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Scheduled</TableHead>
                      <TableHead>Check In</TableHead>
                      <TableHead>Check Out</TableHead>
                      <TableHead>Hours</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activities.shiftHistory.map((shift) => {
                      const hours =
                        shift.actualCheckIn && shift.actualCheckOut
                          ? (
                              (new Date(shift.actualCheckOut).getTime() -
                                new Date(shift.actualCheckIn).getTime()) /
                              3600000
                            ).toFixed(1)
                          : null;
                      return (
                        <TableRow key={shift.id}>
                          <TableCell className="font-medium">
                            {formatDate(shift.date)}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {formatTime(shift.scheduledStart)} -{" "}
                            {formatTime(shift.scheduledEnd)}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {formatTime(shift.actualCheckIn)}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {formatTime(shift.actualCheckOut)}
                          </TableCell>
                          <TableCell>
                            {hours ? (
                              <span className="font-medium text-green-600">
                                {hours}h
                              </span>
                            ) : (
                              "---"
                            )}
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={shift.status} />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tasks Tab */}
        <TabsContent value="tasks" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Assigned Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              {activities.tasks.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  No tasks found
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Due</TableHead>
                      <TableHead>Completed</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activities.tasks.map((task) => (
                      <TableRow key={task.id}>
                        <TableCell className="capitalize text-muted-foreground text-xs">
                          {task.taskType.replace(/_/g, " ")}
                        </TableCell>
                        <TableCell className="font-medium max-w-[200px] truncate">
                          {task.title}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              task.priority === "urgent"
                                ? "destructive"
                                : task.priority === "high"
                                  ? "default"
                                  : "secondary"
                            }
                            className="text-xs"
                          >
                            {task.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={task.status} />
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm max-w-[150px] truncate">
                          {task.location || "---"}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(task.dueBy)}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDateTime(task.completedAt)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Patrols Tab */}
        <TabsContent value="patrols" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Patrol History</CardTitle>
            </CardHeader>
            <CardContent>
              {activities.patrols.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  No patrol logs found
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Route</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Checkpoints</TableHead>
                      <TableHead>Started</TableHead>
                      <TableHead>Completed</TableHead>
                      <TableHead>Duration</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activities.patrols.map((patrol) => {
                      const durationMin =
                        patrol.startedAt && patrol.completedAt
                          ? Math.round(
                              (new Date(patrol.completedAt).getTime() -
                                new Date(patrol.startedAt).getTime()) /
                                60000
                            )
                          : null;
                      return (
                        <TableRow key={patrol.id}>
                          <TableCell className="font-medium">
                            {formatDate(patrol.createdAt)}
                          </TableCell>
                          <TableCell>{patrol.routeName}</TableCell>
                          <TableCell>
                            <StatusBadge status={patrol.status} />
                          </TableCell>
                          <TableCell>
                            <span className="font-medium">
                              {patrol.visitedCheckpoints}
                            </span>
                            <span className="text-muted-foreground">
                              /{patrol.totalCheckpoints}
                            </span>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {formatTime(patrol.startedAt)}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {formatTime(patrol.completedAt)}
                          </TableCell>
                          <TableCell>
                            {durationMin != null ? (
                              <span className="font-medium">
                                {durationMin} min
                              </span>
                            ) : (
                              "---"
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Location Tab */}
        <TabsContent value="location" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Latest Location</CardTitle>
            </CardHeader>
            <CardContent>
              {activities.latestLocation ? (
                <div className="space-y-3">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="flex items-center gap-3">
                      <MapPin className="h-4 w-4 text-blue-500" />
                      <div>
                        <p className="text-sm font-medium">Coordinates</p>
                        <p className="text-xs text-muted-foreground">
                          {parseFloat(
                            activities.latestLocation.latitude
                          ).toFixed(6)}
                          ,{" "}
                          {parseFloat(
                            activities.latestLocation.longitude
                          ).toFixed(6)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="h-4 w-4 text-green-500" />
                      <div>
                        <p className="text-sm font-medium">Last Updated</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDateTime(
                            activities.latestLocation.recordedAt
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>Source: {activities.latestLocation.source}</span>
                  </div>
                  <div className="mt-4">
                    <Link href="/staff/locations">
                      <Button variant="outline" size="sm">
                        <MapPin className="mr-2 h-4 w-4" />
                        View on Live Map
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
                  <MapPin className="h-4 w-4" />
                  <span>
                    No location data available. Location tracking requires the
                    staff mobile app to be active.
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
