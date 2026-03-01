import { NextResponse } from "next/server";
import { getMobileSession } from "@/lib/auth/mobile-session";
import * as nfaService from "@/services/nfa.service";

export async function GET(request: Request) {
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

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || undefined;
    const limit = searchParams.get("limit")
      ? parseInt(searchParams.get("limit")!, 10)
      : undefined;
    const offset = searchParams.get("offset")
      ? parseInt(searchParams.get("offset")!, 10)
      : undefined;

    const results = await nfaService.getNFAs(session.societyId, {
      status,
      limit,
      offset,
    });

    return NextResponse.json(results);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "An error occurred";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
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

    if (
      !session.userRole ||
      !["society_admin", "estate_manager"].includes(session.userRole)
    ) {
      return NextResponse.json(
        { error: "Only society admins and estate managers can create NFAs" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, description, category, priority, items } = body;

    const nfa = await nfaService.createNFA(
      session.societyId,
      { title, description, category, priority, items },
      session.userId
    );

    return NextResponse.json(nfa, { status: 201 });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "An error occurred";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
