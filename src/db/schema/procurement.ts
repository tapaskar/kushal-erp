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
  vendorTypeEnum,
  vendorStatusEnum,
  vendorCategoryEnum,
  prStatusEnum,
  prPriorityEnum,
  rfqStatusEnum,
  quotationStatusEnum,
  poStatusEnum,
} from "./enums";
import { users } from "./auth";

// ─── Vendors ───

export const vendors = pgTable(
  "vendors",
  {
    id: uuid().defaultRandom().primaryKey(),
    societyId: uuid("society_id").notNull(),
    name: varchar({ length: 255 }).notNull(),
    contactPerson: varchar("contact_person", { length: 255 }),
    email: varchar({ length: 255 }).notNull(),
    phone: varchar({ length: 20 }).notNull(),
    address: text(),
    city: varchar({ length: 100 }),
    gstin: varchar({ length: 15 }),
    pan: varchar({ length: 10 }),
    bankName: varchar("bank_name", { length: 255 }),
    accountNumber: varchar("account_number", { length: 50 }),
    ifscCode: varchar("ifsc_code", { length: 11 }),
    vendorType: vendorTypeEnum("vendor_type").notNull(),
    status: vendorStatusEnum().notNull().default("pending"),
    notes: text(),
    isActive: boolean("is_active").notNull().default(true),
    createdBy: uuid("created_by").references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("idx_vendors_society").on(t.societyId),
    index("idx_vendors_status").on(t.societyId, t.status),
    index("idx_vendors_type").on(t.societyId, t.vendorType),
  ]
);

export const vendorCategories = pgTable(
  "vendor_categories",
  {
    id: uuid().defaultRandom().primaryKey(),
    vendorId: uuid("vendor_id")
      .notNull()
      .references(() => vendors.id, { onDelete: "cascade" }),
    category: vendorCategoryEnum().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    unique("uq_vendor_category").on(t.vendorId, t.category),
    index("idx_vc_vendor").on(t.vendorId),
    index("idx_vc_category").on(t.category),
  ]
);

// ─── Purchase Requests ───

export const purchaseRequests = pgTable(
  "purchase_requests",
  {
    id: uuid().defaultRandom().primaryKey(),
    societyId: uuid("society_id").notNull(),
    referenceNo: varchar("reference_no", { length: 50 }).notNull(),
    title: varchar({ length: 255 }).notNull(),
    description: text(),
    category: vendorCategoryEnum().notNull(),
    priority: prPriorityEnum().notNull().default("normal"),
    status: prStatusEnum().notNull().default("open"),
    requiredByDate: date("required_by_date"),
    requestedBy: uuid("requested_by").references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    unique("uq_pr_reference").on(t.societyId, t.referenceNo),
    index("idx_pr_society").on(t.societyId),
    index("idx_pr_status").on(t.societyId, t.status),
    index("idx_pr_category").on(t.societyId, t.category),
  ]
);

