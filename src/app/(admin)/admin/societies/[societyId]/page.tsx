import { notFound } from "next/navigation";
import { getSocietyDetail } from "@/services/admin.service";
import { SocietyDetailClient } from "./society-detail-client";

export default async function SocietyDetailPage({
  params,
}: {
  params: Promise<{ societyId: string }>;
}) {
  const { societyId } = await params;
  const data = await getSocietyDetail(societyId);

  if (!data) notFound();

  return (
    <SocietyDetailClient
      society={data.society}
      admins={data.admins}
      unitCount={data.unitCount}
    />
  );
}
