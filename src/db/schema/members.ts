import {
  pgTable,
  uuid,
  varchar,
  text,
  date,
  boolean,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { memberTypeEnum } from "./enums";
import { units } from "./societies";
import { users } from "./auth";

export const members = pgTable(
  "members",
  {
    id: uuid().defaultRandom().primaryKey(),
    societyId: uuid("society_id").notNull(),
    unitId: uuid("unit_id")
      .notNull()
      .references(() => units.id),
    userId: uuid("user_id").references(() => users.id),
    memberType: memberTypeEnum("member_type").notNull(),
    name: varchar({ length: 255 }).notNull(),
    phone: varchar({ length: 15 }).notNull(),
    email: varchar({ length: 255 }),
    validFrom: date("valid_from").notNull(),
    validTo: date("valid_to"),
    rentAgreementUrl: text("rent_agreement_url"),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("idx_member_society").on(t.societyId),
    index("idx_member_unit").on(t.unitId),
    index("idx_member_user").on(t.userId),
  ]
);

export const familyMembers = pgTable(
  "family_members",
  {
    id: uuid().defaultRandom().primaryKey(),
    memberId: uuid("member_id")
      .notNull()
      .references(() => members.id, { onDelete: "cascade" }),
    societyId: uuid("society_id").notNull(),
    name: varchar({ length: 255 }).notNull(),
    relation: varchar({ length: 50 }).notNull(),
    phone: varchar({ length: 15 }),
    dateOfBirth: date("date_of_birth"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("idx_family_society").on(t.societyId)]
);

export const vehicles = pgTable(
  "vehicles",
  {
    id: uuid().defaultRandom().primaryKey(),
    memberId: uuid("member_id")
      .notNull()
      .references(() => members.id, { onDelete: "cascade" }),
    societyId: uuid("society_id").notNull(),
    vehicleType: varchar("vehicle_type", { length: 50 }).notNull(),
    registrationNumber: varchar("registration_number", {
      length: 20,
    }).notNull(),
    make: varchar({ length: 100 }),
    model: varchar({ length: 100 }),
    color: varchar({ length: 50 }),
    parkingSlotId: uuid("parking_slot_id"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("idx_vehicle_society").on(t.societyId)]
);

export const parkingSlots = pgTable(
  "parking_slots",
  {
    id: uuid().defaultRandom().primaryKey(),
    societyId: uuid("society_id").notNull(),
    blockId: uuid("block_id"),
    slotNumber: varchar("slot_number", { length: 20 }).notNull(),
    slotType: varchar("slot_type", { length: 50 }).notNull().default("car"),
    isAllocated: boolean("is_allocated").notNull().default(false),
    allocatedToUnitId: uuid("allocated_to_unit_id"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("idx_parking_society").on(t.societyId)]
);
