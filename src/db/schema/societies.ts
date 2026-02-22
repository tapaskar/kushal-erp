import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  numeric,
  boolean,
  timestamp,
  jsonb,
  index,
  unique,
} from "drizzle-orm/pg-core";
import { unitTypeEnum, occupancyStatusEnum } from "./enums";

export const societies = pgTable("societies", {
  id: uuid().defaultRandom().primaryKey(),
  name: varchar({ length: 255 }).notNull(),
  registrationNumber: varchar("registration_number", { length: 100 }),
  address: text().notNull(),
  city: varchar({ length: 100 }).notNull(),
  state: varchar({ length: 100 }).notNull(),
  pincode: varchar({ length: 6 }).notNull(),
  phone: varchar({ length: 15 }),
  email: varchar({ length: 255 }),
  gstNumber: varchar("gst_number", { length: 15 }),
  panNumber: varchar("pan_number", { length: 10 }),
  logoUrl: text("logo_url"),
  financialYearStartMonth: integer("financial_year_start_month")
    .notNull()
    .default(4),
  latePaymentInterestRate: numeric("late_payment_interest_rate", {
    precision: 5,
    scale: 2,
  })
    .notNull()
    .default("0"),
  latePaymentGraceDays: integer("late_payment_grace_days")
    .notNull()
    .default(0),
  billingDueDay: integer("billing_due_day").notNull().default(10),
  isGstRegistered: boolean("is_gst_registered").notNull().default(false),
  razorpayAccountId: varchar("razorpay_account_id", { length: 100 }),
  settings: jsonb()
    .$type<{
      whatsappEnabled?: boolean;
      emailEnabled?: boolean;
      autoReminders?: boolean;
      reminderDaysBefore?: number[];
      reminderDaysAfter?: number[];
    }>()
    .default({}),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const blocks = pgTable(
  "blocks",
  {
    id: uuid().defaultRandom().primaryKey(),
    societyId: uuid("society_id")
      .notNull()
      .references(() => societies.id, { onDelete: "cascade" }),
    name: varchar({ length: 100 }).notNull(),
    code: varchar({ length: 10 }).notNull(),
    totalFloors: integer("total_floors").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    unique("uq_block_code").on(t.societyId, t.code),
    index("idx_block_society").on(t.societyId),
  ]
);

export const floors = pgTable(
  "floors",
  {
    id: uuid().defaultRandom().primaryKey(),
    blockId: uuid("block_id")
      .notNull()
      .references(() => blocks.id, { onDelete: "cascade" }),
    societyId: uuid("society_id")
      .notNull()
      .references(() => societies.id),
    floorNumber: integer("floor_number").notNull(),
    name: varchar({ length: 50 }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    unique("uq_floor_block").on(t.blockId, t.floorNumber),
    index("idx_floor_society").on(t.societyId),
  ]
);

export const units = pgTable(
  "units",
  {
    id: uuid().defaultRandom().primaryKey(),
    societyId: uuid("society_id")
      .notNull()
      .references(() => societies.id),
    blockId: uuid("block_id")
      .notNull()
      .references(() => blocks.id),
    floorId: uuid("floor_id")
      .notNull()
      .references(() => floors.id),
    unitNumber: varchar("unit_number", { length: 20 }).notNull(),
    unitType: unitTypeEnum("unit_type").notNull().default("apartment"),
    areaSqft: numeric("area_sqft", { precision: 10, scale: 2 }),
    occupancyStatus: occupancyStatusEnum("occupancy_status")
      .notNull()
      .default("vacant"),
    isBillable: boolean("is_billable").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    unique("uq_unit_number").on(t.societyId, t.unitNumber),
    index("idx_unit_society").on(t.societyId),
    index("idx_unit_block").on(t.blockId),
  ]
);
