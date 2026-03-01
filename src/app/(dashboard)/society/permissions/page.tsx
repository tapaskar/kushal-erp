import { Metadata } from "next/types";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import {
  getSocietyModules,
  getRolePermissions,
} from "@/services/permission.service";
import { PermissionConfigClient } from "./permission-config-client";

export const metadata: Metadata = {
  title: "Permission Configuration",
  description: "Configure module access and role permissions",
};

export default async function PermissionConfigPage() {
  const session = await getSession();
  if (!session || session.role !== "society_admin") redirect("/");

  const modules = await getSocietyModules(session.societyId!);
  const permissions = await getRolePermissions(session.societyId!);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Permission Configuration
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Configure which modules are enabled and manage role-based permissions
        </p>
      </div>
      <PermissionConfigClient
        modules={modules}
        permissions={permissions}
        societyId={session.societyId!}
      />
    </div>
  );
}
