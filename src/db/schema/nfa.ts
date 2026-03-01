import {
  pgTable,
  uuid,
  varchar,
  text,
  numeric,
  integer,
  timestamp,
  index,
  unique,
} from "drizzle-orm/pg-core";
import { nfaStatusEnum, nfaApprovalActionEnum, vendorCategoryEnum, prPriorityEnum } from "./enums";
import { users } from "./auth";
import { purchaseOrders } from "./procurement";

// ─── Notes for Approval (NFA) ───
// Pre-approval mechanism for procurement: admin creates, exec members vote, treasurer approves

export const notesForApproval = pgTable(
  "notes_for_approval",
  {
    id: uuid().defaultRandom().primaryKey(),
    societyId: uuid("society_id").notNull(),
    referenceNo: varchar("reference_no", { length: 50 }).notNull(),
    title: varchar({ length: 255 }).notNull(),
    description: text(),
    category: vendorCategoryEnum(),
    priority: prPriorityEnum().notNull().default("normal"),
    status: nfaStatusEnum().notNull().default("draft"),
    totalEstimatedAmount: numeric("total_estimated_amount", {
      precision: 15,
      scale: 2,
    }),
    // Quorum tracking
    requiredExecApprovals: integer("required_exec_approvals").notNull().default(0),
    currentExecApprovals: integer("current_exec_approvals").notNull().default(0),
    currentExecRejections: integer("current_exec_rejections").notNull().default(0),
    // Treasurer approval
    treasurerApprovedBy: uuid("treasurer_approved_by").references(() => users.id),
    treasurerApprovedAt: timestamp("treasurer_approved_at", { withTimezone: true }),
    treasurerRemarks: text("treasurer_remarks"),
    // Link to PO after creation
    purchaseOrderId: uuid("purchase_order_id").references(() => purchaseOrders.id),
    // Creator
    createdBy: uuid("created_by")
      .notNull()
      .references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    unique("uq_nfa_reference").on(t.societyId, t.referenceNo),
    index("idx_nfa_society").on(t.societyId),
    index("idx_nfa_status").on(t.societyId, t.status),
    index("idx_nfa_creator").on(t.createdBy),
  ]
);

// ─── NFA Items ───
// Line items with L1/L2/L3 vendor quotes

export const nfaItems = pgTable(
  "nfa_items",
  {
    id: uuid().defaultRandom().primaryKey(),
    nfaId: uuid("nfa_id")
      .notNull()
      .references(() => notesForApproval.id, { onDelete: "cascade" }),
    itemName: varchar("item_name", { length: 255 }).notNull(),
    specification: text(),
    quantity: numeric({ precision: 10, scale: 2 }).notNull(),
    unit: varchar({ length: 50 }).default("pcs"),
    // L1 quote (lowest price)
    l1VendorName: varchar("l1_vendor_name", { length: 255 }),
    l1UnitPrice: numeric("l1_unit_price", { precision: 15, scale: 2 }),
    l1TotalPrice: numeric("l1_total_price", { precision: 15, scale: 2 }),
    // L2 quote
    l2VendorName: varchar("l2_vendor_name", { length: 255 }),
    l2UnitPrice: numeric("l2_unit_price", { precision: 15, scale: 2 }),
    l2TotalPrice: numeric("l2_total_price", { precision: 15, scale: 2 }),
    // L3 quote
    l3VendorName: varchar("l3_vendor_name", { length: 255 }),
    l3UnitPrice: numeric("l3_unit_price", { precision: 15, scale: 2 }),
    l3TotalPrice: numeric("l3_total_price", { precision: 15, scale: 2 }),
    // Selected quote for PO
    selectedQuote: varchar("selected_quote", { length: 5 }), // 'l1' | 'l2' | 'l3'
    justification: text(), // required if not L1
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("idx_nfa_items_nfa").on(t.nfaId)]
);

// ─── NFA Approvals ───
// Individual approval/rejection records from exec members and treasurer

export const nfaApprovals = pgTable(
  "nfa_approvals",
  {
    id: uuid().defaultRandom().primaryKey(),
    nfaId: uuid("nfa_id")
      .notNull()
      .references(() => notesForApproval.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    userName: varchar("user_name", { length: 255 }).notNull(),
    userRole: varchar("user_role", { length: 50 }).notNull(),
    action: nfaApprovalActionEnum().notNull(),
    remarks: text(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    unique("uq_nfa_approval_user").on(t.nfaId, t.userId),
    index("idx_nfa_approvals_nfa").on(t.nfaId),
    index("idx_nfa_approvals_user").on(t.userId),
  ]
);
