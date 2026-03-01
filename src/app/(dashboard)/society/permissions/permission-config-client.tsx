"use client";

import { useState, useCallback } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// ─── Types ───

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

interface RolePermission {
  id: string;
  societyId: string;
  role: string;
  roleType: string;
  moduleKey: string;
  permission: string;
  isGranted: boolean;
  configuredBy: string | null;
  updatedAt: Date;
}

interface PermissionConfigClientProps {
  modules: SocietyModule[];
  permissions: RolePermission[];
  societyId: string;
}

// ─── Constants ───

const USER_ROLES = [
  { key: "society_admin", label: "Admin" },
  { key: "estate_manager", label: "Estate Mgr" },
  { key: "president", label: "President" },
  { key: "vice_president", label: "Vice Pres." },
  { key: "secretary", label: "Secretary" },
  { key: "joint_secretary", label: "Jt. Secretary" },
  { key: "treasurer", label: "Treasurer" },
  { key: "joint_treasurer", label: "Jt. Treasurer" },
  { key: "executive_member", label: "Exec. Member" },
] as const;

const STAFF_ROLES = [
  { key: "security", label: "Security" },
  { key: "housekeeping", label: "Housekeeping" },
  { key: "supervisor", label: "Supervisor" },
  { key: "maintenance", label: "Maintenance" },
  { key: "electrician", label: "Electrician" },
  { key: "plumber", label: "Plumber" },
  { key: "gardener", label: "Gardener" },
] as const;

// ─── Helpers ───

function formatPermissionName(moduleKey: string, permission: string): string {
  const formatSegment = (s: string) =>
    s
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

  return `${formatSegment(moduleKey)} - ${formatSegment(permission)}`;
}

