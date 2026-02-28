import { notFound } from "next/navigation";
import { StaffDetailClient } from "./staff-detail-client";
import {
  getStaffMember,
  getStaffActivities,
} from "@/services/staff-admin.service";

export default async function StaffDetailPage({
  params,
}: {
  params: Promise<{ staffId: string }>;
}) {
  const { staffId } = await params;
  const [staff, activities] = await Promise.all([
    getStaffMember(staffId),
    getStaffActivities(staffId),
  ]);

  if (!staff) notFound();

  return <StaffDetailClient staff={staff} activities={activities} />;
}
