import { NextResponse } from "next/server";
import { getMobileSession } from "@/lib/auth/mobile-session";
import { db } from "@/db";
import { inventoryItems, stockMovements } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    const session = await getMobileSession(request);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { itemId } = await params;
    const body = await request.json();

    // Validate item exists
    const [item] = await db
      .select()
      .from(inventoryItems)
      .where(eq(inventoryItems.id, itemId))
      .limit(1);

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    // Validate stock-out quantity
    if (body.movementType === "stock_out" && item.quantity < body.quantity) {
      return NextResponse.json(
        { error: `Insufficient stock: ${item.quantity} available` },
        { status: 400 }
      );
    }

    // Create movement
    const [movement] = await db
      .insert(stockMovements)
      .values({
        societyId: session.societyId,
        inventoryItemId: itemId,
        movementType: body.movementType,
        reason: body.reason,
        quantity: body.quantity,
        date: new Date().toISOString().split("T")[0],
        notes: body.notes,
        performedBy: session.staffId,
      })
      .returning();

    // Update item quantity
    const newQuantity =
      body.movementType === "stock_in"
        ? item.quantity + body.quantity
        : item.quantity - body.quantity;

    await db
      .update(inventoryItems)
      .set({ quantity: newQuantity, updatedAt: new Date() })
      .where(eq(inventoryItems.id, itemId));

    return NextResponse.json({ movement, newQuantity }, { status: 201 });
  } catch (error) {
    console.error("[Inventory Stock] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
