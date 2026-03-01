import { redirect } from "next/navigation";
import { getSession, isSuperAdmin } from "@/lib/auth/session";
import { getSocietyDetail } from "@/services/admin.service";
import { getSocietyModules } from "@/services/permission.service";
import { ModulesClient } from "./modules-client";

export default async function ModulesPage({
  params,
}: {
  params: Promise<{ societyId: string }>;
}) {
  const session = await getSession();
  if (!session || !isSuperAdmin(session)) redirect("/login");

  const { societyId } = await params;
  const societyDetail = await getSocietyDetail(societyId);
  if (!societyDetail) redirect("/admin/societies");

  const modules = await getSocietyModules(societyId);

  return (
    <ModulesClient
      societyId={societyId}
      societyName={societyDetail.society.name}
      modules={modules}
    />
  );
}
