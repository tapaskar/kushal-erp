"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
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
import { Plus, Users, UserCheck, Home } from "lucide-react";

interface MemberRow {
  member: {
    id: string;
    name: string;
    phone: string;
    email: string | null;
    memberType: string;
    isActive: boolean;
  };
  unit: { unitNumber: string };
  block: { name: string };
}

interface Stats {
  total: number;
  owners: number;
  tenants: number;
}

const TYPE_BADGE: Record<string, string> = {
  owner: "bg-green-100 text-green-800",
  tenant: "bg-blue-100 text-blue-800",
  family_member: "bg-purple-100 text-purple-800",
};

export function MembersClient({
  members,
  stats,
}: {
  members: MemberRow[];
  stats: Stats;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Members Directory</h1>
          <p className="text-muted-foreground">
            Manage residents, owners, and tenants
          </p>
        </div>
        <Link href="/members/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Member
          </Button>
        </Link>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Owners</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.owners}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Tenants</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.tenants}</div>
          </CardContent>
        </Card>
      </div>

      {/* Members table */}
      {members.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardHeader className="text-center">
            <CardTitle>No members yet</CardTitle>
            <CardDescription>
              Add your first member to start managing your community
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Block</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((row) => (
                <TableRow key={row.member.id}>
                  <TableCell>
                    <Link
                      href={`/members/${row.member.id}`}
                      className="font-medium hover:underline"
                    >
                      {row.member.name}
                    </Link>
                  </TableCell>
                  <TableCell>{row.unit.unitNumber}</TableCell>
                  <TableCell>{row.block.name}</TableCell>
                  <TableCell>{row.member.phone}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium capitalize ${
                        TYPE_BADGE[row.member.memberType] || ""
                      }`}
                    >
                      {row.member.memberType.replace("_", " ")}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={row.member.isActive ? "default" : "secondary"}>
                      {row.member.isActive ? "Active" : "Inactive"}
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
