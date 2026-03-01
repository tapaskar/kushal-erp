"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface SocietyModule {
  id: string;
  societyId: string;
  moduleKey: string;
  moduleName: string;
  description: string | null;
  isEnabled: boolean;
  configuredBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface ModulesClientProps {
  societyId: string;
  societyName: string;
  modules: SocietyModule[];
}

export function ModulesClient({
  societyId,
  societyName,
  modules: initialModules,
}: ModulesClientProps) {
  const [modules, setModules] = useState<SocietyModule[]>(initialModules);
  const [saving, setSaving] = useState<string | null>(null);

  const handleToggleModule = useCallback(
    async (moduleKey: string, isEnabled: boolean) => {
      setSaving(moduleKey);
      try {
        const res = await fetch(
          `/api/admin/societies/${societyId}/modules`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ moduleKey, isEnabled }),
          }
        );
        if (res.ok) {
          setModules((prev) =>
            prev.map((m) =>
              m.moduleKey === moduleKey ? { ...m, isEnabled } : m
            )
          );
        }
      } finally {
        setSaving(null);
      }
    },
    [societyId]
  );

  const enabledCount = modules.filter((m) => m.isEnabled).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/societies">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Module Management</h1>
          <p className="text-muted-foreground">
            {societyName} &mdash; {enabledCount} of {modules.length} modules
            enabled
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Available Modules</CardTitle>
          <CardDescription>
            Enable or disable modules for this society. Disabled modules will
            hide their features from all roles. Society admins can configure
            role-level permissions for enabled modules.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {modules.map((mod) => (
              <div
                key={mod.moduleKey}
                className={`flex items-start justify-between gap-3 rounded-lg border p-4 transition-opacity ${
                  mod.isEnabled ? "" : "opacity-60"
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {mod.moduleName}
                    </span>
                    <Badge
                      variant={mod.isEnabled ? "default" : "secondary"}
                    >
                      {mod.isEnabled ? "On" : "Off"}
                    </Badge>
                  </div>
                  {mod.description && (
                    <p className="text-xs text-muted-foreground">
                      {mod.description}
                    </p>
                  )}
                </div>
                <Switch
                  checked={mod.isEnabled}
                  disabled={saving === mod.moduleKey}
                  onCheckedChange={(checked) =>
                    handleToggleModule(mod.moduleKey, checked)
                  }
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
