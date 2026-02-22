import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import { noticeCategoryEnum } from "./enums";

export const announcements = pgTable(
  "announcements",
  {
    id: uuid().defaultRandom().primaryKey(),
    societyId: uuid("society_id").notNull(),
    title: varchar({ length: 255 }).notNull(),
    body: text().notNull(),
    category: noticeCategoryEnum().notNull().default("general"),
    attachmentUrls: jsonb("attachment_urls").$type<string[]>().default([]),
    sendEmail: boolean("send_email").notNull().default(false),
    sendWhatsapp: boolean("send_whatsapp").notNull().default(false),
    isPinned: boolean("is_pinned").notNull().default(false),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    createdBy: uuid("created_by").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("idx_announcement_society").on(t.societyId),
    index("idx_announcement_published").on(t.societyId, t.publishedAt),
  ]
);