function formatPermissionShort(permission: string): string {
  return permission
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

// ─── Component ───

export function PermissionConfigClient({
  modules: initialModules,
  permissions: initialPermissions,
  societyId,
}: PermissionConfigClientProps) {
  const [modules, setModules] = useState<SocietyModule[]>(initialModules);
  const [permissions, setPermissions] =
    useState<RolePermission[]>(initialPermissions);
  const [saving, setSaving] = useState<string | null>(null);
  const [resetting, setResetting] = useState(false);

  // Build a lookup: moduleKey -> isEnabled
  const moduleEnabledMap = new Map(
    modules.map((m) => [m.moduleKey, m.isEnabled])
  );

  // Build a lookup: `${role}::${moduleKey}::${permission}` -> isGranted
  const permLookup = new Map(
    permissions.map((p) => [
      `${p.role}::${p.moduleKey}::${p.permission}`,
      p.isGranted,
    ])
  );

  // Group permissions by moduleKey, then collect unique permission names
  const groupedByModule = new Map<string, Set<string>>();
  for (const p of permissions) {
    if (!groupedByModule.has(p.moduleKey)) {
      groupedByModule.set(p.moduleKey, new Set());
    }
    groupedByModule.get(p.moduleKey)!.add(p.permission);
  }

  // Separate user and staff permissions
  const userPermissions = permissions.filter((p) => p.roleType === "user");
  const staffPermissions = permissions.filter((p) => p.roleType === "staff");

  const userModulePerms = new Map<string, Set<string>>();
  for (const p of userPermissions) {
    if (!userModulePerms.has(p.moduleKey)) {
      userModulePerms.set(p.moduleKey, new Set());
    }
    userModulePerms.get(p.moduleKey)!.add(p.permission);
  }

  const staffModulePerms = new Map<string, Set<string>>();
  for (const p of staffPermissions) {
    if (!staffModulePerms.has(p.moduleKey)) {
      staffModulePerms.set(p.moduleKey, new Set());
    }
    staffModulePerms.get(p.moduleKey)!.add(p.permission);
  }

  // ─── API Calls ───

  const handleUpdatePermission = useCallback(
    async (
      role: string,
      moduleKey: string,
      permission: string,
      isGranted: boolean
    ) => {
      const savingKey = `${role}::${moduleKey}::${permission}`;
      setSaving(savingKey);
      try {
        const res = await fetch("/api/society/permissions", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "updatePermission",
            role,
            moduleKey,
            permission,
            isGranted,
          }),
        });
        if (res.ok) {
          setPermissions((prev) =>
            prev.map((p) =>
              p.role === role &&
              p.moduleKey === moduleKey &&
              p.permission === permission
                ? { ...p, isGranted }
                : p
            )
          );
        }
      } finally {
        setSaving(null);
      }
    },
    []
  );

  const handleResetToDefaults = useCallback(async () => {
    if (
      !confirm(
        "This will reset all role permission settings to their defaults. Module configuration will not be affected. Continue?"
      )
    ) {
      return;
    }
    setResetting(true);
    try {
      const res = await fetch("/api/society/permissions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "resetToDefaults" }),
      });
      if (res.ok) {
        // Reload the data from the server
        const dataRes = await fetch("/api/society/permissions");
        if (dataRes.ok) {
          const data = await dataRes.json();
          setModules(data.modules);
          setPermissions(data.permissions);
        }
      }
    } finally {
      setResetting(false);
    }
  }, []);

  // ─── Render: Permission Matrix ───

  function renderPermissionMatrix(
    roleType: "user" | "staff",
    roles: ReadonlyArray<{ key: string; label: string }>,
    modulePermsMap: Map<string, Set<string>>
  ) {
    const moduleKeys = Array.from(modulePermsMap.keys()).sort();

    if (moduleKeys.length === 0) {
      return (
        <p className="text-sm text-muted-foreground py-4">
          No permissions configured for these roles yet.
        </p>
      );
    }

    return (
      <div className="space-y-6">
        {moduleKeys.map((moduleKey) => {
          const perms = Array.from(modulePermsMap.get(moduleKey)!).sort();
          const mod = modules.find((m) => m.moduleKey === moduleKey);
          const isDisabled = !moduleEnabledMap.get(moduleKey);

          return (
            <Card
              key={moduleKey}
              className={isDisabled ? "opacity-60" : ""}
            >
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-base">
                    {mod?.moduleName || moduleKey}
                  </CardTitle>
                  {isDisabled && (
                    <Badge variant="secondary">Disabled</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-48">Permission</TableHead>
                      {roles.map((role) => (
                        <TableHead
                          key={role.key}
                          className="text-center text-xs"
                        >
                          {role.label}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {perms.map((perm) => (
                      <TableRow key={perm}>
                        <TableCell className="font-medium text-sm">
                          {formatPermissionShort(perm)}
                        </TableCell>
                        {roles.map((role) => {
                          const lookupKey = `${role.key}::${moduleKey}::${perm}`;
                          const isGranted = permLookup.get(lookupKey) ?? false;
                          const isSaving = saving === lookupKey;

                          return (
                            <TableCell
                              key={role.key}
                              className="text-center"
                            >
                              <div className="flex justify-center">
                                <Checkbox
                                  checked={isGranted}
                                  disabled={isDisabled || isSaving}
                                  onCheckedChange={(checked) =>
                                    handleUpdatePermission(
                                      role.key,
                                      moduleKey,
                                      perm,
                                      checked === true
                                    )
                                  }
                                />
                              </div>
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  }

  // ─── Main Render ───

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Role Permissions</CardTitle>
          <CardDescription>
            Configure which permissions are granted to each role. Permissions for
            disabled modules will be greyed out. Module availability is managed
            by the platform administrator.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="user">
            <TabsList>
              <TabsTrigger value="user">User Roles</TabsTrigger>
              <TabsTrigger value="staff">Staff Roles</TabsTrigger>
            </TabsList>

            <TabsContent value="user" className="mt-4">
              {renderPermissionMatrix("user", USER_ROLES, userModulePerms)}
            </TabsContent>

            <TabsContent value="staff" className="mt-4">
              {renderPermissionMatrix("staff", STAFF_ROLES, staffModulePerms)}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          variant="destructive"
          disabled={resetting}
          onClick={handleResetToDefaults}
        >
          {resetting ? "Resetting..." : "Reset to Defaults"}
        </Button>
      </div>
    </div>
  );
}
