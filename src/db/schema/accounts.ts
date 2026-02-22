import {
  pgTable,
  uuid,
  varchar,
  boolean,
  integer,
  timestamp,
  index,
  unique,
} from "drizzle-orm/pg-core";
import { accountTypeEnum } from "./enums";

export const accounts = pgTable(
  "accounts",
  {
    id: uuid().defaultRandom().primaryKey(),
    societyId: uuid("society_id").notNull(),
    code: varchar({ length: 20 }).notNull(),
    name: varchar({ length: 255 }).notNull(),
    accountType: accountTypeEnum("account_type").notNull(),
    parentId: uuid("parent_id"),
    level: integer().notNull().default(3),
    isSystemAccount: boolean("is_system_account").notNull().default(false),
    isActive: boolean("is_active").notNull().default(true),
    description: varchar({ length: 500 }),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    unique("uq_account_code").on(t.societyId, t.code),
    index("idx_account_society").on(t.societyId),
    index("idx_account_type").on(t.societyId, t.accountType),
  ]
);
