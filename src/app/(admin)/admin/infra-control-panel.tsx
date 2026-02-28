"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Square, RefreshCw, Server, Database } from "lucide-react";
import { startInfra, stopInfra, getInfraStatus, type InfraStatus } from "@/services/aws-infra.service";

interface Props {
  initialStatus: InfraStatus;
}

const statusColors: Record<string, string> = {
  running: "bg-green-100 text-green-800",
  available: "bg-green-100 text-green-800",
  stopped: "bg-gray-100 text-gray-600",
  starting: "bg-yellow-100 text-yellow-800",
  stopping: "bg-orange-100 text-orange-800",
  partial: "bg-yellow-100 text-yellow-800",
  ACTIVE: "bg-green-100 text-green-800",
};

export function InfraControlPanel({ initialStatus }: Props) {
  const [status, setStatus] = useState<InfraStatus>(initialStatus);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<"success" | "error">("success");
  const [isPending, startTransition] = useTransition();

  const refresh = () => {
    startTransition(async () => {
      const s = await getInfraStatus();
      setStatus(s);
    });
  };

  const handleStart = () => {
    startTransition(async () => {
      const res = await startInfra();
      setMessage(res.message);
      setMessageType(res.success ? "success" : "error");
      const s = await getInfraStatus();
      setStatus(s);
    });
  };

  const handleStop = () => {
    startTransition(async () => {
      const res = await stopInfra();
      setMessage(res.message);
      setMessageType(res.success ? "success" : "error");
      const s = await getInfraStatus();
      setStatus(s);
    });
  };

  const isRunning = status.overall === "running";
  const isStopped = status.overall === "stopped";
  const isTransitioning = status.overall === "starting" || status.overall === "stopping";

  return (
    <Card className="border-2 border-dashed border-slate-300">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Server className="h-4 w-4" />
          AWS Infrastructure Control
          <Badge
            className={`ml-auto text-xs font-medium ${statusColors[status.overall] ?? "bg-gray-100 text-gray-600"}`}
          >
            {status.overall.toUpperCase()}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Service status */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 rounded-md border p-2.5">
            <Server className="h-3.5 w-3.5 text-slate-500" />
            <div>
              <p className="font-medium text-slate-700">ECS (App)</p>
              <p className="text-xs text-slate-500">
                {status.ecs.running}/{status.ecs.desired} tasks · {status.ecs.status}
              </p>
            </div>
            <Badge className={`ml-auto text-xs ${status.ecs.running > 0 ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}`}>
              {status.ecs.running > 0 ? "ON" : "OFF"}
            </Badge>
          </div>
          <div className="flex items-center gap-2 rounded-md border p-2.5">
            <Database className="h-3.5 w-3.5 text-slate-500" />
            <div>
              <p className="font-medium text-slate-700">RDS (Database)</p>
              <p className="text-xs text-slate-500">{status.rds.status}</p>
            </div>
            <Badge
              className={`ml-auto text-xs ${statusColors[status.rds.status] ?? "bg-gray-100 text-gray-600"}`}
            >
              {status.rds.status === "available" ? "ON" : status.rds.status === "stopped" ? "OFF" : status.rds.status}
            </Badge>
          </div>
        </div>

        {/* Message */}
        {message && (
          <p className={`text-xs rounded-md px-3 py-2 ${messageType === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
            {message}
          </p>
        )}

        {/* Controls */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={handleStart}
            disabled={isPending || isRunning || isTransitioning}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Play className="h-3.5 w-3.5 mr-1.5" />
            Start Full Stack
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleStop}
            disabled={isPending || isStopped || isTransitioning}
            className="border-red-300 text-red-600 hover:bg-red-50"
          >
            <Square className="h-3.5 w-3.5 mr-1.5" />
            Stop & Save
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={refresh}
            disabled={isPending}
            className="ml-auto"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isPending ? "animate-spin" : ""}`} />
          </Button>
        </div>

        <p className="text-xs text-slate-400">
          Stop saves ~₹55/day · Start takes ~2–3 min for DB to warm up
        </p>
      </CardContent>
    </Card>
  );
}
