import {
  pgTable,
  uuid,
  integer,
  text,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { societies } from "./societies";
import { staff } from "./staff";
import { staffTasks } from "./staff";
import { inventoryItems } from "./inventory";

// ─── Material Usage Logs ───

export const materialUsageLogs = pgTable(
  "material_usage_logs",
  {
    id: uuid().defaultRandom().primaryKey(),
    societyId: uuid("society_id")
      .notNull()
      .references(() => societies.id, { onDelete: "cascade" }),
    staffId: uuid("staff_id")
      .notNull()
      .references(() => staff.id),
    taskId: uuid("task_id").references(() => staffTasks.id),
    inventoryItemId: uuid("inventory_item_id")
      .notNull()
      .references(() => inventoryItems.id),
    quantityUsed: integer("quantity_used").notNull().default(1),
    notes: text(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("idx_mul_society").on(t.societyId),
    index("idx_mul_staff").on(t.staffId),
    index("idx_mul_task").on(t.taskId),
    index("idx_mul_item").on(t.inventoryItemId),
  ]
);
