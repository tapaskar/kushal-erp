import {
  pgTable,
  uuid,
  varchar,
  text,
  numeric,
  boolean,
  timestamp,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import {
  visitorTypeEnum,
  visitorStatusEnum,
  incidentSeverityEnum,
  incidentStatusEnum,
} from "./enums";
import { societies } from "./societies";
import { staff } from "./staff";

// ─── Visitor Logs ───

export const visitorLogs = pgTable(
  "visitor_logs",
  {
    id: uuid().defaultRandom().primaryKey(),
    societyId: uuid("society_id")
      .notNull()
      .references(() => societies.id, { onDelete: "cascade" }),
    staffId: uuid("staff_id").references(() => staff.id),
    visitorName: varchar("visitor_name", { length: 255 }).notNull(),
    visitorPhone: varchar("visitor_phone", { length: 15 }),
    visitorType: visitorTypeEnum("visitor_type").notNull().default("guest"),
    unitId: uuid("unit_id"),
    purpose: varchar({ length: 500 }),
    vehicleNumber: varchar("vehicle_number", { length: 20 }),
    photoUrl: text("photo_url"),
    idProofUrl: text("id_proof_url"),
    status: visitorStatusEnum().notNull().default("checked_in"),
    expectedAt: timestamp("expected_at", { withTimezone: true }),
    checkInAt: timestamp("check_in_at", { withTimezone: true }),
    checkOutAt: timestamp("check_out_at", { withTimezone: true }),
    checkInGate: varchar("check_in_gate", { length: 100 }),
    checkOutGate: varchar("check_out_gate", { length: 100 }),
    approvedBy: uuid("approved_by"),
    notes: text(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("idx_vl_society").on(t.societyId),
    index("idx_vl_staff").on(t.staffId),
    index("idx_vl_status").on(t.societyId, t.status),
    index("idx_vl_date").on(t.societyId, t.createdAt),
    index("idx_vl_unit").on(t.unitId),
  ]
);

// ─── Incidents ───

export const incidents = pgTable(
  "incidents",
  {
    id: uuid().defaultRandom().primaryKey(),
    societyId: uuid("society_id")
      .notNull()
      .references(() => societies.id, { onDelete: "cascade" }),
    reportedBy: uuid("reported_by")
      .notNull()
      .references(() => staff.id),
    severity: incidentSeverityEnum().notNull().default("medium"),
    title: varchar({ length: 255 }).notNull(),
    description: text(),
    location: varchar({ length: 255 }),
    latitude: numeric({ precision: 10, scale: 7 }),
    longitude: numeric({ precision: 10, scale: 7 }),
    photoUrls: jsonb("photo_urls").$type<string[]>().default([]),
    status: incidentStatusEnum().notNull().default("reported"),
    resolvedAt: timestamp("resolved_at", { withTimezone: true }),
    resolvedBy: uuid("resolved_by"),
    resolution: text(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("idx_inc_society").on(t.societyId),
    index("idx_inc_reporter").on(t.reportedBy),
    index("idx_inc_status").on(t.societyId, t.status),
    index("idx_inc_severity").on(t.societyId, t.severity),
  ]
);

// ─── SOS Alerts ───

export const sosAlerts = pgTable(
  "sos_alerts",
  {
    id: uuid().defaultRandom().primaryKey(),
    societyId: uuid("society_id")
      .notNull()
      .references(() => societies.id, { onDelete: "cascade" }),
    staffId: uuid("staff_id")
      .notNull()
      .references(() => staff.id),
    latitude: numeric({ precision: 10, scale: 7 }),
    longitude: numeric({ precision: 10, scale: 7 }),
    message: text(),
    isResolved: boolean("is_resolved").notNull().default(false),
    resolvedAt: timestamp("resolved_at", { withTimezone: true }),
    resolvedBy: uuid("resolved_by"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("idx_sos_society").on(t.societyId),
    index("idx_sos_staff").on(t.staffId),
    index("idx_sos_resolved").on(t.societyId, t.isResolved),
  ]
);
