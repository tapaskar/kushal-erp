import { pgEnum } from "drizzle-orm/pg-core";

// --- Auth & Roles ---
export const userRoleEnum = pgEnum("user_role", [
  "super_admin",
  "society_admin",
  "treasurer",
  "committee_member",
  "resident",
]);

// --- Society Structure ---
export const unitTypeEnum = pgEnum("unit_type", [
  "apartment",
  "shop",
  "office",
  "parking",
  "storage",
]);

export const occupancyStatusEnum = pgEnum("occupancy_status", [
  "owner_occupied",
  "tenant_occupied",
  "vacant",
]);

// --- Members ---
export const memberTypeEnum = pgEnum("member_type", [
  "owner",
  "tenant",
  "family_member",
]);

// --- Accounting ---
export const accountTypeEnum = pgEnum("account_type", [
  "asset",
  "liability",
  "income",
  "expense",
  "equity",
]);

export const journalStatusEnum = pgEnum("journal_status", [
  "draft",
  "posted",
  "reversed",
]);

export const debitCreditEnum = pgEnum("debit_credit", ["debit", "credit"]);

// --- Billing ---
export const chargeCalculationEnum = pgEnum("charge_calculation", [
  "per_sqft",
  "flat_rate",
  "percentage",
  "custom",
]);

export const invoiceStatusEnum = pgEnum("invoice_status", [
  "draft",
  "sent",
  "partially_paid",
  "paid",
  "overdue",
  "cancelled",
  "written_off",
]);

export const billingFrequencyEnum = pgEnum("billing_frequency", [
  "monthly",
  "quarterly",
  "half_yearly",
  "yearly",
  "one_time",
]);

// --- Payments ---
export const paymentMethodEnum = pgEnum("payment_method", [
  "razorpay",
  "upi",
  "neft",
  "rtgs",
  "cheque",
  "cash",
  "demand_draft",
]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "pending",
  "captured",
  "failed",
  "refunded",
]);

// --- Complaints ---
export const complaintStatusEnum = pgEnum("complaint_status", [
  "open",
  "assigned",
  "in_progress",
  "resolved",
  "closed",
  "reopened",
]);

export const complaintPriorityEnum = pgEnum("complaint_priority", [
  "low",
  "medium",
  "high",
  "urgent",
]);

// --- Notices ---
export const noticeCategoryEnum = pgEnum("notice_category", [
  "general",
  "maintenance",
  "meeting",
  "event",
  "emergency",
  "financial",
  "rule_update",
]);

// --- Inventory ---
export const assetCategoryEnum = pgEnum("asset_category", [
  "furniture",
  "electronics",
  "fire_safety",
  "dg_parts",
  "cleaning",
  "plumbing",
  "electrical",
  "garden",
  "sports",
  "other",
]);

export const assetConditionEnum = pgEnum("asset_condition", [
  "new",
  "good",
  "fair",
  "poor",
  "damaged",
  "disposed",
]);

export const stockMovementTypeEnum = pgEnum("stock_movement_type", [
  "stock_in",
  "stock_out",
]);

export const stockMovementReasonEnum = pgEnum("stock_movement_reason", [
  "purchase",
  "donation",
  "return",
  "consumed",
  "issued",
  "damaged",
  "disposed",
  "adjustment",
]);

export const maintenanceStatusEnum = pgEnum("maintenance_status", [
  "scheduled",
  "overdue",
  "completed",
  "cancelled",
]);

// --- Vendors ---
export const vendorTypeEnum = pgEnum("vendor_type", ["product", "service"]);

export const vendorStatusEnum = pgEnum("vendor_status", [
  "pending",
  "approved",
  "suspended",
  "blacklisted",
]);

export const vendorCategoryEnum = pgEnum("vendor_category", [
  // Product categories
  "housekeeping",
  "heavy_machinery",
  "furniture",
  "electronics",
  "fire_safety",
  "dg_parts",
  "garden",
  "sports",
  // Service categories
  "plumbing",
  "electrical",
  "civil",
  "it_amc",
  "security",
  "pest_control",
  "lift_maintenance",
  "painting",
  "other",
]);

// --- Procurement ---
export const prStatusEnum = pgEnum("pr_status", [
  "draft",
  "open",
  "rfq_sent",
  "quotes_received",
  "po_created",
  "completed",
  "cancelled",
]);

export const prPriorityEnum = pgEnum("pr_priority", [
  "low",
  "normal",
  "urgent",
]);

export const rfqStatusEnum = pgEnum("rfq_status", [
  "draft",
  "sent",
  "closed",
]);

export const quotationStatusEnum = pgEnum("quotation_status", [
  "submitted",
  "shortlisted",
  "rejected",
  "accepted",
]);

export const poStatusEnum = pgEnum("po_status", [
  "draft",
  "pending_l1",
  "pending_l2",
  "pending_l3",
  "approved",
  "issued",
  "delivered",
  "cancelled",
]);

// --- Staff Tracking ---
export const staffRoleEnum = pgEnum("staff_role", [
  "security",
  "housekeeping",
  "maintenance",
  "gardener",
  "electrician",
  "plumber",
  "supervisor",
]);

export const shiftStatusEnum = pgEnum("shift_status", [
  "scheduled",
  "checked_in",
  "checked_out",
  "missed",
  "cancelled",
]);

export const staffTaskStatusEnum = pgEnum("staff_task_status", [
  "pending",
  "accepted",
  "in_progress",
  "completed",
  "cancelled",
]);

export const staffTaskTypeEnum = pgEnum("staff_task_type", [
  "complaint",
  "maintenance",
  "patrol",
  "ad_hoc",
  "inspection",
]);

export const patrolStatusEnum = pgEnum("patrol_status", [
  "pending",
  "in_progress",
  "completed",
  "missed",
  "partial",
]);

export const locationSourceEnum = pgEnum("location_source", [
  "gps",
  "geofence_enter",
  "geofence_exit",
  "beacon",
  "manual",
]);

// --- Visitors ---
export const visitorTypeEnum = pgEnum("visitor_type", [
  "guest",
  "delivery",
  "cab",
  "vendor",
  "service",
  "other",
]);

export const visitorStatusEnum = pgEnum("visitor_status", [
  "expected",
  "checked_in",
  "checked_out",
  "rejected",
]);

// --- Security Incidents ---
export const incidentSeverityEnum = pgEnum("incident_severity", [
  "low",
  "medium",
  "high",
  "critical",
]);

export const incidentStatusEnum = pgEnum("incident_status", [
  "reported",
  "investigating",
  "resolved",
  "escalated",
]);

// --- Housekeeping ---
export const cleaningStatusEnum = pgEnum("cleaning_status", [
  "pending",
  "in_progress",
  "completed",
  "verified",
  "issue_reported",
]);

export const cleaningFrequencyEnum = pgEnum("cleaning_frequency", [
  "daily",
  "weekly",
  "biweekly",
  "monthly",
]);
