import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  timestamp,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import { complaintStatusEnum, complaintPriorityEnum } from "./enums";

export const complaints = pgTable(
  "complaints",
  {
    id: uuid().defaultRandom().primaryKey(),
    societyId: uuid("society_id").notNull(),
    complaintNumber: varchar("complaint_number", { length: 50 }).notNull(),
    unitId: uuid("unit_id"),
    raisedBy: uuid("raised_by").notNull(),
    title: varchar({ length: 255 }).notNull(),
    description: text().notNull(),
    category: varchar({ length: 100 }).notNull(),
    priority: complaintPriorityEnum().notNull().default("medium"),
    status: complaintStatusEnum().notNull().default("open"),
    attachmentUrls: jsonb("attachment_urls").$type<string[]>().default([]),
    slaHours: integer("sla_hours"),
    resolvedAt: timestamp("resolved_at", { withTimezone: true }),
    closedAt: timestamp("closed_at", { withTimezone: true }),
    resolution: text(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("idx_complaint_society").on(t.societyId),
    index("idx_complaint_status").on(t.societyId, t.status),
    index("idx_complaint_unit").on(t.unitId),
  ]
);

export const complaintAssignments = pgTable(
  "complaint_assignments",
  {
    id: uuid().defaultRandom().primaryKey(),
    complaintId: uuid("complaint_id").notNull(),
    societyId: uuid("society_id").notNull(),
    assignedTo: uuid("assigned_to").notNull(),
    assignedBy: uuid("assigned_by").notNull(),
    notes: text(),
    assignedAt: timestamp("assigned_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("idx_assign_complaint").on(t.complaintId)]
);
