import { NextResponse } from "next/server";
import { getMobileSession } from "@/lib/auth/mobile-session";

export async function POST(request: Request) {
  try {
    const session = await getMobileSession(request);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { purpose } = await request.json();
    const timestamp = Date.now();
    const key = `staff-photos/${session.societyId}/${session.staffId}/${purpose || "general"}/${timestamp}.jpg`;

    return NextResponse.json({
      uploadUrl: "placeholder",
      key,
    });
  } catch (error) {
    console.error("[Staff Upload] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
