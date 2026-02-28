"use client";

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
import { Building2, Users, ShieldCheck } from "lucide-react";
import { InfraControlPanel } from "./infra-control-panel";
import type { InfraStatus } from "@/services/aws-infra.service";

interface Props {
  stats: {
    totalSocieties: number;
    totalUsers: number;
    totalAdmins: number;
  };
  recentSocieties: Array<{
    society: {
      id: string;
      name: string;
      city: string;
      pincode: string;
      createdAt: Date;
    };
    unitCount: number;
    adminCount: number;
  }>;
  infraStatus: InfraStatus;
}

export function AdminDashboardClient({ stats, recentSocieties, infraStatus }: Props) {
  const statCards = [
    {
      title: "Total Societies",
      value: stats.totalSocieties,
      icon: Building2,
      color: "text-blue-600",
      href: "/admin/societies",
    },
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      color: "text-green-600",
      href: "/admin/users",
    },
    {
      title: "Society Admins",
      value: stats.totalAdmins,
      icon: ShieldCheck,
      color: "text-purple-600",
      href: "/admin/users",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Platform overview and management
        </p>
      </div>

      <InfraControlPanel initialStatus={infraStatus} />

      <div className="grid gap-4 sm:grid-cols-3">
        {statCards.map((card) => (
          <Link key={card.title} href={card.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  {card.title}
                </CardTitle>
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Societies</CardTitle>
          <CardDescription>
            Latest registered societies on the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentSocieties.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No societies registered yet
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead className="text-right">Units</TableHead>
                  <TableHead className="text-right">Admins</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentSocieties.map(({ society, unitCount, adminCount }) => (
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
                    <TableCell className="text-right">{unitCount}</TableCell>
                    <TableCell className="text-right">{adminCount}</TableCell>
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
