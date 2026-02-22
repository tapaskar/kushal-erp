import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  boolean,
  index,
  unique,
} from "drizzle-orm/pg-core";
import { userRoleEnum } from "./enums";

export const users = pgTable("users", {
  id: uuid().defaultRandom().primaryKey(),
  phone: varchar({ length: 15 }).notNull().unique(),
  email: varchar({ length: 255 }),
  name: varchar({ length: 255 }).notNull(),
  cognitoSub: varchar("cognito_sub", { length: 255 }).unique(),
  avatarUrl: text("avatar_url"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const userSocietyRoles = pgTable(
  "user_society_roles",
  {
    id: uuid().defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    societyId: uuid("society_id").notNull(),
    role: userRoleEnum().notNull().default("resident"),
    isDefault: boolean("is_default").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    unique("uq_user_society_role").on(t.userId, t.societyId, t.role),
    index("idx_usr_society").on(t.userId, t.societyId),
  ]
);
