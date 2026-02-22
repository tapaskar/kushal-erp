import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { NewPRClient } from "./new-pr-client";

export default async function NewRequestPage() {
  const session = await getSession();
  if (!session?.societyId) redirect("/society/setup");

  return <NewPRClient societyId={session.societyId} />;
}
