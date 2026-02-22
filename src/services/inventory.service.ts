"use server";

import { db } from "@/db";
import {
  inventoryItems,
  stockMovements,
  assetMaintenanceSchedules,
  users,
} from "@/db/schema";
import { eq, and, desc, asc, sql, lte } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/session";

// ─── Inventory Items ───

export async function getInventoryItems(societyId: string) {
  return db
    .select({
      item: inventoryItems,
      createdByUser: { name: users.name },
    })
    .from(inventoryItems)
    .leftJoin(users, eq(inventoryItems.createdBy, users.id))
    .where(
      and(
        eq(inventoryItems.societyId, societyId),
        eq(inventoryItems.isActive, true)
      )
    )
    .orderBy(asc(inventoryItems.category), asc(inventoryItems.name));
}

export async function getInventoryItem(itemId: string) {
  const [result] = await db
    .select({
      item: inventoryItems,
      createdByUser: { name: users.name },
    })
    .from(inventoryItems)
    .leftJoin(users, eq(inventoryItems.createdBy, users.id))
    .where(eq(inventoryItems.id, itemId))
    .limit(1);
  return result;
}

export async function getInventoryItemByBarcode(
  societyId: string,
  barcode: string
) {
  const [result] = await db
    .select({ id: inventoryItems.id, name: inventoryItems.name })
    .from(inventoryItems)
    .where(
      and(
        eq(inventoryItems.societyId, societyId),
        eq(inventoryItems.barcode, barcode)
      )
    )
    .limit(1);
  return result || null;
}

