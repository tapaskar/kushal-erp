import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
  index,
  unique,
} from "drizzle-orm/pg-core";
import { users } from "./auth";

// ─── Society Modules ───
// Tracks which modules are enabled for each society

export const societyModules = pgTable(
  "society_modules",
  {
    id: uuid().defaultRandom().primaryKey(),
    societyId: uuid("society_id").notNull(),
    moduleKey: varchar("module_key", { length: 100 }).notNull(),
    moduleName: varchar("module_name", { length: 255 }).notNull(),
    description: text(),
    isEnabled: boolean("is_enabled").notNull().default(true),
    configuredBy: uuid("configured_by").references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    unique("uq_society_module").on(t.societyId, t.moduleKey),
    index("idx_smod_society").on(t.societyId),
  ]
);

// ─── Society Role Permissions ───
// Per-society, per-role, per-module permission grants

export const societyRolePermissions = pgTable(
  "society_role_permissions",
  {
    id: uuid().defaultRandom().primaryKey(),
    societyId: uuid("society_id").notNull(),
    role: varchar({ length: 50 }).notNull(), // e.g. "society_admin", "security"
    roleType: varchar("role_type", { length: 10 }).notNull(), // "user" | "staff"
    moduleKey: varchar("module_key", { length: 100 }).notNull(),
    permission: varchar({ length: 100 }).notNull(), // e.g. "view", "create", "approve_exec"
    isGranted: boolean("is_granted").notNull().default(false),
    configuredBy: uuid("configured_by").references(() => users.id),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    unique("uq_society_role_perm").on(
      t.societyId,
      t.role,
      t.moduleKey,
      t.permission
    ),
    index("idx_srp_society").on(t.societyId),
    index("idx_srp_role").on(t.societyId, t.role),
    index("idx_srp_module").on(t.societyId, t.moduleKey),
  ]
);
