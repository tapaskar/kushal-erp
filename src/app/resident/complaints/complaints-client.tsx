"use client";

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
import { MessageSquare, AlertCircle, CheckCircle } from "lucide-react";

interface Props {
  stats: {
    total: number;
    open: number;
    resolved: number;
  };
  categorySummary: Array<{
    category: string;
    total: number;
    open: number;
    resolved: number;
    resolutionRate: number;
  }>;
}

export function ComplaintsClient({ stats, categorySummary }: Props) {
  const overallResolutionRate =
    stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Complaint Summary</h1>
        <p className="text-muted-foreground">
          Society-wide complaint statistics
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Complaints
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Open / Active</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
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

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Resolution Rate
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {overallResolutionRate}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Category-wise Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          {categorySummary.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No complaints recorded yet.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Open</TableHead>
                  <TableHead className="text-right">Resolved</TableHead>
                  <TableHead className="text-right">Resolution Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categorySummary.map((row) => (
                  <TableRow key={row.category}>
                    <TableCell className="font-medium">
                      {row.category}
                    </TableCell>
                    <TableCell className="text-right">{row.total}</TableCell>
                    <TableCell className="text-right text-orange-600">
                      {row.open}
                    </TableCell>
                    <TableCell className="text-right text-green-600">
                      {row.resolved}
                    </TableCell>
                    <TableCell className="text-right">
                      <span
                        className={
                          row.resolutionRate >= 80
                            ? "text-green-600"
                            : row.resolutionRate >= 50
                            ? "text-yellow-600"
                            : "text-red-600"
                        }
                      >
                        {row.resolutionRate}%
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="font-bold">
                  <TableCell>Total</TableCell>
                  <TableCell className="text-right">{stats.total}</TableCell>
                  <TableCell className="text-right text-orange-600">
                    {stats.open}
                  </TableCell>
                  <TableCell className="text-right text-green-600">
                    {stats.resolved}
                  </TableCell>
                  <TableCell className="text-right text-blue-600">
                    {overallResolutionRate}%
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
