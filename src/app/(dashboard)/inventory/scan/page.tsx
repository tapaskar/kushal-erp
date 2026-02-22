import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { BarcodeScannerClient } from "./barcode-scanner-client";

export default async function BarcodeScanPage() {
  const session = await getSession();
  if (!session?.societyId) redirect("/society/setup");

  return <BarcodeScannerClient societyId={session.societyId} />;
}
