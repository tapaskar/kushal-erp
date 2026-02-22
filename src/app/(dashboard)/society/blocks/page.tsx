import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getBlocks } from "@/services/society.service";
import { BlocksClient } from "./blocks-client";

export default async function BlocksPage() {
  const session = await getSession();
  if (!session?.societyId) redirect("/society/setup");

  const blockList = await getBlocks(session.societyId);

  return (
    <BlocksClient
      societyId={session.societyId}
      initialBlocks={blockList}
    />
  );
}
