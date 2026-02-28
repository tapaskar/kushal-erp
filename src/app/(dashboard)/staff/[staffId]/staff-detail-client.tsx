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
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Phone,
  Mail,
  Briefcase,
  Shield,
  User,
  MapPin,
  Calendar,
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

export function StaffDetailClient({ staff }: { staff: StaffData }) {
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

  return (
    <div className="max-w-4xl mx-auto space-y-6">
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
            <div className="space-y-3">
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
                <span>{roleLabel}</span>
                {staff.department && (
                  <span className="text-muted-foreground">
                    &middot; {staff.department}
                  </span>
                )}
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
                  <span>Employed since: {staff.employedSince}</span>
                </div>
              )}
              {staff.monthlySalary && (
                <div className="flex items-center gap-3">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <span>Salary: {staff.monthlySalary}/month</span>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="shifts">
        <TabsList>
          <TabsTrigger value="shifts">Shifts</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="location">Location</TabsTrigger>
        </TabsList>

        <TabsContent value="shifts" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent Shifts</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                View shift history on the{" "}
                <Link href="/staff/shifts" className="text-primary hover:underline">
                  Shifts page
                </Link>
                .
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Assigned Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                View and manage tasks on the{" "}
                <Link href="/staff/tasks" className="text-primary hover:underline">
                  Tasks page
                </Link>
                .
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="location" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Location Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>
                  Real-time location tracking requires the staff mobile app to
                  be active.
                </span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
