import {
  pgTable,
  uuid,
  varchar,
  text,
  numeric,
  date,
  boolean,
  timestamp,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import { paymentMethodEnum, paymentStatusEnum } from "./enums";
import { invoices } from "./billing";

export const payments = pgTable(
  "payments",
  {
    id: uuid().defaultRandom().primaryKey(),
    societyId: uuid("society_id").notNull(),
    invoiceId: uuid("invoice_id")
      .notNull()
      .references(() => invoices.id),
    unitId: uuid("unit_id").notNull(),
    memberId: uuid("member_id").notNull(),
    receiptNumber: varchar("receipt_number", { length: 50 }).notNull(),
    amount: numeric({ precision: 15, scale: 2 }).notNull(),
    paymentDate: date("payment_date").notNull(),
    paymentMethod: paymentMethodEnum("payment_method").notNull(),
    status: paymentStatusEnum().notNull().default("pending"),
    razorpayOrderId: varchar("razorpay_order_id", { length: 100 }),
    razorpayPaymentId: varchar("razorpay_payment_id", { length: 100 }),
    razorpaySignature: varchar("razorpay_signature", { length: 255 }),
    instrumentNumber: varchar("instrument_number", { length: 50 }),
    instrumentDate: date("instrument_date"),
    bankName: varchar("bank_name", { length: 100 }),
    transactionReference: varchar("transaction_reference", { length: 100 }),
    journalEntryId: uuid("journal_entry_id"),
    webhookPayload: jsonb("webhook_payload"),
    notes: text(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("idx_payment_society").on(t.societyId),
    index("idx_payment_invoice").on(t.invoiceId),
    index("idx_payment_razorpay").on(t.razorpayPaymentId),
    index("idx_payment_date").on(t.societyId, t.paymentDate),
  ]
);

export const paymentLinks = pgTable("payment_links", {
  id: uuid().defaultRandom().primaryKey(),
  societyId: uuid("society_id").notNull(),
  invoiceId: uuid("invoice_id").notNull(),
  razorpayLinkId: varchar("razorpay_link_id", { length: 100 }).notNull(),
  shortUrl: text("short_url").notNull(),
  amount: numeric({ precision: 15, scale: 2 }).notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  isUsed: boolean("is_used").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