export async function createInventoryItem(data: {
  societyId: string;
  name: string;
  category:
    | "furniture"
    | "electronics"
    | "fire_safety"
    | "dg_parts"
    | "cleaning"
    | "plumbing"
    | "electrical"
    | "garden"
    | "sports"
    | "other";
  description?: string;
  barcode?: string;
  purchaseDate?: string;
  purchasePrice?: string;
  vendor?: string;
  warrantyExpiry?: string;
  location?: string;
  condition?: "new" | "good" | "fair" | "poor" | "damaged" | "disposed";
  quantity?: number;
  minStockLevel?: number;
  isConsumable?: boolean;
}) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  // Auto-generate barcode if not provided
  const barcode =
    data.barcode ||
    `INV-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;

  const [item] = await db
    .insert(inventoryItems)
    .values({
      societyId: data.societyId,
      barcode,
      name: data.name,
      category: data.category,
      description: data.description,
      purchaseDate: data.purchaseDate,
      purchasePrice: data.purchasePrice,
      vendor: data.vendor,
      warrantyExpiry: data.warrantyExpiry,
      location: data.location,
      condition: data.condition || "new",
      quantity: data.quantity ?? 1,
      minStockLevel: data.minStockLevel,
      isConsumable: data.isConsumable || false,
      createdBy: session.userId,
    })
    .returning();

  // Create initial stock-in movement if quantity > 0
  if ((data.quantity ?? 1) > 0) {
    await db.insert(stockMovements).values({
      societyId: data.societyId,
      inventoryItemId: item.id,
      movementType: "stock_in",
      reason: "purchase",
      quantity: data.quantity ?? 1,
      date: data.purchaseDate || new Date().toISOString().split("T")[0],
      notes: "Initial stock entry",
      performedBy: session.userId,
    });
  }

  revalidatePath("/inventory");
  return item;
}

export async function updateInventoryItem(
  itemId: string,
  data: Partial<{
    name: string;
    category:
      | "furniture"
      | "electronics"
      | "fire_safety"
      | "dg_parts"
      | "cleaning"
      | "plumbing"
      | "electrical"
      | "garden"
      | "sports"
      | "other";
    description: string;
    location: string;
    condition: "new" | "good" | "fair" | "poor" | "damaged" | "disposed";
    warrantyExpiry: string;
    minStockLevel: number;
    isActive: boolean;
  }>
) {
  const [updated] = await db
    .update(inventoryItems)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(inventoryItems.id, itemId))
    .returning();

  revalidatePath("/inventory");
  return updated;
}

// ─── Stock Movements ───

export async function createStockMovement(data: {
  societyId: string;
  inventoryItemId: string;
  movementType: "stock_in" | "stock_out";
  reason:
    | "purchase"
    | "donation"
    | "return"
    | "consumed"
    | "issued"
    | "damaged"
    | "disposed"
    | "adjustment";
  quantity: number;
  date: string;
  notes?: string;
}) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  // Get current item
  const [item] = await db
    .select()
    .from(inventoryItems)
    .where(eq(inventoryItems.id, data.inventoryItemId))
    .limit(1);

  if (!item) throw new Error("Item not found");

  // Validate stock-out quantity
  if (data.movementType === "stock_out" && item.quantity < data.quantity) {
    throw new Error(
      `Insufficient stock: ${item.quantity} available, ${data.quantity} requested`
    );
  }

  // Create movement
  const [movement] = await db
    .insert(stockMovements)
    .values({
      ...data,
      performedBy: session.userId,
    })
    .returning();

  // Update item quantity
  const newQuantity =
    data.movementType === "stock_in"
      ? item.quantity + data.quantity
      : item.quantity - data.quantity;

  const updates: Record<string, unknown> = {
    quantity: newQuantity,
    updatedAt: new Date(),
  };

  // Update condition if disposed
  if (data.reason === "disposed") {
    updates.condition = "disposed";
  }

  await db
    .update(inventoryItems)
    .set(updates)
    .where(eq(inventoryItems.id, data.inventoryItemId));

  revalidatePath("/inventory");
  return movement;
}

export async function getStockMovements(
  societyId: string,
  filters?: {
    inventoryItemId?: string;
    movementType?: "stock_in" | "stock_out";
  }
) {
  const conditions = [eq(stockMovements.societyId, societyId)];

  if (filters?.inventoryItemId) {
    conditions.push(
      eq(stockMovements.inventoryItemId, filters.inventoryItemId)
    );
  }
  if (filters?.movementType) {
    conditions.push(eq(stockMovements.movementType, filters.movementType));
  }

  return db
    .select({
      movement: stockMovements,
      itemName: inventoryItems.name,
      itemBarcode: inventoryItems.barcode,
      performedByUser: { name: users.name },
    })
    .from(stockMovements)
    .innerJoin(
      inventoryItems,
      eq(stockMovements.inventoryItemId, inventoryItems.id)
    )
    .leftJoin(users, eq(stockMovements.performedBy, users.id))
    .where(and(...conditions))
    .orderBy(desc(stockMovements.date), desc(stockMovements.createdAt));
}

// ─── Maintenance Schedules ───

export async function createMaintenanceSchedule(data: {
  societyId: string;
  inventoryItemId: string;
  maintenanceType: string;
  frequencyDays?: number;
  scheduledDate: string;
  vendor?: string;
  notes?: string;
}) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  const [schedule] = await db
    .insert(assetMaintenanceSchedules)
    .values({
      ...data,
      createdBy: session.userId,
    })
    .returning();

  revalidatePath("/inventory");
  return schedule;
}

export async function completeMaintenanceSchedule(
  scheduleId: string,
  data: {
    completedDate: string;
    cost?: string;
    vendor?: string;
    notes?: string;
  }
) {
  // Get current schedule
  const [schedule] = await db
    .select()
    .from(assetMaintenanceSchedules)
    .where(eq(assetMaintenanceSchedules.id, scheduleId))
    .limit(1);

  if (!schedule) throw new Error("Schedule not found");

  // Mark completed
  const [updated] = await db
    .update(assetMaintenanceSchedules)
    .set({
      status: "completed",
      completedDate: data.completedDate,
      cost: data.cost,
      vendor: data.vendor || schedule.vendor,
      notes: data.notes,
      updatedAt: new Date(),
    })
    .where(eq(assetMaintenanceSchedules.id, scheduleId))
    .returning();

  // Auto-create next schedule if recurring
  if (schedule.frequencyDays) {
    const nextDate = new Date(data.completedDate);
    nextDate.setDate(nextDate.getDate() + schedule.frequencyDays);

    await db.insert(assetMaintenanceSchedules).values({
      societyId: schedule.societyId,
      inventoryItemId: schedule.inventoryItemId,
      maintenanceType: schedule.maintenanceType,
      frequencyDays: schedule.frequencyDays,
      scheduledDate: nextDate.toISOString().split("T")[0],
      vendor: schedule.vendor,
      createdBy: schedule.createdBy,
    });
  }

  revalidatePath("/inventory");
  return updated;
}

export async function getMaintenanceSchedules(
  societyId: string,
  filters?: { inventoryItemId?: string }
) {
  const conditions = [eq(assetMaintenanceSchedules.societyId, societyId)];

  if (filters?.inventoryItemId) {
    conditions.push(
      eq(assetMaintenanceSchedules.inventoryItemId, filters.inventoryItemId)
    );
  }

  return db
    .select({
      schedule: assetMaintenanceSchedules,
      itemName: inventoryItems.name,
      itemBarcode: inventoryItems.barcode,
    })
    .from(assetMaintenanceSchedules)
    .innerJoin(
      inventoryItems,
      eq(assetMaintenanceSchedules.inventoryItemId, inventoryItems.id)
    )
    .where(and(...conditions))
    .orderBy(asc(assetMaintenanceSchedules.scheduledDate));
}

export async function getUpcomingMaintenance(
  societyId: string,
  withinDays: number = 30
) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + withinDays);

  return db
    .select({
      schedule: assetMaintenanceSchedules,
      itemName: inventoryItems.name,
      itemBarcode: inventoryItems.barcode,
    })
    .from(assetMaintenanceSchedules)
    .innerJoin(
      inventoryItems,
      eq(assetMaintenanceSchedules.inventoryItemId, inventoryItems.id)
    )
    .where(
      and(
        eq(assetMaintenanceSchedules.societyId, societyId),
        eq(assetMaintenanceSchedules.status, "scheduled"),
        lte(
          assetMaintenanceSchedules.scheduledDate,
          futureDate.toISOString().split("T")[0]
        )
      )
    )
    .orderBy(asc(assetMaintenanceSchedules.scheduledDate));
}

// ─── Dashboard Stats ───

export async function getInventoryStats(societyId: string) {
  const [stats] = await db
    .select({
      totalItems: sql<number>`count(*)`,
      totalValue: sql<string>`coalesce(sum(${inventoryItems.purchasePrice}::numeric * ${inventoryItems.quantity}), 0)`,
      lowStockCount: sql<number>`count(*) filter (where ${inventoryItems.isConsumable} = true and ${inventoryItems.quantity} <= coalesce(${inventoryItems.minStockLevel}, 0))`,
      disposedCount: sql<number>`count(*) filter (where ${inventoryItems.condition} = 'disposed')`,
    })
    .from(inventoryItems)
    .where(
      and(
        eq(inventoryItems.societyId, societyId),
        eq(inventoryItems.isActive, true)
      )
    );

  // Get upcoming maintenance count
  const [maintStats] = await db
    .select({
      count: sql<number>`count(*)`,
    })
    .from(assetMaintenanceSchedules)
    .where(
      and(
        eq(assetMaintenanceSchedules.societyId, societyId),
        eq(assetMaintenanceSchedules.status, "scheduled")
      )
    );

  return {
    totalItems: stats.totalItems,
    totalValue: parseFloat(stats.totalValue),
    lowStockCount: stats.lowStockCount,
    disposedCount: stats.disposedCount,
    maintenanceDueCount: maintStats.count,
  };
}

export async function getLowStockItems(societyId: string) {
  return db
    .select()
    .from(inventoryItems)
    .where(
      and(
        eq(inventoryItems.societyId, societyId),
        eq(inventoryItems.isConsumable, true),
        eq(inventoryItems.isActive, true),
        sql`${inventoryItems.quantity} <= coalesce(${inventoryItems.minStockLevel}, 0)`
      )
    )
    .orderBy(asc(inventoryItems.name));
}
