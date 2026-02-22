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
  chargeCalculationEnum,
  invoiceStatusEnum,
  billingFrequencyEnum,
} from "./enums";
import { accounts } from "./accounts";
import { units } from "./societies";
import { members } from "./members";

export const chargeHeads = pgTable(
  "charge_heads",
  {
    id: uuid().defaultRandom().primaryKey(),
    societyId: uuid("society_id").notNull(),
    name: varchar({ length: 255 }).notNull(),
    code: varchar({ length: 20 }).notNull(),
    calculationType: chargeCalculationEnum("calculation_type").notNull(),
    rate: numeric({ precision: 12, scale: 2 }).notNull(),
    baseChargeHeadId: uuid("base_charge_head_id"),
    frequency: billingFrequencyEnum().notNull().default("monthly"),
    incomeAccountId: uuid("income_account_id")
      .notNull()
      .references(() => accounts.id),
    isGstApplicable: boolean("is_gst_applicable").notNull().default(false),
    gstRate: numeric("gst_rate", { precision: 5, scale: 2 }).default("18"),
    isActive: boolean("is_active").notNull().default(true),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    unique("uq_charge_head_code").on(t.societyId, t.code),
    index("idx_charge_head_society").on(t.societyId),
  ]
);

export const unitChargeOverrides = pgTable(
  "unit_charge_overrides",
  {
    id: uuid().defaultRandom().primaryKey(),
    societyId: uuid("society_id").notNull(),
    unitId: uuid("unit_id")
      .notNull()
      .references(() => units.id),
    chargeHeadId: uuid("charge_head_id")
      .notNull()
      .references(() => chargeHeads.id),
    overrideRate: numeric("override_rate", { precision: 12, scale: 2 }).notNull(),
    reason: text(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [unique("uq_unit_charge").on(t.unitId, t.chargeHeadId)]
);

export const invoices = pgTable(
  "invoices",
  {
    id: uuid().defaultRandom().primaryKey(),
    societyId: uuid("society_id").notNull(),
    unitId: uuid("unit_id")
      .notNull()
      .references(() => units.id),
    memberId: uuid("member_id")
      .notNull()
      .references(() => members.id),
    invoiceNumber: varchar("invoice_number", { length: 50 }).notNull(),
    billingMonth: integer("billing_month").notNull(),
    billingYear: integer("billing_year").notNull(),
    issueDate: date("issue_date").notNull(),
    dueDate: date("due_date").notNull(),
    subtotal: numeric({ precision: 15, scale: 2 }).notNull().default("0"),
    gstAmount: numeric("gst_amount", { precision: 15, scale: 2 })
      .notNull()
      .default("0"),
    interestAmount: numeric("interest_amount", { precision: 15, scale: 2 })
      .notNull()
      .default("0"),
    totalAmount: numeric("total_amount", { precision: 15, scale: 2 }).notNull(),
    paidAmount: numeric("paid_amount", { precision: 15, scale: 2 })
      .notNull()
      .default("0"),
    balanceDue: numeric("balance_due", { precision: 15, scale: 2 }).notNull(),
    status: invoiceStatusEnum().notNull().default("draft"),
    previousBalance: numeric("previous_balance", { precision: 15, scale: 2 })
      .notNull()
      .default("0"),
    journalEntryId: uuid("journal_entry_id"),
    pdfUrl: text("pdf_url"),
    razorpayOrderId: varchar("razorpay_order_id", { length: 100 }),
    razorpayPaymentLinkId: varchar("razorpay_payment_link_id", {
      length: 100,
    }),
    notes: text(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    unique("uq_invoice_number").on(t.societyId, t.invoiceNumber),
    index("idx_invoice_society").on(t.societyId),
    index("idx_invoice_unit").on(t.unitId),
    index("idx_invoice_period").on(t.societyId, t.billingYear, t.billingMonth),
    index("idx_invoice_status").on(t.societyId, t.status),
    index("idx_invoice_due").on(t.societyId, t.dueDate),
  ]
);

export const invoiceLineItems = pgTable(
  "invoice_line_items",
  {
    id: uuid().defaultRandom().primaryKey(),
    invoiceId: uuid("invoice_id")
      .notNull()
      .references(() => invoices.id, { onDelete: "cascade" }),
    societyId: uuid("society_id").notNull(),
    chargeHeadId: uuid("charge_head_id")
      .notNull()
      .references(() => chargeHeads.id),
    description: varchar({ length: 255 }).notNull(),
    areaSqft: numeric("area_sqft", { precision: 10, scale: 2 }),
    rate: numeric({ precision: 12, scale: 2 }).notNull(),
    quantity: numeric({ precision: 10, scale: 2 }).notNull().default("1"),
    amount: numeric({ precision: 15, scale: 2 }).notNull(),
    gstRate: numeric("gst_rate", { precision: 5, scale: 2 }).default("0"),
    gstAmount: numeric("gst_amount", { precision: 15, scale: 2 }).default("0"),
    totalAmount: numeric("total_amount", { precision: 15, scale: 2 }).notNull(),
    incomeAccountId: uuid("income_account_id").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("idx_line_item_invoice").on(t.invoiceId)]
);
