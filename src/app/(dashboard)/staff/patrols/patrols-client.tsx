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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Plus, ArrowLeft, Route, ClipboardList } from "lucide-react";
import { addPatrolRoute } from "@/services/staff-admin.service";
import { PATROL_STATUS_COLORS } from "@/lib/constants";
import { formatDate } from "@/lib/utils/dates";

interface PatrolRoute {
  id: string;
  name: string;
  description: string | null;
  estimatedDurationMin: number | null;
  checkpointCount: number;
  createdAt: Date | string;
}

interface PatrolLog {
  id: string;
  routeName: string;
  staffName: string;
  status: string;
  startedAt: string | null;
  completedAt: string | null;
  completionPercentage: number;
  createdAt: Date | string;
}

export function PatrolsClient({
  routes,
  logs,
}: {
  routes: PatrolRoute[];
  logs: PatrolLog[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkpoints, setCheckpoints] = useState([
    { order: 1, label: "", requiredAction: "" },
  ]);

  function addCheckpoint() {
    setCheckpoints((prev) => [
      ...prev,
      { order: prev.length + 1, label: "", requiredAction: "" },
    ]);
  }

  function removeCheckpoint(index: number) {
    setCheckpoints((prev) =>
      prev
        .filter((_, i) => i !== index)
        .map((cp, i) => ({ ...cp, order: i + 1 }))
    );
  }

  function updateCheckpoint(
    index: number,
    field: "label" | "requiredAction",
    value: string
  ) {
    setCheckpoints((prev) =>
      prev.map((cp, i) => (i === index ? { ...cp, [field]: value } : cp))
    );
  }

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);

    const durationStr = fd.get("estimatedDurationMin") as string;

    try {
      await addPatrolRoute({
        name: fd.get("name") as string,
        description: (fd.get("description") as string) || undefined,
        estimatedDurationMin: durationStr ? parseInt(durationStr) : undefined,
        checkpoints: checkpoints
          .filter((cp) => cp.label.trim())
          .map((cp) => ({
            order: cp.order,
            label: cp.label,
            requiredAction: cp.requiredAction || undefined,
          })),
      });
      setOpen(false);
      setCheckpoints([{ order: 1, label: "", requiredAction: "" }]);
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
            <h1 className="text-2xl font-bold">Patrol Management</h1>
            <p className="text-muted-foreground">
              Manage patrol routes and view logs
            </p>
          </div>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Route
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Patrol Route</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Route Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Perimeter Night Patrol"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  name="description"
                  className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="Description of the patrol route..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="estimatedDurationMin">
                  Estimated Duration (minutes)
                </Label>
                <Input
                  id="estimatedDurationMin"
                  name="estimatedDurationMin"
                  type="number"
                  placeholder="30"
                />
              </div>

              {/* Checkpoints */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Checkpoints</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addCheckpoint}
                  >
                    <Plus className="mr-1 h-3 w-3" />
                    Add
                  </Button>
                </div>
                {checkpoints.map((cp, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-2 p-3 rounded-md border"
                  >
                    <span className="text-sm font-medium text-muted-foreground mt-2">
                      {cp.order}.
                    </span>
                    <div className="flex-1 space-y-2">
                      <Input
                        placeholder="Checkpoint label (e.g., Main Gate)"
                        value={cp.label}
                        onChange={(e) =>
                          updateCheckpoint(index, "label", e.target.value)
                        }
                      />
                      <Input
                        placeholder="Required action (optional)"
                        value={cp.requiredAction}
                        onChange={(e) =>
                          updateCheckpoint(
                            index,
                            "requiredAction",
                            e.target.value
                          )
                        }
                      />
                    </div>
                    {checkpoints.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCheckpoint(index)}
                        className="text-destructive"
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Creating..." : "Create Route"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="routes">
        <TabsList>
          <TabsTrigger value="routes">
            <Route className="mr-1 h-4 w-4" />
            Routes
          </TabsTrigger>
          <TabsTrigger value="logs">
            <ClipboardList className="mr-1 h-4 w-4" />
            Logs
          </TabsTrigger>
        </TabsList>

        {/* Routes Tab */}
        <TabsContent value="routes" className="mt-4">
          {routes.length === 0 ? (
            <Card className="border-dashed border-2">
              <CardHeader className="text-center">
                <CardTitle>No patrol routes</CardTitle>
                <CardDescription>
                  Create your first patrol route to get started
                </CardDescription>
              </CardHeader>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {routes.map((route) => (
                <Card key={route.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{route.name}</CardTitle>
                    {route.description && (
                      <CardDescription>{route.description}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>
                        <strong>{route.checkpointCount}</strong> checkpoints
                      </span>
                      {route.estimatedDurationMin && (
                        <span>~{route.estimatedDurationMin} min</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Logs Tab */}
        <TabsContent value="logs" className="mt-4">
          {logs.length === 0 ? (
            <Card className="border-dashed border-2">
              <CardHeader className="text-center">
                <CardTitle>No patrol logs</CardTitle>
                <CardDescription>
                  Patrol logs will appear here once patrols are completed
                </CardDescription>
              </CardHeader>
            </Card>
          ) : (
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Route</TableHead>
                    <TableHead>Staff</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Completion</TableHead>
                    <TableHead>Started</TableHead>
                    <TableHead>Completed</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-medium">
                        {log.routeName}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {log.staffName}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                            PATROL_STATUS_COLORS[log.status] ||
                            "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {log.status.replace("_", " ")}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full"
                              style={{
                                width: `${log.completionPercentage}%`,
                              }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {log.completionPercentage}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {log.startedAt ? formatDate(log.startedAt) : "---"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {log.completedAt
                          ? formatDate(log.completedAt)
                          : "---"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
