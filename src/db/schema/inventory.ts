import {
  pgTable,
  uuid,
  varchar,
  text,
  numeric,
  integer,
  date,
  boolean,
  timestamp,
  index,
  unique,
} from "drizzle-orm/pg-core";
import {
  assetCategoryEnum,
  assetConditionEnum,
  stockMovementTypeEnum,
  stockMovementReasonEnum,
  maintenanceStatusEnum,
} from "./enums";

// ─── Inventory Items ───

export const inventoryItems = pgTable(
  "inventory_items",
  {
    id: uuid().defaultRandom().primaryKey(),
    societyId: uuid("society_id").notNull(),
    barcode: varchar({ length: 100 }).notNull(),
    name: varchar({ length: 255 }).notNull(),
    category: assetCategoryEnum().notNull(),
    description: text(),
    purchaseDate: date("purchase_date"),
    purchasePrice: numeric("purchase_price", { precision: 15, scale: 2 }),
    vendor: varchar({ length: 255 }),
    warrantyExpiry: date("warranty_expiry"),
    location: varchar({ length: 255 }),
    condition: assetConditionEnum().notNull().default("new"),
    quantity: integer().notNull().default(1),
    minStockLevel: integer("min_stock_level"),
    isConsumable: boolean("is_consumable").notNull().default(false),
    accountId: uuid("account_id"),
    isActive: boolean("is_active").notNull().default(true),
    createdBy: uuid("created_by"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    unique("uq_inventory_barcode").on(t.societyId, t.barcode),
    index("idx_inventory_society").on(t.societyId),
    index("idx_inventory_category").on(t.societyId, t.category),
    index("idx_inventory_barcode_lookup").on(t.barcode),
    index("idx_inventory_condition").on(t.societyId, t.condition),
  ]
);

// ─── Stock Movements ───

export const stockMovements = pgTable(
  "stock_movements",
  {
    id: uuid().defaultRandom().primaryKey(),
    societyId: uuid("society_id").notNull(),
    inventoryItemId: uuid("inventory_item_id")
      .notNull()
      .references(() => inventoryItems.id, { onDelete: "restrict" }),
    movementType: stockMovementTypeEnum("movement_type").notNull(),
    reason: stockMovementReasonEnum().notNull(),
    quantity: integer().notNull(),
    date: date().notNull(),
    notes: text(),
    performedBy: uuid("performed_by"),
    journalEntryId: uuid("journal_entry_id"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("idx_sm_society").on(t.societyId),
    index("idx_sm_item").on(t.inventoryItemId),
    index("idx_sm_date").on(t.societyId, t.date),
    index("idx_sm_type").on(t.societyId, t.movementType),
  ]
);

// ─── Asset Maintenance Schedules ───

export const assetMaintenanceSchedules = pgTable(
  "asset_maintenance_schedules",
  {
    id: uuid().defaultRandom().primaryKey(),
    societyId: uuid("society_id").notNull(),
    inventoryItemId: uuid("inventory_item_id")
      .notNull()
      .references(() => inventoryItems.id, { onDelete: "cascade" }),
    maintenanceType: varchar("maintenance_type", { length: 255 }).notNull(),
    frequencyDays: integer("frequency_days"),
    scheduledDate: date("scheduled_date").notNull(),
    completedDate: date("completed_date"),
    status: maintenanceStatusEnum().notNull().default("scheduled"),
    cost: numeric({ precision: 15, scale: 2 }),
    vendor: varchar({ length: 255 }),
    notes: text(),
    journalEntryId: uuid("journal_entry_id"),
    createdBy: uuid("created_by"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("idx_ams_society").on(t.societyId),
    index("idx_ams_item").on(t.inventoryItemId),
    index("idx_ams_status").on(t.societyId, t.status),
    index("idx_ams_scheduled").on(t.societyId, t.scheduledDate),
  ]
);
