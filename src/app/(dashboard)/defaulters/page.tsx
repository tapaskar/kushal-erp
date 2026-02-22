import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getDefaulters, getAgingReport } from "@/services/defaulter.service";
import { DefaultersClient } from "./defaulters-client";

export default async function DefaultersPage() {
  const session = await getSession();
  if (!session?.societyId) redirect("/society/setup");

  const [defaulterList, aging] = await Promise.all([
    getDefaulters(session.societyId),
    getAgingReport(session.societyId),
  ]);

  return <DefaultersClient defaulters={defaulterList} aging={aging} />;
}
