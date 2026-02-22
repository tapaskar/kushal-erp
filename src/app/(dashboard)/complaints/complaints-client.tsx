"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { Badge } from "@/components/ui/badge";
import { Plus, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { createComplaint, updateComplaintStatus } from "@/services/complaint.service";
import { COMPLAINT_CATEGORIES } from "@/lib/constants";
import { formatDate } from "@/lib/utils/dates";

interface ComplaintRow {
  complaint: {
    id: string;
    complaintNumber: string;
    title: string;
    description: string;
    category: string;
    priority: string;
    status: string;
    slaHours: number | null;
    createdAt: Date;
    resolvedAt: Date | null;
  };
  raisedByUser: { name: string | null } | null;
}

interface Stats {
  total: number;
  open: number;
  resolved: number;
}

const STATUS_BADGE: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  open: "destructive",
  assigned: "outline",
  in_progress: "outline",
  resolved: "default",
  closed: "secondary",
  reopened: "destructive",
};

const PRIORITY_COLORS: Record<string, string> = {
  low: "bg-gray-100 text-gray-800",
  medium: "bg-blue-100 text-blue-800",
  high: "bg-orange-100 text-orange-800",
  urgent: "bg-red-100 text-red-800",
};

export function ComplaintsClient({
  societyId,
  complaints,
  stats,
}: {
  societyId: string;
  complaints: ComplaintRow[];
  stats: Stats;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);

    try {
      await createComplaint({
        societyId,
        title: fd.get("title") as string,
        description: fd.get("description") as string,
        category: fd.get("category") as string,
        priority: (fd.get("priority") as string) as "medium",
      });
      setOpen(false);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function handleResolve(id: string) {
    const resolution = prompt("Resolution notes:");
    if (resolution === null) return;
    await updateComplaintStatus(id, "resolved", resolution);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Complaints</h1>
          <p className="text-muted-foreground">
            Track and resolve resident complaints
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Complaint
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Raise Complaint</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="Leaking pipe in parking area"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  name="description"
                  className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="Detailed description of the issue..."
                  required
                />
              </div>
              <div className="grid gap-4 grid-cols-2">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select name="category" defaultValue="Other">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {COMPLAINT_CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select name="priority" defaultValue="medium">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Submitting..." : "Submit Complaint"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Open</CardTitle>
            <Clock className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {stats.open}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.resolved}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Complaint list */}
      {complaints.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardHeader className="text-center">
            <CardTitle>No complaints</CardTitle>
            <CardDescription>No complaints have been raised yet</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="space-y-3">
          {complaints.map((row) => (
            <Card key={row.complaint.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground font-mono">
                        {row.complaint.complaintNumber}
                      </span>
                      <Badge variant={STATUS_BADGE[row.complaint.status] || "outline"}>
                        {row.complaint.status.replace("_", " ")}
                      </Badge>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          PRIORITY_COLORS[row.complaint.priority] || ""
                        }`}
                      >
                        {row.complaint.priority}
                      </span>
                    </div>
                    <CardTitle className="text-base">
                      {row.complaint.title}
                    </CardTitle>
                    <div className="text-xs text-muted-foreground">
                      {row.complaint.category} &middot;{" "}
                      {formatDate(row.complaint.createdAt)}
                      {row.raisedByUser?.name &&
                        ` · by ${row.raisedByUser.name}`}
                      {row.complaint.slaHours &&
                        ` · SLA: ${row.complaint.slaHours}h`}
                    </div>
                  </div>
                  {row.complaint.status !== "resolved" &&
                    row.complaint.status !== "closed" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleResolve(row.complaint.id)}
                      >
                        Resolve
                      </Button>
                    )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {row.complaint.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
