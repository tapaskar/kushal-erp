"use client";

import { useState } from "react";
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

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-gray-100 text-gray-800",
  in_progress: "bg-yellow-100 text-yellow-800",
  completed: "bg-green-100 text-green-800",
  verified: "bg-blue-100 text-blue-800",
  issue_reported: "bg-red-100 text-red-800",
};

interface ScheduleRow {
  id: string;
  zoneName: string;
  zoneType: string;
  zoneFloor: number | null;
  staffName: string | null;
  status: string;
  scheduledDate: string;
  startedAt: string | null;
  completedAt: string | null;
  rating: number | null;
  ratingComment: string | null;
}

export function HousekeepingClient({ schedule }: { schedule: ScheduleRow[] }) {
  const [list, setList] = useState(schedule);
  const [ratingLogId, setRatingLogId] = useState<string | null>(null);
  const [ratingValue, setRatingValue] = useState(5);
  const [ratingComment, setRatingComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleRate = async (logId: string) => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/v1/resident/cleaning/${logId}/rate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: ratingValue, comment: ratingComment }),
      });
      if (res.ok) {
        setList(
          list.map((l) =>
            l.id === logId
              ? { ...l, rating: ratingValue, ratingComment }
              : l
          )
        );
        setRatingLogId(null);
        setRatingComment("");
      }
    } catch {
      // ignore
    } finally {
      setSubmitting(false);
    }
  };

  const completed = list.filter(
    (l) => l.status === "completed" || l.status === "verified"
  ).length;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Housekeeping Schedule</h1>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{list.length}</div>
            <p className="text-sm text-muted-foreground">Total Today</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{completed}</div>
            <p className="text-sm text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-600">
              {list.length > 0 ? Math.round((completed / list.length) * 100) : 0}%
            </div>
            <p className="text-sm text-muted-foreground">Completion Rate</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Today's Cleaning Status</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Zone</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Floor</TableHead>
                <TableHead>Staff</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Completed At</TableHead>
                <TableHead>Your Rating</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.zoneName}</TableCell>
                  <TableCell className="capitalize">
                    {item.zoneType.replace("_", " ")}
                  </TableCell>
                  <TableCell>{item.zoneFloor ?? "-"}</TableCell>
                  <TableCell>{item.staffName || "-"}</TableCell>
                  <TableCell>
                    <Badge className={STATUS_COLORS[item.status] || ""}>
                      {item.status.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {item.completedAt
                      ? new Date(item.completedAt).toLocaleTimeString()
                      : "-"}
                  </TableCell>
                  <TableCell>
                    {item.rating ? (
                      <span>
                        {"★".repeat(item.rating)}{"☆".repeat(5 - item.rating)}
                        {item.ratingComment && (
                          <span className="text-xs text-muted-foreground ml-2">
                            {item.ratingComment}
                          </span>
                        )}
                      </span>
                    ) : (item.status === "completed" || item.status === "verified") ? (
                      ratingLogId === item.id ? (
                        <div className="flex gap-2 items-center">
                          <select
                            className="border rounded px-2 py-1 text-sm"
                            value={ratingValue}
                            onChange={(e) => setRatingValue(Number(e.target.value))}
                          >
                            {[1, 2, 3, 4, 5].map((v) => (
                              <option key={v} value={v}>{v} star{v > 1 ? "s" : ""}</option>
                            ))}
                          </select>
                          <input
                            className="border rounded px-2 py-1 text-sm w-24"
                            placeholder="Comment"
                            value={ratingComment}
                            onChange={(e) => setRatingComment(e.target.value)}
                          />
                          <Button
                            size="sm"
                            disabled={submitting}
                            onClick={() => handleRate(item.id)}
                          >
                            Rate
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setRatingLogId(item.id)}
                        >
                          Rate
                        </Button>
                      )
                    ) : (
                      "-"
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {list.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No cleaning scheduled for today
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
