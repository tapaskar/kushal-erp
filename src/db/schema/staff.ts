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
  jsonb,
  index,
  unique,
} from "drizzle-orm/pg-core";
import {
  staffRoleEnum,
  shiftStatusEnum,
  staffTaskStatusEnum,
  staffTaskTypeEnum,
  patrolStatusEnum,
  locationSourceEnum,
  complaintPriorityEnum,
} from "./enums";
import { users } from "./auth";
import { societies } from "./societies";

// ─── Staff Members ───

export const staff = pgTable(
  "staff",
  {
    id: uuid().defaultRandom().primaryKey(),
    societyId: uuid("society_id")
      .notNull()
      .references(() => societies.id, { onDelete: "cascade" }),
    userId: uuid("user_id").references(() => users.id),
    employeeCode: varchar("employee_code", { length: 50 }).notNull(),
    name: varchar({ length: 255 }).notNull(),
    phone: varchar({ length: 15 }).notNull(),
    email: varchar({ length: 255 }),
    role: staffRoleEnum().notNull(),
    department: varchar({ length: 100 }),
    photoUrl: text("photo_url"),
    aadhaarLast4: varchar("aadhaar_last4", { length: 4 }),
    emergencyContact: varchar("emergency_contact", { length: 15 }),
    employedSince: date("employed_since"),
    contractorName: varchar("contractor_name", { length: 255 }),
    monthlySalary: numeric("monthly_salary", { precision: 10, scale: 2 }),
    isActive: boolean("is_active").notNull().default(true),
    consentGivenAt: timestamp("consent_given_at", { withTimezone: true }),
    consentRevokedAt: timestamp("consent_revoked_at", { withTimezone: true }),
    createdBy: uuid("created_by"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    unique("uq_staff_employee_code").on(t.societyId, t.employeeCode),
    index("idx_staff_society").on(t.societyId),
    index("idx_staff_role").on(t.societyId, t.role),
    index("idx_staff_phone").on(t.phone),
    index("idx_staff_user").on(t.userId),
  ]
);

// ─── Shifts ───

export const shifts = pgTable(
  "shifts",
  {
    id: uuid().defaultRandom().primaryKey(),
    societyId: uuid("society_id")
      .notNull()
      .references(() => societies.id),
    staffId: uuid("staff_id")
      .notNull()
      .references(() => staff.id, { onDelete: "cascade" }),
    date: date().notNull(),
    scheduledStart: timestamp("scheduled_start", { withTimezone: true }).notNull(),
    scheduledEnd: timestamp("scheduled_end", { withTimezone: true }).notNull(),
    actualCheckIn: timestamp("actual_check_in", { withTimezone: true }),
    actualCheckOut: timestamp("actual_check_out", { withTimezone: true }),
    checkInLat: numeric("check_in_lat", { precision: 10, scale: 7 }),
    checkInLng: numeric("check_in_lng", { precision: 10, scale: 7 }),
    checkOutLat: numeric("check_out_lat", { precision: 10, scale: 7 }),
    checkOutLng: numeric("check_out_lng", { precision: 10, scale: 7 }),
    checkInPhotoUrl: text("check_in_photo_url"),
    checkOutPhotoUrl: text("check_out_photo_url"),
    status: shiftStatusEnum().notNull().default("scheduled"),
    notes: text(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    unique("uq_shift_staff_date").on(t.staffId, t.date, t.scheduledStart),
    index("idx_shift_society").on(t.societyId),
    index("idx_shift_staff").on(t.staffId),
    index("idx_shift_date").on(t.societyId, t.date),
    index("idx_shift_status").on(t.societyId, t.status),
  ]
);

// ─── Location Logs ───

export const locationLogs = pgTable(
  "location_logs",
  {
    id: uuid().defaultRandom().primaryKey(),
    societyId: uuid("society_id").notNull(),
    staffId: uuid("staff_id")
      .notNull()
      .references(() => staff.id, { onDelete: "cascade" }),
    shiftId: uuid("shift_id").references(() => shifts.id),
    latitude: numeric({ precision: 10, scale: 7 }).notNull(),
    longitude: numeric({ precision: 10, scale: 7 }).notNull(),
    accuracy: numeric({ precision: 6, scale: 2 }),
    altitude: numeric({ precision: 8, scale: 2 }),
    speed: numeric({ precision: 6, scale: 2 }),
    heading: numeric({ precision: 6, scale: 2 }),
    source: locationSourceEnum().notNull().default("gps"),
    batteryLevel: numeric("battery_level", { precision: 5, scale: 2 }),
    isMoving: boolean("is_moving"),
    recordedAt: timestamp("recorded_at", { withTimezone: true }).notNull(),
    receivedAt: timestamp("received_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("idx_ll_society").on(t.societyId),
    index("idx_ll_staff_time").on(t.staffId, t.recordedAt),
    index("idx_ll_shift").on(t.shiftId),
    index("idx_ll_recorded").on(t.societyId, t.recordedAt),
  ]
);

// ─── BLE Beacons ───

export const beacons = pgTable(
  "beacons",
  {
    id: uuid().defaultRandom().primaryKey(),
    societyId: uuid("society_id")
      .notNull()
      .references(() => societies.id, { onDelete: "cascade" }),
    uuid: varchar({ length: 36 }).notNull(),
    major: integer().notNull(),
    minor: integer().notNull(),
    label: varchar({ length: 255 }).notNull(),
    location: varchar({ length: 255 }),
    latitude: numeric({ precision: 10, scale: 7 }),
    longitude: numeric({ precision: 10, scale: 7 }),
    floor: integer(),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    unique("uq_beacon_identity").on(t.societyId, t.uuid, t.major, t.minor),
    index("idx_beacon_society").on(t.societyId),
  ]
);

// ─── Beacon Events ───

export const beaconEvents = pgTable(
  "beacon_events",
  {
    id: uuid().defaultRandom().primaryKey(),
    societyId: uuid("society_id").notNull(),
    staffId: uuid("staff_id")
      .notNull()
      .references(() => staff.id, { onDelete: "cascade" }),
    beaconId: uuid("beacon_id")
      .notNull()
      .references(() => beacons.id, { onDelete: "cascade" }),
    shiftId: uuid("shift_id").references(() => shifts.id),
    eventType: varchar("event_type", { length: 20 }).notNull(),
    rssi: integer(),
    dwellSeconds: integer("dwell_seconds"),
    recordedAt: timestamp("recorded_at", { withTimezone: true }).notNull(),
    receivedAt: timestamp("received_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("idx_be_society").on(t.societyId),
    index("idx_be_staff_time").on(t.staffId, t.recordedAt),
    index("idx_be_beacon").on(t.beaconId),
    index("idx_be_shift").on(t.shiftId),
  ]
);

// ─── Patrol Routes ───

export const patrolRoutes = pgTable(
  "patrol_routes",
  {
    id: uuid().defaultRandom().primaryKey(),
    societyId: uuid("society_id")
      .notNull()
      .references(() => societies.id, { onDelete: "cascade" }),
    name: varchar({ length: 255 }).notNull(),
    description: text(),
    estimatedDurationMin: integer("estimated_duration_min"),
    checkpoints: jsonb()
      .$type<
        {
          order: number;
          beaconId?: string;
          label: string;
          latitude?: number;
          longitude?: number;
          requiredAction?: string;
        }[]
      >()
      .notNull()
      .default([]),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("idx_patrol_route_society").on(t.societyId)]
);

// ─── Patrol Logs ───

export const patrolLogs = pgTable(
  "patrol_logs",
  {
    id: uuid().defaultRandom().primaryKey(),
    societyId: uuid("society_id").notNull(),
    patrolRouteId: uuid("patrol_route_id")
      .notNull()
      .references(() => patrolRoutes.id),
    staffId: uuid("staff_id")
      .notNull()
      .references(() => staff.id, { onDelete: "cascade" }),
    shiftId: uuid("shift_id").references(() => shifts.id),
    status: patrolStatusEnum().notNull().default("pending"),
    startedAt: timestamp("started_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    checkpointResults: jsonb("checkpoint_results")
      .$type<
        {
          checkpointIndex: number;
          label: string;
          visitedAt: string;
          latitude?: number;
          longitude?: number;
          photoUrl?: string;
          beaconDetected?: boolean;
          notes?: string;
        }[]
      >()
      .default([]),
    totalCheckpoints: integer("total_checkpoints").notNull(),
    visitedCheckpoints: integer("visited_checkpoints").notNull().default(0),
    notes: text(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("idx_pl_society").on(t.societyId),
    index("idx_pl_staff").on(t.staffId),
    index("idx_pl_route").on(t.patrolRouteId),
    index("idx_pl_status").on(t.societyId, t.status),
  ]
);

// ─── Staff Tasks ───

export const staffTasks = pgTable(
  "staff_tasks",
  {
    id: uuid().defaultRandom().primaryKey(),
    societyId: uuid("society_id")
      .notNull()
      .references(() => societies.id),
    staffId: uuid("staff_id").references(() => staff.id),
    taskType: staffTaskTypeEnum("task_type").notNull(),
    status: staffTaskStatusEnum().notNull().default("pending"),
    title: varchar({ length: 255 }).notNull(),
    description: text(),
    priority: complaintPriorityEnum().notNull().default("medium"),
    complaintId: uuid("complaint_id"),
    maintenanceScheduleId: uuid("maintenance_schedule_id"),
    patrolLogId: uuid("patrol_log_id"),
    location: varchar({ length: 255 }),
    latitude: numeric({ precision: 10, scale: 7 }),
    longitude: numeric({ precision: 10, scale: 7 }),
    dueBy: timestamp("due_by", { withTimezone: true }),
    startedAt: timestamp("started_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    beforePhotoUrl: text("before_photo_url"),
    afterPhotoUrl: text("after_photo_url"),
    resolution: text(),
    assignedBy: uuid("assigned_by"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("idx_st_society").on(t.societyId),
    index("idx_st_staff").on(t.staffId),
    index("idx_st_status").on(t.societyId, t.status),
    index("idx_st_type").on(t.societyId, t.taskType),
    index("idx_st_complaint").on(t.complaintId),
    index("idx_st_due").on(t.societyId, t.dueBy),
  ]
);