export const purchaseRequestItems = pgTable(
  "purchase_request_items",
  {
    id: uuid().defaultRandom().primaryKey(),
    purchaseRequestId: uuid("purchase_request_id")
      .notNull()
      .references(() => purchaseRequests.id, { onDelete: "cascade" }),
    itemName: varchar("item_name", { length: 255 }).notNull(),
    specification: text(),
    quantity: numeric({ precision: 10, scale: 2 }).notNull(),
    unit: varchar({ length: 50 }).notNull().default("pcs"),
    estimatedUnitPrice: numeric("estimated_unit_price", {
      precision: 15,
      scale: 2,
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("idx_pri_request").on(t.purchaseRequestId)]
);

// ─── RFQ (Request for Quotation) ───

export const rfqs = pgTable(
  "rfqs",
  {
    id: uuid().defaultRandom().primaryKey(),
    societyId: uuid("society_id").notNull(),
    purchaseRequestId: uuid("purchase_request_id")
      .notNull()
      .references(() => purchaseRequests.id, { onDelete: "restrict" }),
    referenceNo: varchar("reference_no", { length: 50 }).notNull(),
    deadline: date().notNull(),
    terms: text(),
    status: rfqStatusEnum().notNull().default("draft"),
    sentAt: timestamp("sent_at", { withTimezone: true }),
    createdBy: uuid("created_by").references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    unique("uq_rfq_reference").on(t.societyId, t.referenceNo),
    index("idx_rfq_society").on(t.societyId),
    index("idx_rfq_pr").on(t.purchaseRequestId),
    index("idx_rfq_status").on(t.societyId, t.status),
  ]
);

export const rfqVendors = pgTable(
  "rfq_vendors",
  {
    id: uuid().defaultRandom().primaryKey(),
    rfqId: uuid("rfq_id")
      .notNull()
      .references(() => rfqs.id, { onDelete: "cascade" }),
    vendorId: uuid("vendor_id")
      .notNull()
      .references(() => vendors.id, { onDelete: "restrict" }),
    // Unique token embedded in the email link — authenticates vendor portal access
    vendorToken: uuid("vendor_token").defaultRandom().notNull().unique(),
    invitedAt: timestamp("invited_at", { withTimezone: true }),
    emailSentAt: timestamp("email_sent_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    unique("uq_rfq_vendor").on(t.rfqId, t.vendorId),
    index("idx_rfqv_rfq").on(t.rfqId),
    index("idx_rfqv_vendor").on(t.vendorId),
    index("idx_rfqv_token").on(t.vendorToken),
  ]
);

// ─── Quotations ───

export const quotations = pgTable(
  "quotations",
  {
    id: uuid().defaultRandom().primaryKey(),
    societyId: uuid("society_id").notNull(),
    rfqId: uuid("rfq_id")
      .notNull()
      .references(() => rfqs.id, { onDelete: "restrict" }),
    vendorId: uuid("vendor_id")
      .notNull()
      .references(() => vendors.id, { onDelete: "restrict" }),
    referenceNo: varchar("reference_no", { length: 50 }).notNull(),
    status: quotationStatusEnum().notNull().default("submitted"),
    validUntil: date("valid_until"),
    deliveryDays: integer("delivery_days"),
    paymentTerms: varchar("payment_terms", { length: 500 }),
    subtotal: numeric({ precision: 15, scale: 2 }),
    gstAmount: numeric("gst_amount", { precision: 15, scale: 2 }),
    totalAmount: numeric("total_amount", { precision: 15, scale: 2 }),
    rank: integer(), // 1=L1, 2=L2, 3=L3
    notes: text(),
    submittedAt: timestamp("submitted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    unique("uq_quotation_reference").on(t.societyId, t.referenceNo),
    unique("uq_quotation_rfq_vendor").on(t.rfqId, t.vendorId),
    index("idx_quot_rfq").on(t.rfqId),
    index("idx_quot_vendor").on(t.vendorId),
    index("idx_quot_status").on(t.societyId, t.status),
  ]
);

export const quotationItems = pgTable(
  "quotation_items",
  {
    id: uuid().defaultRandom().primaryKey(),
    quotationId: uuid("quotation_id")
      .notNull()
      .references(() => quotations.id, { onDelete: "cascade" }),
    prItemId: uuid("pr_item_id").references(() => purchaseRequestItems.id),
    itemName: varchar("item_name", { length: 255 }).notNull(),
    quantity: numeric({ precision: 10, scale: 2 }).notNull(),
    unit: varchar({ length: 50 }).notNull(),
    unitPrice: numeric("unit_price", { precision: 15, scale: 2 }).notNull(),
    gstPercent: numeric("gst_percent", { precision: 5, scale: 2 })
      .notNull()
      .default("0"),
    lineTotal: numeric("line_total", { precision: 15, scale: 2 }).notNull(),
    notes: text(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("idx_qi_quotation").on(t.quotationId)]
);

// ─── Purchase Orders ───

export const purchaseOrders = pgTable(
  "purchase_orders",
  {
    id: uuid().defaultRandom().primaryKey(),
    societyId: uuid("society_id").notNull(),
    rfqId: uuid("rfq_id")
      .notNull()
      .references(() => rfqs.id, { onDelete: "restrict" }),
    quotationId: uuid("quotation_id")
      .notNull()
      .references(() => quotations.id, { onDelete: "restrict" }),
    vendorId: uuid("vendor_id")
      .notNull()
      .references(() => vendors.id, { onDelete: "restrict" }),
    referenceNo: varchar("reference_no", { length: 50 }).notNull(),
    status: poStatusEnum().notNull().default("pending_l1"),
    // Justification when not selecting L1
    approvalRemark: text("approval_remark"),
    // 3-level approval chain
    l1ApprovedBy: uuid("l1_approved_by").references(() => users.id),
    l1ApprovedAt: timestamp("l1_approved_at", { withTimezone: true }),
    l2ApprovedBy: uuid("l2_approved_by").references(() => users.id),
    l2ApprovedAt: timestamp("l2_approved_at", { withTimezone: true }),
    l3ApprovedBy: uuid("l3_approved_by").references(() => users.id),
    l3ApprovedAt: timestamp("l3_approved_at", { withTimezone: true }),
    totalAmount: numeric("total_amount", { precision: 15, scale: 2 }),
    deliveryDays: integer("delivery_days"),
    paymentTerms: varchar("payment_terms", { length: 500 }),
    notes: text(),
    issuedAt: timestamp("issued_at", { withTimezone: true }),
    deliveredAt: timestamp("delivered_at", { withTimezone: true }),
    createdBy: uuid("created_by").references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    unique("uq_po_reference").on(t.societyId, t.referenceNo),
    index("idx_po_society").on(t.societyId),
    index("idx_po_status").on(t.societyId, t.status),
    index("idx_po_vendor").on(t.vendorId),
    index("idx_po_rfq").on(t.rfqId),
  ]
);
