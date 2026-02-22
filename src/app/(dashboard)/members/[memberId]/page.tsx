import { redirect, notFound } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getMember } from "@/services/member.service";
import { MemberDetailClient } from "./member-detail-client";

export default async function MemberDetailPage({
  params,
}: {
  params: Promise<{ memberId: string }>;
}) {
  const session = await getSession();
  if (!session?.societyId) redirect("/society/setup");

  const { memberId } = await params;
  const result = await getMember(memberId);
  if (!result) notFound();

  return <MemberDetailClient data={result} />;
}
