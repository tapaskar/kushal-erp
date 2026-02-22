import {
  pgTable,
  uuid,
  varchar,
  text,
  numeric,
  date,
  timestamp,
  index,
  check,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { journalStatusEnum, debitCreditEnum } from "./enums";
import { accounts } from "./accounts";

export const journalEntries = pgTable(
  "journal_entries",
  {
    id: uuid().defaultRandom().primaryKey(),
    societyId: uuid("society_id").notNull(),
    entryNumber: varchar("entry_number", { length: 50 }).notNull(),
    date: date().notNull(),
    narration: text().notNull(),
    status: journalStatusEnum().notNull().default("posted"),
    sourceType: varchar("source_type", { length: 50 }),
    sourceId: uuid("source_id"),
    reversedByEntryId: uuid("reversed_by_entry_id"),
    reversesEntryId: uuid("reverses_entry_id"),
    financialYear: varchar("financial_year", { length: 9 }).notNull(),
    createdBy: uuid("created_by"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("idx_je_society").on(t.societyId),
    index("idx_je_date").on(t.societyId, t.date),
    index("idx_je_source").on(t.sourceType, t.sourceId),
    index("idx_je_fy").on(t.societyId, t.financialYear),
  ]
);

export const ledgerEntries = pgTable(
  "ledger_entries",
  {
    id: uuid().defaultRandom().primaryKey(),
    societyId: uuid("society_id").notNull(),
    journalEntryId: uuid("journal_entry_id")
      .notNull()
      .references(() => journalEntries.id, { onDelete: "restrict" }),
    accountId: uuid("account_id")
      .notNull()
      .references(() => accounts.id, { onDelete: "restrict" }),
    debitCredit: debitCreditEnum("debit_credit").notNull(),
    amount: numeric({ precision: 15, scale: 2 }).notNull(),
    date: date().notNull(),
    narration: text(),
    unitId: uuid("unit_id"),
    memberId: uuid("member_id"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("idx_le_journal").on(t.journalEntryId),
    index("idx_le_account").on(t.accountId),
    index("idx_le_society_date").on(t.societyId, t.date),
    index("idx_le_unit").on(t.unitId),
    check("amount_positive", sql`${t.amount} > 0`),
  ]
);
