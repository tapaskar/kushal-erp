"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { resolveSos } from "@/services/security-admin.service";

interface SosAlert {
  id: string;
  staffName: string;
  staffRole: string;
  staffPhone: string;
  latitude: string | null;
  longitude: string | null;
  message: string | null;
  isResolved: boolean;
  createdAt: Date | string;
}

export function SosClient({ alerts }: { alerts: SosAlert[] }) {
  const [list, setList] = useState(alerts);
  const [resolving, setResolving] = useState<string | null>(null);

  const handleResolve = async (id: string) => {
    setResolving(id);
    try {
      await resolveSos(id);
      setList(list.map((a) => (a.id === id ? { ...a, isResolved: true } : a)));
    } catch {
      // ignore
    } finally {
      setResolving(null);
    }
  };

  const active = list.filter((a) => !a.isResolved);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/staff">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Staff
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">SOS Alerts</h1>
        {active.length > 0 && (
          <Badge className="bg-red-100 text-red-800">
            {active.length} Active
          </Badge>
        )}
      </div>

      {active.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No active SOS alerts
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {list.map((alert) => (
          <Card
            key={alert.id}
            className={alert.isResolved ? "opacity-60" : "border-red-200 bg-red-50"}
          >
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">🚨</span>
                    <h3 className="font-semibold text-lg">{alert.staffName}</h3>
                    <Badge variant="outline" className="capitalize">
                      {alert.staffRole}
                    </Badge>
                    {alert.isResolved && (
                      <Badge className="bg-green-100 text-green-800">Resolved</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Phone: {alert.staffPhone}
                  </p>
                  {alert.message && (
                    <p className="text-sm">{alert.message}</p>
                  )}
                  {alert.latitude && alert.longitude && (
                    <p className="text-xs text-muted-foreground mt-1">
                      GPS: {alert.latitude}, {alert.longitude}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(alert.createdAt).toLocaleString()}
                  </p>
                </div>
                {!alert.isResolved && (
                  <Button
                    variant="destructive"
                    disabled={resolving === alert.id}
                    onClick={() => handleResolve(alert.id)}
                  >
                    {resolving === alert.id ? "Resolving..." : "Mark Resolved"}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
