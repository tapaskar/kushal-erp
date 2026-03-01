"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Search, Settings2 } from "lucide-react";
import { createSocietyAsAdmin } from "@/services/admin.service";

interface Props {
  societies: Array<{
    society: {
      id: string;
      name: string;
      city: string;
      state: string;
      pincode: string;
      createdAt: Date;
    };
    unitCount: number;
    adminCount: number;
  }>;
}

export function SocietiesClient({ societies }: Props) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  const filtered = societies.filter(
    ({ society }) =>
      society.name.toLowerCase().includes(search.toLowerCase()) ||
      society.city.toLowerCase().includes(search.toLowerCase()) ||
      society.pincode.includes(search)
  );

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setCreating(true);
    const formData = new FormData(e.currentTarget);
    await createSocietyAsAdmin({
      name: formData.get("name") as string,
      address: formData.get("address") as string,
      city: formData.get("city") as string,
      state: formData.get("state") as string,
      pincode: formData.get("pincode") as string,
      phone: (formData.get("phone") as string) || undefined,
      email: (formData.get("email") as string) || undefined,
    });
    setOpen(false);
    setCreating(false);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Societies</h1>
          <p className="text-muted-foreground">
            Manage all registered societies
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Society
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Society</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Society Name *</Label>
                <Input id="name" name="name" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address *</Label>
                <Input id="address" name="address" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input id="city" name="city" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State *</Label>
                  <Input id="state" name="state" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pincode">Pincode *</Label>
                  <Input id="pincode" name="pincode" maxLength={6} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" name="phone" type="tel" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" />
              </div>
              <Button type="submit" className="w-full" disabled={creating}>
                {creating ? "Creating..." : "Create Society"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, city, or pincode..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Pincode</TableHead>
                <TableHead className="text-right">Units</TableHead>
                <TableHead className="text-right">Admins</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    No societies found
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map(({ society, unitCount, adminCount }) => (
                  <TableRow key={society.id}>
                    <TableCell>
                      <Link
                        href={`/admin/societies/${society.id}`}
                        className="font-medium hover:underline"
                      >
                        {society.name}
                      </Link>
                    </TableCell>
                    <TableCell>{society.city}</TableCell>
                    <TableCell>{society.pincode}</TableCell>
                    <TableCell className="text-right">{unitCount}</TableCell>
                    <TableCell className="text-right">{adminCount}</TableCell>
                    <TableCell>
                      {new Date(society.createdAt).toLocaleDateString("en-IN")}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/admin/societies/${society.id}/modules`}>
                        <Button variant="outline" size="sm">
                          <Settings2 className="mr-1 h-3 w-3" />
                          Modules
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
