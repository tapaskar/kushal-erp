"use client";

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
import { ArrowLeft } from "lucide-react";
import { SHIFT_STATUS_COLORS } from "@/lib/constants";

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

export function ReportsClient({
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
      <div className="flex items-center gap-4">
        <Link href="/staff">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Staff
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Staff Reports</h1>
      </div>

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
          <CardTitle>Today's Attendance</CardTitle>
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
                    {new Date(row.scheduledStart).toLocaleTimeString()} -{" "}
                    {new Date(row.scheduledEnd).toLocaleTimeString()}
                  </TableCell>
                  <TableCell>
                    {row.actualCheckIn
                      ? new Date(row.actualCheckIn).toLocaleTimeString()
                      : "-"}
                  </TableCell>
                  <TableCell>
                    {row.actualCheckOut
                      ? new Date(row.actualCheckOut).toLocaleTimeString()
                      : "-"}
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
