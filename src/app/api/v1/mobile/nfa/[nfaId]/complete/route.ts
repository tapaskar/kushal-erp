import { NextResponse } from "next/server";
import { getMobileSession } from "@/lib/auth/mobile-session";
import * as nfaService from "@/services/nfa.service";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ nfaId: string }> }
) {
  try {
    const session = await getMobileSession(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.userType !== "user") {
      return NextResponse.json(
        { error: "NFA is only available for user roles" },
        { status: 403 }
      );
    }

    const { nfaId } = await params;

    const result = await nfaService.markNFACompleted(nfaId, session.userId);

    return NextResponse.json(result);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "An error occurred";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
