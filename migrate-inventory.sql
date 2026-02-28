-- Inventory module migration: 3 tables + indexes + foreign keys (enums already exist)
BEGIN;

-- Tables
CREATE TABLE "inventory_items" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "society_id" uuid NOT NULL,
    "barcode" varchar(100) NOT NULL,
    "name" varchar(255) NOT NULL,
    "category" "asset_category" NOT NULL,
    "description" text,
    "purchase_date" date,
    "purchase_price" numeric(15, 2),
    "vendor" varchar(255),
    "warranty_expiry" date,
    "location" varchar(255),
    "condition" "asset_condition" DEFAULT 'new' NOT NULL,
    "quantity" integer DEFAULT 1 NOT NULL,
    "min_stock_level" integer,
    "is_consumable" boolean DEFAULT false NOT NULL,
    "account_id" uuid,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_by" uuid,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT "uq_inventory_barcode" UNIQUE("society_id","barcode")
);

CREATE TABLE "stock_movements" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "society_id" uuid NOT NULL,
    "inventory_item_id" uuid NOT NULL,
    "movement_type" "stock_movement_type" NOT NULL,
    "reason" "stock_movement_reason" NOT NULL,
    "quantity" integer NOT NULL,
    "date" date NOT NULL,
    "notes" text,
    "performed_by" uuid,
    "journal_entry_id" uuid,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "asset_maintenance_schedules" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "society_id" uuid NOT NULL,
    "inventory_item_id" uuid NOT NULL,
    "maintenance_type" varchar(255) NOT NULL,
    "frequency_days" integer,
    "scheduled_date" date NOT NULL,
    "completed_date" date,
    "status" "maintenance_status" DEFAULT 'scheduled' NOT NULL,
    "cost" numeric(15, 2),
    "vendor" varchar(255),
    "notes" text,
    "journal_entry_id" uuid,
    "created_by" uuid,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- Foreign keys
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_inventory_item_id_inventory_items_id_fk" FOREIGN KEY ("inventory_item_id") REFERENCES "public"."inventory_items"("id") ON DELETE restrict ON UPDATE no action;
ALTER TABLE "asset_maintenance_schedules" ADD CONSTRAINT "asset_maintenance_schedules_inventory_item_id_inventory_items_i" FOREIGN KEY ("inventory_item_id") REFERENCES "public"."inventory_items"("id") ON DELETE cascade ON UPDATE no action;

-- Indexes
CREATE INDEX "idx_inventory_society" ON "inventory_items" USING btree ("society_id");
CREATE INDEX "idx_inventory_category" ON "inventory_items" USING btree ("society_id","category");
CREATE INDEX "idx_inventory_barcode_lookup" ON "inventory_items" USING btree ("barcode");
CREATE INDEX "idx_inventory_condition" ON "inventory_items" USING btree ("society_id","condition");
CREATE INDEX "idx_sm_society" ON "stock_movements" USING btree ("society_id");
CREATE INDEX "idx_sm_item" ON "stock_movements" USING btree ("inventory_item_id");
CREATE INDEX "idx_sm_date" ON "stock_movements" USING btree ("society_id","date");
CREATE INDEX "idx_sm_type" ON "stock_movements" USING btree ("society_id","movement_type");
CREATE INDEX "idx_ams_society" ON "asset_maintenance_schedules" USING btree ("society_id");
CREATE INDEX "idx_ams_item" ON "asset_maintenance_schedules" USING btree ("inventory_item_id");
CREATE INDEX "idx_ams_status" ON "asset_maintenance_schedules" USING btree ("society_id","status");
CREATE INDEX "idx_ams_scheduled" ON "asset_maintenance_schedules" USING btree ("society_id","scheduled_date");

COMMIT;
