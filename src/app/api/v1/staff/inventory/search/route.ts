import { NextResponse } from "next/server";
import { getMobileSession } from "@/lib/auth/mobile-session";
import { db } from "@/db";
import { inventoryItems } from "@/db/schema";
import { eq, and, or, ilike } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const session = await getMobileSession(request);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const barcode = searchParams.get("barcode") || "";

    if (!query && !barcode) {
      return NextResponse.json({ items: [] });
    }

    const conditions = [
      eq(inventoryItems.societyId, session.societyId),
      eq(inventoryItems.isActive, true),
    ];

    if (barcode) {
      conditions.push(eq(inventoryItems.barcode, barcode));
    } else if (query) {
      conditions.push(
        or(
          ilike(inventoryItems.name, `%${query}%`),
          ilike(inventoryItems.barcode, `%${query}%`)
        )!
      );
    }

    const items = await db
      .select({
        id: inventoryItems.id,
        name: inventoryItems.name,
        barcode: inventoryItems.barcode,
        category: inventoryItems.category,
        quantity: inventoryItems.quantity,
        location: inventoryItems.location,
        isConsumable: inventoryItems.isConsumable,
      })
      .from(inventoryItems)
      .where(and(...conditions))
      .limit(20);

    return NextResponse.json({ items });
  } catch (error) {
    console.error("[Inventory Search] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
