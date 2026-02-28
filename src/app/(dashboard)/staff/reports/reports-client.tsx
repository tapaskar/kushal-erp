"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Download, BarChart3 } from "lucide-react";
import { SHIFT_STATUS_COLORS, PATROL_STATUS_COLORS } from "@/lib/constants";
import { exportToCSV, formatDate, formatTime, formatDateTime } from "@/lib/export-utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getAttendanceReportData,
  getPatrolCompletionReportData,
  getAreaPresenceReportData,
  getLocationReportData,
} from "@/services/staff-admin.service";

interface AttendanceRow {
  staffName: string;
  staffRole: string;
  employeeCode: string;
  status: string;
  scheduledStart: string;
  scheduledEnd: string;
  actualCheckIn: string | null;
  actualCheckOut: string | null;
}

interface StaffOption {
  id: string;
  name: string;
  role: string;
}

type TabId = "overview" | "attendance" | "patrol" | "presence" | "location";

export function ReportsClient({
  staffStats,
  securityStats,
  cleaningStats,
  attendance,
  staffList,
}: {
  staffStats: any;
  securityStats: any;
  cleaningStats: any;
  attendance: AttendanceRow[];
  staffList?: StaffOption[];
}) {
  const [activeTab, setActiveTab] = useState<TabId>("overview");

  const tabs: { id: TabId; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "attendance", label: "Attendance Report" },
    { id: "patrol", label: "Patrol Report" },
    { id: "presence", label: "Area Presence" },
    { id: "location", label: "Location Reports" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/staff">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Staff
          </Button>
        </Link>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BarChart3 className="h-6 w-6" />
          Staff Reports
        </h1>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 border-b">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <OverviewTab
          staffStats={staffStats}
          securityStats={securityStats}
          cleaningStats={cleaningStats}
          attendance={attendance}
        />
      )}
      {activeTab === "attendance" && <AttendanceReportTab />}
      {activeTab === "patrol" && <PatrolReportTab />}
      {activeTab === "presence" && <AreaPresenceTab />}
      {activeTab === "location" && (
        <LocationReportTab staffList={staffList || []} />
      )}
    </div>
  );
}

// ── Overview Tab (existing content) ──

