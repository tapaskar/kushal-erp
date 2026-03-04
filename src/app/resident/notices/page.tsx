import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getNotices } from "@/services/notice.service";
import { ResidentNoticesClient } from "./notices-client";

export default async function ResidentNoticesPage() {
  const session = await getSession();
  if (!session?.societyId) redirect("/login");

  const notices = await getNotices(session.societyId);

  return <ResidentNoticesClient notices={notices} />;
}
