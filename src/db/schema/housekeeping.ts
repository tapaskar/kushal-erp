import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  date,
  boolean,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { cleaningStatusEnum, cleaningFrequencyEnum } from "./enums";
import { societies } from "./societies";
import { staff } from "./staff";
import { shifts } from "./staff";
import { inventoryItems } from "./inventory";

// ─── Cleaning Zones ───

export const cleaningZones = pgTable(
  "cleaning_zones",
  {
    id: uuid().defaultRandom().primaryKey(),
    societyId: uuid("society_id")
      .notNull()
      .references(() => societies.id, { onDelete: "cascade" }),
    name: varchar({ length: 255 }).notNull(),
    floor: integer(),
    blockId: uuid("block_id"),
    zoneType: varchar("zone_type", { length: 50 })
      .notNull()
      .default("common_area"),
    frequency: cleaningFrequencyEnum().notNull().default("daily"),
    description: text(),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("idx_cz_society").on(t.societyId),
    index("idx_cz_block").on(t.blockId),
    index("idx_cz_type").on(t.societyId, t.zoneType),
  ]
);

// ─── Cleaning Logs ───

export const cleaningLogs = pgTable(
  "cleaning_logs",
  {
    id: uuid().defaultRandom().primaryKey(),
    societyId: uuid("society_id")
      .notNull()
      .references(() => societies.id, { onDelete: "cascade" }),
    zoneId: uuid("zone_id")
      .notNull()
      .references(() => cleaningZones.id, { onDelete: "cascade" }),
    staffId: uuid("staff_id").references(() => staff.id),
    shiftId: uuid("shift_id").references(() => shifts.id),
    scheduledDate: date("scheduled_date").notNull(),
    status: cleaningStatusEnum().notNull().default("pending"),
    startedAt: timestamp("started_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    beforePhotoUrl: text("before_photo_url"),
    afterPhotoUrl: text("after_photo_url"),
    notes: text(),
    verifiedBy: uuid("verified_by"),
    verifiedAt: timestamp("verified_at", { withTimezone: true }),
    rating: integer(),
    ratingComment: text("rating_comment"),
    ratedBy: uuid("rated_by"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("idx_cl_society").on(t.societyId),
    index("idx_cl_zone").on(t.zoneId),
    index("idx_cl_staff").on(t.staffId),
    index("idx_cl_date").on(t.societyId, t.scheduledDate),
    index("idx_cl_status").on(t.societyId, t.status),
  ]
);

// ─── Supply Requests ───

export const supplyRequests = pgTable(
  "supply_requests",
  {
    id: uuid().defaultRandom().primaryKey(),
    societyId: uuid("society_id")
      .notNull()
      .references(() => societies.id, { onDelete: "cascade" }),
    staffId: uuid("staff_id")
      .notNull()
      .references(() => staff.id),
    itemName: varchar("item_name", { length: 255 }).notNull(),
    quantity: integer().notNull().default(1),
    urgency: varchar({ length: 20 }).notNull().default("normal"),
    reason: text(),
    status: varchar({ length: 20 }).notNull().default("pending"),
    approvedBy: uuid("approved_by"),
    fulfilledAt: timestamp("fulfilled_at", { withTimezone: true }),
    inventoryItemId: uuid("inventory_item_id").references(
      () => inventoryItems.id
    ),
    notes: text(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("idx_sr_society").on(t.societyId),
    index("idx_sr_staff").on(t.staffId),
    index("idx_sr_status").on(t.societyId, t.status),
  ]
);