function OverviewTab({
  staffStats,
  securityStats,
  cleaningStats,
  attendance,
}: {
  staffStats: any;
  securityStats: any;
  cleaningStats: any;
  attendance: AttendanceRow[];
}) {
  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{staffStats.totalStaff}</div>
            <p className="text-sm text-muted-foreground">Total Active Staff</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              {staffStats.shiftsToday?.checkedIn || 0}
            </div>
            <p className="text-sm text-muted-foreground">Checked In Today</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-600">
              {staffStats.tasks?.pending || 0}
            </div>
            <p className="text-sm text-muted-foreground">Pending Tasks</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">
              {staffStats.tasks?.completedToday || 0}
            </div>
            <p className="text-sm text-muted-foreground">Tasks Completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Security Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Security Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-xl font-bold">{securityStats.visitors?.todayTotal || 0}</div>
              <p className="text-xs text-muted-foreground">Visitors Today</p>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-green-600">{securityStats.visitors?.activeVisitors || 0}</div>
              <p className="text-xs text-muted-foreground">Active Visitors</p>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-orange-600">{securityStats.incidents?.openIncidents || 0}</div>
              <p className="text-xs text-muted-foreground">Open Incidents</p>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-red-600">{securityStats.sos?.activeAlerts || 0}</div>
              <p className="text-xs text-muted-foreground">SOS Alerts</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cleaning Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Housekeeping Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-xl font-bold">{cleaningStats.totalZones || 0}</div>
              <p className="text-xs text-muted-foreground">Total Zones</p>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-green-600">{cleaningStats.today?.completionRate || 0}%</div>
              <p className="text-xs text-muted-foreground">Completion Rate</p>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-yellow-600">{cleaningStats.avgRating || "N/A"}</div>
              <p className="text-xs text-muted-foreground">Avg Rating</p>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-orange-600">{cleaningStats.pendingSupplyRequests || 0}</div>
              <p className="text-xs text-muted-foreground">Pending Supplies</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Today's Attendance */}
      <Card>
        <CardHeader>
          <CardTitle>Today&apos;s Attendance</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Scheduled</TableHead>
                <TableHead>Actual In</TableHead>
                <TableHead>Actual Out</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attendance.map((row, idx) => (
                <TableRow key={idx}>
                  <TableCell className="font-medium">{row.staffName}</TableCell>
                  <TableCell>{row.employeeCode}</TableCell>
                  <TableCell className="capitalize">{row.staffRole}</TableCell>
                  <TableCell>
                    {formatTime(row.scheduledStart)} - {formatTime(row.scheduledEnd)}
                  </TableCell>
                  <TableCell>
                    {row.actualCheckIn ? formatTime(row.actualCheckIn) : "-"}
                  </TableCell>
                  <TableCell>
                    {row.actualCheckOut ? formatTime(row.actualCheckOut) : "-"}
                  </TableCell>
                  <TableCell>
                    <Badge className={SHIFT_STATUS_COLORS[row.status] || ""}>
                      {row.status.replace("_", " ")}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {attendance.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No shifts scheduled for today
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

// ── Attendance Report Tab ──

function AttendanceReportTab() {
  const [fromDate, setFromDate] = useState(
    new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0]
  );
  const [toDate, setToDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  async function loadReport() {
    setLoading(true);
    try {
      const result = await getAttendanceReportData(fromDate, toDate);
      setData(result);
    } catch (error) {
      console.error("Failed to load attendance report:", error);
    } finally {
      setLoading(false);
    }
  }

  function handleExport() {
    exportToCSV(
      data.map((r) => ({
        staffName: r.staffName,
        employeeCode: r.employeeCode,
        role: r.staffRole,
        date: r.date,
        scheduledStart: r.scheduledStart ? formatTime(r.scheduledStart) : "",
        scheduledEnd: r.scheduledEnd ? formatTime(r.scheduledEnd) : "",
        actualCheckIn: r.actualCheckIn ? formatTime(r.actualCheckIn) : "",
        actualCheckOut: r.actualCheckOut ? formatTime(r.actualCheckOut) : "",
        hoursWorked: r.hoursWorked || "",
        status: r.status,
      })),
      `attendance-report-${fromDate}-to-${toDate}`,
      [
        { key: "staffName", label: "Staff Name" },
        { key: "employeeCode", label: "Employee Code" },
        { key: "role", label: "Role" },
        { key: "date", label: "Date" },
        { key: "scheduledStart", label: "Scheduled In" },
        { key: "scheduledEnd", label: "Scheduled Out" },
        { key: "actualCheckIn", label: "Actual In" },
        { key: "actualCheckOut", label: "Actual Out" },
        { key: "hoursWorked", label: "Hours Worked" },
        { key: "status", label: "Status" },
      ]
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-1">
              <Label className="text-xs">From Date</Label>
              <Input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-[180px]"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">To Date</Label>
              <Input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-[180px]"
              />
            </div>
            <Button onClick={loadReport} disabled={loading}>
              {loading ? "Loading..." : "Generate Report"}
            </Button>
            {data.length > 0 && (
              <Button variant="outline" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {data.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Attendance Report ({formatDate(fromDate)} to {formatDate(toDate)})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Staff</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Scheduled In/Out</TableHead>
                  <TableHead>Actual In</TableHead>
                  <TableHead>Actual Out</TableHead>
                  <TableHead className="text-right">Hours</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((row, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-medium">{row.staffName}</TableCell>
                    <TableCell className="text-xs">{row.employeeCode}</TableCell>
                    <TableCell className="capitalize text-sm">{row.staffRole}</TableCell>
                    <TableCell className="text-sm">{row.date}</TableCell>
                    <TableCell className="text-sm">
                      {formatTime(row.scheduledStart)} - {formatTime(row.scheduledEnd)}
                    </TableCell>
                    <TableCell className="text-sm">
                      {row.actualCheckIn ? formatTime(row.actualCheckIn) : "-"}
                    </TableCell>
                    <TableCell className="text-sm">
                      {row.actualCheckOut ? formatTime(row.actualCheckOut) : "-"}
                    </TableCell>
                    <TableCell className="text-right text-sm">
                      {row.hoursWorked ? `${row.hoursWorked}h` : "-"}
                    </TableCell>
                    <TableCell>
                      <Badge className={SHIFT_STATUS_COLORS[row.status] || ""}>
                        {row.status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {data.length === 0 && !loading && (
        <Card className="border-dashed border-2">
          <CardContent className="py-12 text-center text-muted-foreground">
            Select a date range and click &quot;Generate Report&quot; to view attendance data
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ── Patrol Report Tab ──

function PatrolReportTab() {
  const [fromDate, setFromDate] = useState(
    new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0]
  );
  const [toDate, setToDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  async function loadReport() {
    setLoading(true);
    try {
      const result = await getPatrolCompletionReportData(fromDate, toDate);
      setData(result);
    } catch (error) {
      console.error("Failed to load patrol report:", error);
    } finally {
      setLoading(false);
    }
  }

  function handleExport() {
    exportToCSV(
      data.map((r) => ({
        date: r.startedAt ? formatDate(r.startedAt) : formatDate(r.completedAt),
        route: r.routeName,
        staff: r.staffName,
        role: r.staffRole,
        status: r.status,
        checkpoints: `${r.visitedCheckpoints}/${r.totalCheckpoints}`,
        completionPercent: `${r.completionPercent}%`,
        timeTaken: r.timeTakenMin ? `${r.timeTakenMin} min` : "",
      })),
      `patrol-report-${fromDate}-to-${toDate}`,
      [
        { key: "date", label: "Date" },
        { key: "route", label: "Route" },
        { key: "staff", label: "Staff" },
        { key: "role", label: "Role" },
        { key: "status", label: "Status" },
        { key: "checkpoints", label: "Checkpoints" },
        { key: "completionPercent", label: "Completion %" },
        { key: "timeTaken", label: "Time Taken" },
      ]
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-1">
              <Label className="text-xs">From Date</Label>
              <Input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-[180px]"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">To Date</Label>
              <Input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-[180px]"
              />
            </div>
            <Button onClick={loadReport} disabled={loading}>
              {loading ? "Loading..." : "Generate Report"}
            </Button>
            {data.length > 0 && (
              <Button variant="outline" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {data.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Patrol Completion Report ({formatDate(fromDate)} to {formatDate(toDate)})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Route</TableHead>
                  <TableHead>Staff</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Checkpoints</TableHead>
                  <TableHead className="text-right">Completion</TableHead>
                  <TableHead className="text-right">Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((row, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="text-sm">
                      {formatDate(row.startedAt || row.completedAt)}
                    </TableCell>
                    <TableCell className="font-medium">{row.routeName}</TableCell>
                    <TableCell className="text-sm">{row.staffName}</TableCell>
                    <TableCell>
                      <Badge className={PATROL_STATUS_COLORS[row.status] || ""}>
                        {row.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-sm">
                      {row.visitedCheckpoints}/{row.totalCheckpoints}
                    </TableCell>
                    <TableCell className="text-right text-sm font-medium">
                      {row.completionPercent}%
                    </TableCell>
                    <TableCell className="text-right text-sm">
                      {row.timeTakenMin ? `${row.timeTakenMin} min` : "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {data.length === 0 && !loading && (
        <Card className="border-dashed border-2">
          <CardContent className="py-12 text-center text-muted-foreground">
            Select a date range and click &quot;Generate Report&quot; to view patrol data
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ── Area Presence Tab ──

function AreaPresenceTab() {
  const [fromDate, setFromDate] = useState(
    new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0]
  );
  const [toDate, setToDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  async function loadReport() {
    setLoading(true);
    try {
      const result = await getAreaPresenceReportData(fromDate, toDate);
      setData(result);
    } catch (error) {
      console.error("Failed to load area presence report:", error);
    } finally {
      setLoading(false);
    }
  }

  function handleExport() {
    exportToCSV(
      data.map((r) => ({
        dateTime: formatDateTime(r.recordedAt),
        staff: r.staffName,
        role: r.staffRole,
        area: r.beaconLabel,
        location: r.beaconLocation || "",
        floor: r.beaconFloor !== null ? r.beaconFloor : "",
        eventType: r.eventType,
      })),
      `area-presence-${fromDate}-to-${toDate}`,
      [
        { key: "dateTime", label: "Date/Time" },
        { key: "staff", label: "Staff" },
        { key: "role", label: "Role" },
        { key: "area", label: "Area" },
        { key: "location", label: "Location" },
        { key: "floor", label: "Floor" },
        { key: "eventType", label: "Event Type" },
      ]
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-1">
              <Label className="text-xs">From Date</Label>
              <Input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-[180px]"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">To Date</Label>
              <Input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-[180px]"
              />
            </div>
            <Button onClick={loadReport} disabled={loading}>
              {loading ? "Loading..." : "Generate Report"}
            </Button>
            {data.length > 0 && (
              <Button variant="outline" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {data.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Area Presence Report ({formatDate(fromDate)} to {formatDate(toDate)})
              <span className="text-sm font-normal text-muted-foreground ml-2">
                ({data.length} events)
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date/Time</TableHead>
                  <TableHead>Staff</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Area</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Floor</TableHead>
                  <TableHead>Event</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((row, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="text-sm">
                      {formatDateTime(row.recordedAt)}
                    </TableCell>
                    <TableCell className="font-medium">{row.staffName}</TableCell>
                    <TableCell className="capitalize text-sm">{row.staffRole}</TableCell>
                    <TableCell className="font-medium">{row.beaconLabel}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {row.beaconLocation || "-"}
                    </TableCell>
                    <TableCell className="text-sm">
                      {row.beaconFloor !== null ? row.beaconFloor : "-"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {row.eventType.replace("_", " ")}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {data.length === 0 && !loading && (
        <Card className="border-dashed border-2">
          <CardContent className="py-12 text-center text-muted-foreground">
            Select a date range and click &quot;Generate Report&quot; to view QR scan and beacon presence data
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ── Location Reports Tab ──

function LocationReportTab({ staffList }: { staffList: StaffOption[] }) {
  const [selectedStaff, setSelectedStaff] = useState<string>("");
  const [fromDate, setFromDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [toDate, setToDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  async function loadReport() {
    if (!selectedStaff) return;
    setLoading(true);
    try {
      const result = await getLocationReportData(selectedStaff, fromDate, toDate);
      setData(result);
    } catch (error) {
      console.error("Failed to load location report:", error);
    } finally {
      setLoading(false);
    }
  }

  // Compute stats from data
  const totalPoints = data.length;
  const movingPoints = data.filter((d: any) => d.isMoving).length;
  const gpsPoints = data.filter((d: any) => d.source === "gps").length;

  // Compute total distance
  let totalDistanceM = 0;
  for (let i = 1; i < data.length; i++) {
    const lat1 = parseFloat(data[i - 1].latitude);
    const lng1 = parseFloat(data[i - 1].longitude);
    const lat2 = parseFloat(data[i].latitude);
    const lng2 = parseFloat(data[i].longitude);
    if (!isNaN(lat1) && !isNaN(lng1) && !isNaN(lat2) && !isNaN(lng2)) {
      const R = 6371000;
      const toRad = (d: number) => (d * Math.PI) / 180;
      const dLat = toRad(lat2 - lat1);
      const dLng = toRad(lng2 - lng1);
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
      totalDistanceM += R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }
  }

  // Tracking duration
  let trackingDurationMin = 0;
  if (data.length >= 2) {
    const first = new Date(data[0].recordedAt).getTime();
    const last = new Date(data[data.length - 1].recordedAt).getTime();
    trackingDurationMin = Math.round((last - first) / 60000);
  }

  const staffName = staffList.find((s) => s.id === selectedStaff)?.name || "";

  function handleExport() {
    exportToCSV(
      data.map((r: any) => ({
        timestamp: formatDateTime(r.recordedAt),
        latitude: r.latitude,
        longitude: r.longitude,
        accuracy: r.accuracy || "",
        speed: r.speed || "",
        source: r.source,
        isMoving: r.isMoving ? "Yes" : "No",
        battery: r.batteryLevel || "",
      })),
      `location-report-${staffName}-${fromDate}-to-${toDate}`,
      [
        { key: "timestamp", label: "Timestamp" },
        { key: "latitude", label: "Latitude" },
        { key: "longitude", label: "Longitude" },
        { key: "accuracy", label: "Accuracy (m)" },
        { key: "speed", label: "Speed (m/s)" },
        { key: "source", label: "Source" },
        { key: "isMoving", label: "Moving" },
        { key: "battery", label: "Battery %" },
      ]
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-1">
              <Label className="text-xs">Staff Member</Label>
              <Select value={selectedStaff} onValueChange={setSelectedStaff}>
                <SelectTrigger className="w-[220px]">
                  <SelectValue placeholder="Select Staff" />
                </SelectTrigger>
                <SelectContent>
                  {staffList.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name} ({s.role})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">From Date</Label>
              <Input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-[180px]"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">To Date</Label>
              <Input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-[180px]"
              />
            </div>
            <Button onClick={loadReport} disabled={loading || !selectedStaff}>
              {loading ? "Loading..." : "Generate Report"}
            </Button>
            {data.length > 0 && (
              <Button variant="outline" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      {data.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">
                {totalDistanceM > 1000
                  ? `${(totalDistanceM / 1000).toFixed(1)} km`
                  : `${Math.round(totalDistanceM)} m`}
              </div>
              <p className="text-sm text-muted-foreground">Total Distance</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">
                {trackingDurationMin > 60
                  ? `${(trackingDurationMin / 60).toFixed(1)}h`
                  : `${trackingDurationMin} min`}
              </div>
              <p className="text-sm text-muted-foreground">Tracking Duration</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-blue-600">
                {totalPoints}
              </div>
              <p className="text-sm text-muted-foreground">Location Points</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-green-600">
                {movingPoints}
              </div>
              <p className="text-sm text-muted-foreground">Moving Points</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Data Table */}
      {data.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Location Report for {staffName} ({formatDate(fromDate)} to{" "}
              {formatDate(toDate)})
              <span className="text-sm font-normal text-muted-foreground ml-2">
                ({data.length} points)
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Latitude</TableHead>
                  <TableHead>Longitude</TableHead>
                  <TableHead>Accuracy</TableHead>
                  <TableHead>Speed</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Moving</TableHead>
                  <TableHead>Battery</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.slice(0, 100).map((row: any, idx: number) => (
                  <TableRow key={idx}>
                    <TableCell className="text-sm">
                      {formatDateTime(row.recordedAt)}
                    </TableCell>
                    <TableCell className="text-sm font-mono">
                      {parseFloat(row.latitude).toFixed(6)}
                    </TableCell>
                    <TableCell className="text-sm font-mono">
                      {parseFloat(row.longitude).toFixed(6)}
                    </TableCell>
                    <TableCell className="text-sm">
                      {row.accuracy
                        ? `${parseFloat(row.accuracy).toFixed(0)}m`
                        : "-"}
                    </TableCell>
                    <TableCell className="text-sm">
                      {row.speed
                        ? `${parseFloat(row.speed).toFixed(1)} m/s`
                        : "-"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {row.source}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {row.isMoving ? (
                        <span className="text-green-600 font-medium">Yes</span>
                      ) : (
                        <span className="text-gray-400">No</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">
                      {row.batteryLevel
                        ? `${parseFloat(row.batteryLevel).toFixed(0)}%`
                        : "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {data.length > 100 && (
              <div className="py-3 px-4 text-sm text-muted-foreground border-t">
                Showing first 100 of {data.length} points. Export CSV for full
                data.
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {data.length === 0 && !loading && (
        <Card className="border-dashed border-2">
          <CardContent className="py-12 text-center text-muted-foreground">
            Select a staff member, date range, and click &quot;Generate
            Report&quot; to view location tracking data
          </CardContent>
        </Card>
      )}
    </div>
  );
}
