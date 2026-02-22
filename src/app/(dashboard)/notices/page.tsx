import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getNotices } from "@/services/notice.service";
import { NoticesClient } from "./notices-client";

export default async function NoticesPage() {
  const session = await getSession();
  if (!session?.societyId) redirect("/society/setup");

  const noticeList = await getNotices(session.societyId);

  return <NoticesClient societyId={session.societyId} notices={noticeList} />;
}
