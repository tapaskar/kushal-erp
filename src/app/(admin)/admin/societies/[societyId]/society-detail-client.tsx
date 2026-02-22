"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Search, UserPlus, Trash2 } from "lucide-react";
import {
  assignSocietyAdmin,
  removeSocietyAdmin,
  searchUsersByPhone,
} from "@/services/admin.service";

interface Props {
  society: {
    id: string;
    name: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    phone: string | null;
    email: string | null;
    registrationNumber: string | null;
    createdAt: Date;
  };
  admins: Array<{
    roleId: string;
    userId: string;
    name: string;
    phone: string;
    email: string | null;
    role: string;
    assignedAt: Date;
  }>;
  unitCount: number;
}

export function SocietyDetailClient({ society, admins, unitCount }: Props) {
  const router = useRouter();
  const [phoneSearch, setPhoneSearch] = useState("");
  const [searchResults, setSearchResults] = useState<
    Array<{ id: string; name: string; phone: string; email: string | null }>
  >([]);
  const [searching, setSearching] = useState(false);
  const [assigning, setAssigning] = useState<string | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  async function handleSearch() {
    if (!phoneSearch.trim()) return;
    setSearching(true);
    setMessage("");
    const results = await searchUsersByPhone(phoneSearch);
    setSearchResults(results);
    if (results.length === 0) setMessage("No users found with that phone number");
    setSearching(false);
  }

  async function handleAssign(userId: string) {
    setAssigning(userId);
    setMessage("");
    const result = await assignSocietyAdmin(userId, society.id);
    if ("error" in result) {
      setMessage(result.error as string);
    } else {
      setSearchResults([]);
      setPhoneSearch("");
      router.refresh();
    }
    setAssigning(null);
  }

  async function handleRemove(roleId: string) {
    setRemoving(roleId);
    await removeSocietyAdmin(roleId);
    setRemoving(null);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/societies">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">{society.name}</h1>
          <p className="text-muted-foreground">
            {society.city}, {society.state} - {society.pincode}
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Society Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Address</span>
              <span className="text-right">{society.address}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">City</span>
              <span>{society.city}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">State</span>
              <span>{society.state}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Pincode</span>
              <span>{society.pincode}</span>
            </div>
            {society.phone && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Phone</span>
                <span>{society.phone}</span>
              </div>
            )}
            {society.email && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email</span>
                <span>{society.email}</span>
              </div>
            )}
            {society.registrationNumber && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Registration No.</span>
                <span>{society.registrationNumber}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Units</span>
              <span className="font-medium">{unitCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Created</span>
              <span>{new Date(society.createdAt).toLocaleDateString("en-IN")}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Assign Admin</CardTitle>
            <CardDescription>
              Search for a user by phone number and assign them as society admin
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Search by phone number..."
                value={phoneSearch}
                onChange={(e) => setPhoneSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              <Button onClick={handleSearch} disabled={searching} size="icon">
                <Search className="h-4 w-4" />
              </Button>
            </div>
            {message && (
              <p className="text-sm text-muted-foreground">{message}</p>
            )}
            {searchResults.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between rounded-md border p-3"
              >
                <div>
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.phone}</p>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleAssign(user.id)}
                  disabled={assigning === user.id}
                >
                  <UserPlus className="mr-1 h-3 w-3" />
                  {assigning === user.id ? "..." : "Assign"}
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Current Admins & Roles</CardTitle>
          <CardDescription>
            Users assigned to this society
          </CardDescription>
        </CardHeader>
        <CardContent>
          {admins.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No admins assigned yet
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Assigned</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {admins.map((admin) => (
                  <TableRow key={admin.roleId}>
                    <TableCell className="font-medium">{admin.name}</TableCell>
                    <TableCell>{admin.phone}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {admin.role.replace(/_/g, " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(admin.assignedAt).toLocaleDateString("en-IN")}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemove(admin.roleId)}
                        disabled={removing === admin.roleId}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
