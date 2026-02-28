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
import { Plus, Users, UserCheck, ClipboardList } from "lucide-react";
import { addStaff } from "@/services/staff-admin.service";
import { STAFF_ROLES } from "@/lib/constants";

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

interface Stats {
  totalStaff: number;
  checkedInToday: number;
  pendingTasks: number;
}

export function StaffClient({
  staffList,
  stats,
}: {
  staffList: StaffRow[];
  stats: Stats;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [roleFilter, setRoleFilter] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = staffList.filter((s) => {
    const matchesRole = roleFilter === "all" || s.role === roleFilter;
    const matchesSearch =
      !search ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.employeeCode.toLowerCase().includes(search.toLowerCase()) ||
      s.phone.includes(search);
    return matchesRole && matchesSearch;
  });

  const roleLabel = (role: string) =>
    STAFF_ROLES.find((r) => r.value === role)?.label || role;

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);

    try {
      await addStaff({
        name: fd.get("name") as string,
        phone: fd.get("phone") as string,
        employeeCode: fd.get("employeeCode") as string,
        role: fd.get("role") as "security",
        department: fd.get("department") as string || undefined,
        contractorName: fd.get("contractorName") as string || undefined,
        emergencyContact: fd.get("emergencyContact") as string || undefined,
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
        <div>
          <h1 className="text-2xl font-bold">Staff Management</h1>
          <p className="text-muted-foreground">
            Manage staff members, shifts, and tasks
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Staff
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Add Staff Member</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid gap-4 grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="John Doe"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    placeholder="9876543210"
                    required
                  />
                </div>
              </div>
              <div className="grid gap-4 grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="employeeCode">Employee Code</Label>
                  <Input
                    id="employeeCode"
                    name="employeeCode"
                    placeholder="EMP-001"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Select name="role" defaultValue="security">
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
                    placeholder="Maintenance"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contractorName">Contractor Name</Label>
                  <Input
                    id="contractorName"
                    name="contractorName"
                    placeholder="ABC Services"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergencyContact">Emergency Contact</Label>
                <Input
                  id="emergencyContact"
                  name="emergencyContact"
                  placeholder="9876543210"
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Adding..." : "Add Staff Member"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStaff}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Checked In Today
            </CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.checkedInToday}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Tasks
            </CardTitle>
            <ClipboardList className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {stats.pendingTasks}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="Search by name, code, or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            {STAFF_ROLES.map((r) => (
              <SelectItem key={r.value} value={r.value}>
                {r.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex gap-2 ml-auto">
          <Link href="/staff/shifts">
            <Button variant="outline">Shifts</Button>
          </Link>
          <Link href="/staff/tasks">
            <Button variant="outline">Tasks</Button>
          </Link>
          <Link href="/staff/patrols">
            <Button variant="outline">Patrols</Button>
          </Link>
          <Link href="/staff/beacons">
            <Button variant="outline">Beacons</Button>
          </Link>
          <Link href="/staff/locations">
            <Button variant="outline">Live Map</Button>
          </Link>
        </div>
      </div>

      {/* Staff Table */}
      {filtered.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardHeader className="text-center">
            <CardTitle>No staff members</CardTitle>
            <CardDescription>
              {staffList.length === 0
                ? "Add your first staff member to get started"
                : "No staff match your filters"}
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((staff) => (
                <TableRow key={staff.id}>
                  <TableCell>
                    <Link
                      href={`/staff/${staff.id}`}
                      className="font-mono text-xs text-primary hover:underline"
                    >
                      {staff.employeeCode}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/staff/${staff.id}`}
                      className="font-medium hover:underline"
                    >
                      {staff.name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{roleLabel(staff.role)}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {staff.phone}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {staff.department || "---"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={staff.isActive ? "default" : "secondary"}
                    >
                      {staff.isActive ? "Active" : "Inactive"}
                    </Badge>
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
