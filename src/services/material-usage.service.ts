import { db } from "@/db";
import { materialUsageLogs, inventoryItems, staff } from "@/db/schema";
import { eq, and, desc, sql, gte, lte } from "drizzle-orm";

export async function logMaterialUsage(data: {
  societyId: string;
  staffId: string;
  taskId?: string;
  inventoryItemId: string;
  quantityUsed: number;
  notes?: string;
}) {
  // Decrement inventory quantity
  const [item] = await db
    .select()
    .from(inventoryItems)
    .where(eq(inventoryItems.id, data.inventoryItemId))
    .limit(1);

  if (!item) throw new Error("Inventory item not found");
  if (item.quantity < data.quantityUsed) {
    throw new Error(
      `Insufficient stock: ${item.quantity} available, ${data.quantityUsed} requested`
    );
  }

  const [result] = await db
    .insert(materialUsageLogs)
    .values(data)
    .returning();

  // Update inventory quantity
  await db
    .update(inventoryItems)
    .set({
      quantity: item.quantity - data.quantityUsed,
      updatedAt: new Date(),
    })
    .where(eq(inventoryItems.id, data.inventoryItemId));

  return result;
}

export async function getMaterialUsageForTask(taskId: string) {
  return db
    .select({
      usage: materialUsageLogs,
      itemName: inventoryItems.name,
      itemBarcode: inventoryItems.barcode,
      staffName: staff.name,
    })
    .from(materialUsageLogs)
    .innerJoin(
      inventoryItems,
      eq(materialUsageLogs.inventoryItemId, inventoryItems.id)
    )
    .innerJoin(staff, eq(materialUsageLogs.staffId, staff.id))
    .where(eq(materialUsageLogs.taskId, taskId))
    .orderBy(desc(materialUsageLogs.createdAt));
}

export async function getMaterialUsageReport(
  societyId: string,
  dateFrom?: string,
  dateTo?: string
) {
  const conditions = [eq(materialUsageLogs.societyId, societyId)];
  if (dateFrom) {
    conditions.push(gte(materialUsageLogs.createdAt, new Date(dateFrom)));
  }
  if (dateTo) {
    conditions.push(lte(materialUsageLogs.createdAt, new Date(dateTo)));
  }

  return db
    .select({
      usage: materialUsageLogs,
      itemName: inventoryItems.name,
      itemBarcode: inventoryItems.barcode,
      staffName: staff.name,
    })
    .from(materialUsageLogs)
    .innerJoin(
      inventoryItems,
      eq(materialUsageLogs.inventoryItemId, inventoryItems.id)
    )
    .innerJoin(staff, eq(materialUsageLogs.staffId, staff.id))
    .where(and(...conditions))
    .orderBy(desc(materialUsageLogs.createdAt));
}
