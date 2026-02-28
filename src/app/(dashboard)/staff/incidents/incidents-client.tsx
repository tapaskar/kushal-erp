"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
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
import { updateIncident } from "@/services/security-admin.service";

const SEVERITY_COLORS: Record<string, string> = {
  low: "bg-green-100 text-green-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-orange-100 text-orange-800",
  critical: "bg-red-100 text-red-800",
};

const STATUS_COLORS: Record<string, string> = {
  reported: "bg-gray-100 text-gray-800",
  investigating: "bg-yellow-100 text-yellow-800",
  resolved: "bg-green-100 text-green-800",
  escalated: "bg-red-100 text-red-800",
};

interface IncidentRow {
  id: string;
  title: string;
  description: string | null;
  severity: string;
  status: string;
  location: string | null;
  reporterName: string;
  resolvedAt: string | null;
  resolution: string | null;
  createdAt: Date | string;
}

export function IncidentsClient({ incidents }: { incidents: IncidentRow[] }) {
  const [list, setList] = useState(incidents);
  const [updating, setUpdating] = useState<string | null>(null);

  const handleStatusChange = async (id: string, status: "investigating" | "resolved" | "escalated") => {
    setUpdating(id);
    try {
      await updateIncident(id, status);
      setList(list.map((i) => (i.id === id ? { ...i, status } : i)));
    } catch {
      // ignore
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/staff">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Staff
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Incidents</h1>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{list.length}</div>
            <p className="text-sm text-muted-foreground">Total Incidents</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-600">
              {list.filter((i) => i.status === "reported").length}
            </div>
            <p className="text-sm text-muted-foreground">Reported</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-orange-600">
              {list.filter((i) => i.status === "investigating").length}
            </div>
            <p className="text-sm text-muted-foreground">Investigating</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">
              {list.filter((i) => i.severity === "critical" && i.status !== "resolved").length}
            </div>
            <p className="text-sm text-muted-foreground">Critical Open</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Reported By</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.map((i) => (
                <TableRow key={i.id}>
                  <TableCell className="font-medium">{i.title}</TableCell>
                  <TableCell>
                    <Badge className={SEVERITY_COLORS[i.severity] || ""}>
                      {i.severity}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={STATUS_COLORS[i.status] || ""}>
                      {i.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{i.location || "-"}</TableCell>
                  <TableCell>{i.reporterName}</TableCell>
                  <TableCell>
                    {new Date(i.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {i.status === "reported" && (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={updating === i.id}
                          onClick={() => handleStatusChange(i.id, "investigating")}
                        >
                          Investigate
                        </Button>
                      )}
                      {(i.status === "reported" || i.status === "investigating") && (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={updating === i.id}
                          onClick={() => handleStatusChange(i.id, "resolved")}
                        >
                          Resolve
                        </Button>
                      )}
                      {i.status !== "escalated" && i.status !== "resolved" && (
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={updating === i.id}
                          onClick={() => handleStatusChange(i.id, "escalated")}
                        >
                          Escalate
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {list.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No incidents reported
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
