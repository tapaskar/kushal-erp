import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { NewVendorClient } from "./new-vendor-client";

export default async function NewVendorPage() {
  const session = await getSession();
  if (!session?.societyId) redirect("/society/setup");

  return <NewVendorClient societyId={session.societyId} />;
}
