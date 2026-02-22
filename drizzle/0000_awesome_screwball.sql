CREATE TYPE "public"."account_type" AS ENUM('asset', 'liability', 'income', 'expense', 'equity');--> statement-breakpoint
CREATE TYPE "public"."asset_category" AS ENUM('furniture', 'electronics', 'fire_safety', 'dg_parts', 'cleaning', 'plumbing', 'electrical', 'garden', 'sports', 'other');--> statement-breakpoint
CREATE TYPE "public"."asset_condition" AS ENUM('new', 'good', 'fair', 'poor', 'damaged', 'disposed');--> statement-breakpoint
CREATE TYPE "public"."billing_frequency" AS ENUM('monthly', 'quarterly', 'half_yearly', 'yearly', 'one_time');--> statement-breakpoint
CREATE TYPE "public"."charge_calculation" AS ENUM('per_sqft', 'flat_rate', 'percentage', 'custom');--> statement-breakpoint
CREATE TYPE "public"."complaint_priority" AS ENUM('low', 'medium', 'high', 'urgent');--> statement-breakpoint
CREATE TYPE "public"."complaint_status" AS ENUM('open', 'assigned', 'in_progress', 'resolved', 'closed', 'reopened');--> statement-breakpoint
CREATE TYPE "public"."debit_credit" AS ENUM('debit', 'credit');--> statement-breakpoint
CREATE TYPE "public"."invoice_status" AS ENUM('draft', 'sent', 'partially_paid', 'paid', 'overdue', 'cancelled', 'written_off');--> statement-breakpoint
CREATE TYPE "public"."journal_status" AS ENUM('draft', 'posted', 'reversed');--> statement-breakpoint
CREATE TYPE "public"."maintenance_status" AS ENUM('scheduled', 'overdue', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."member_type" AS ENUM('owner', 'tenant', 'family_member');--> statement-breakpoint
CREATE TYPE "public"."notice_category" AS ENUM('general', 'maintenance', 'meeting', 'event', 'emergency', 'financial', 'rule_update');--> statement-breakpoint
CREATE TYPE "public"."occupancy_status" AS ENUM('owner_occupied', 'tenant_occupied', 'vacant');--> statement-breakpoint
CREATE TYPE "public"."payment_method" AS ENUM('razorpay', 'upi', 'neft', 'rtgs', 'cheque', 'cash', 'demand_draft');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('pending', 'captured', 'failed', 'refunded');--> statement-breakpoint
CREATE TYPE "public"."stock_movement_reason" AS ENUM('purchase', 'donation', 'return', 'consumed', 'issued', 'damaged', 'disposed', 'adjustment');--> statement-breakpoint
CREATE TYPE "public"."stock_movement_type" AS ENUM('stock_in', 'stock_out');--> statement-breakpoint
CREATE TYPE "public"."unit_type" AS ENUM('apartment', 'shop', 'office', 'parking', 'storage');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('super_admin', 'society_admin', 'treasurer', 'committee_member', 'resident');--> statement-breakpoint
CREATE TABLE "user_society_roles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"society_id" uuid NOT NULL,
	"role" "user_role" DEFAULT 'resident' NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uq_user_society_role" UNIQUE("user_id","society_id","role")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"phone" varchar(15) NOT NULL,
	"email" varchar(255),
	"name" varchar(255) NOT NULL,
	"cognito_sub" varchar(255),
	"avatar_url" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_phone_unique" UNIQUE("phone"),
	CONSTRAINT "users_cognito_sub_unique" UNIQUE("cognito_sub")
);
--> statement-breakpoint
CREATE TABLE "blocks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"society_id" uuid NOT NULL,
	"name" varchar(100) NOT NULL,
	"code" varchar(10) NOT NULL,
	"total_floors" integer NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uq_block_code" UNIQUE("society_id","code")
);
--> statement-breakpoint
CREATE TABLE "floors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"block_id" uuid NOT NULL,
	"society_id" uuid NOT NULL,
	"floor_number" integer NOT NULL,
	"name" varchar(50),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uq_floor_block" UNIQUE("block_id","floor_number")
);
--> statement-breakpoint
CREATE TABLE "societies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"registration_number" varchar(100),
	"address" text NOT NULL,
	"city" varchar(100) NOT NULL,
	"state" varchar(100) NOT NULL,
	"pincode" varchar(6) NOT NULL,
	"phone" varchar(15),
	"email" varchar(255),
	"gst_number" varchar(15),
	"pan_number" varchar(10),
	"logo_url" text,
	"financial_year_start_month" integer DEFAULT 4 NOT NULL,
	"late_payment_interest_rate" numeric(5, 2) DEFAULT '0' NOT NULL,
	"late_payment_grace_days" integer DEFAULT 0 NOT NULL,
	"billing_due_day" integer DEFAULT 10 NOT NULL,
	"is_gst_registered" boolean DEFAULT false NOT NULL,
	"razorpay_account_id" varchar(100),
	"settings" jsonb DEFAULT '{}'::jsonb,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "units" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"society_id" uuid NOT NULL,
	"block_id" uuid NOT NULL,
	"floor_id" uuid NOT NULL,
	"unit_number" varchar(20) NOT NULL,
	"unit_type" "unit_type" DEFAULT 'apartment' NOT NULL,
	"area_sqft" numeric(10, 2),
	"occupancy_status" "occupancy_status" DEFAULT 'vacant' NOT NULL,
	"is_billable" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uq_unit_number" UNIQUE("society_id","unit_number")
);
--> statement-breakpoint
CREATE TABLE "family_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"member_id" uuid NOT NULL,
	"society_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"relation" varchar(50) NOT NULL,
	"phone" varchar(15),
	"date_of_birth" date,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"society_id" uuid NOT NULL,
	"unit_id" uuid NOT NULL,
	"user_id" uuid,
	"member_type" "member_type" NOT NULL,
	"name" varchar(255) NOT NULL,
	"phone" varchar(15) NOT NULL,
	"email" varchar(255),
	"valid_from" date NOT NULL,
	"valid_to" date,
	"rent_agreement_url" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "parking_slots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"society_id" uuid NOT NULL,
	"block_id" uuid,
	"slot_number" varchar(20) NOT NULL,
	"slot_type" varchar(50) DEFAULT 'car' NOT NULL,
	"is_allocated" boolean DEFAULT false NOT NULL,
	"allocated_to_unit_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vehicles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"member_id" uuid NOT NULL,
	"society_id" uuid NOT NULL,
	"vehicle_type" varchar(50) NOT NULL,
	"registration_number" varchar(20) NOT NULL,
	"make" varchar(100),
	"model" varchar(100),
	"color" varchar(50),
	"parking_slot_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"society_id" uuid NOT NULL,
	"code" varchar(20) NOT NULL,
	"name" varchar(255) NOT NULL,
	"account_type" "account_type" NOT NULL,
	"parent_id" uuid,
	"level" integer DEFAULT 3 NOT NULL,
	"is_system_account" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"description" varchar(500),
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uq_account_code" UNIQUE("society_id","code")
);
--> statement-breakpoint
CREATE TABLE "journal_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"society_id" uuid NOT NULL,
	"entry_number" varchar(50) NOT NULL,
	"date" date NOT NULL,
	"narration" text NOT NULL,
	"status" "journal_status" DEFAULT 'posted' NOT NULL,
	"source_type" varchar(50),
	"source_id" uuid,
	"reversed_by_entry_id" uuid,
	"reverses_entry_id" uuid,
	"financial_year" varchar(9) NOT NULL,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ledger_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"society_id" uuid NOT NULL,
	"journal_entry_id" uuid NOT NULL,
	"account_id" uuid NOT NULL,
	"debit_credit" "debit_credit" NOT NULL,
	"amount" numeric(15, 2) NOT NULL,
	"date" date NOT NULL,
	"narration" text,
	"unit_id" uuid,
	"member_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "amount_positive" CHECK ("ledger_entries"."amount" > 0)
);
--> statement-breakpoint
CREATE TABLE "charge_heads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"society_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"code" varchar(20) NOT NULL,
	"calculation_type" charge_calculation NOT NULL,
	"rate" numeric(12, 2) NOT NULL,
	"base_charge_head_id" uuid,
	"frequency" "billing_frequency" DEFAULT 'monthly' NOT NULL,
	"income_account_id" uuid NOT NULL,
	"is_gst_applicable" boolean DEFAULT false NOT NULL,
	"gst_rate" numeric(5, 2) DEFAULT '18',
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uq_charge_head_code" UNIQUE("society_id","code")
);
--> statement-breakpoint
CREATE TABLE "invoice_line_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"invoice_id" uuid NOT NULL,
	"society_id" uuid NOT NULL,
	"charge_head_id" uuid NOT NULL,
	"description" varchar(255) NOT NULL,
	"area_sqft" numeric(10, 2),
	"rate" numeric(12, 2) NOT NULL,
	"quantity" numeric(10, 2) DEFAULT '1' NOT NULL,
	"amount" numeric(15, 2) NOT NULL,
	"gst_rate" numeric(5, 2) DEFAULT '0',
	"gst_amount" numeric(15, 2) DEFAULT '0',
	"total_amount" numeric(15, 2) NOT NULL,
	"income_account_id" uuid NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invoices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"society_id" uuid NOT NULL,
	"unit_id" uuid NOT NULL,
	"member_id" uuid NOT NULL,
	"invoice_number" varchar(50) NOT NULL,
	"billing_month" integer NOT NULL,
	"billing_year" integer NOT NULL,
	"issue_date" date NOT NULL,
	"due_date" date NOT NULL,
	"subtotal" numeric(15, 2) DEFAULT '0' NOT NULL,
	"gst_amount" numeric(15, 2) DEFAULT '0' NOT NULL,
	"interest_amount" numeric(15, 2) DEFAULT '0' NOT NULL,
	"total_amount" numeric(15, 2) NOT NULL,
	"paid_amount" numeric(15, 2) DEFAULT '0' NOT NULL,
	"balance_due" numeric(15, 2) NOT NULL,
	"status" "invoice_status" DEFAULT 'draft' NOT NULL,
	"previous_balance" numeric(15, 2) DEFAULT '0' NOT NULL,
	"journal_entry_id" uuid,
	"pdf_url" text,
	"razorpay_order_id" varchar(100),
	"razorpay_payment_link_id" varchar(100),
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uq_invoice_number" UNIQUE("society_id","invoice_number")
);
--> statement-breakpoint
CREATE TABLE "unit_charge_overrides" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"society_id" uuid NOT NULL,
	"unit_id" uuid NOT NULL,
	"charge_head_id" uuid NOT NULL,
	"override_rate" numeric(12, 2) NOT NULL,
	"reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uq_unit_charge" UNIQUE("unit_id","charge_head_id")
);
--> statement-breakpoint
CREATE TABLE "payment_links" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"society_id" uuid NOT NULL,
	"invoice_id" uuid NOT NULL,
	"razorpay_link_id" varchar(100) NOT NULL,
	"short_url" text NOT NULL,
	"amount" numeric(15, 2) NOT NULL,
	"expires_at" timestamp with time zone,
	"is_used" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"society_id" uuid NOT NULL,
	"invoice_id" uuid NOT NULL,
	"unit_id" uuid NOT NULL,
	"member_id" uuid NOT NULL,
	"receipt_number" varchar(50) NOT NULL,
	"amount" numeric(15, 2) NOT NULL,
	"payment_date" date NOT NULL,
	"payment_method" "payment_method" NOT NULL,
	"status" "payment_status" DEFAULT 'pending' NOT NULL,
	"razorpay_order_id" varchar(100),
	"razorpay_payment_id" varchar(100),
	"razorpay_signature" varchar(255),
	"instrument_number" varchar(50),
	"instrument_date" date,
	"bank_name" varchar(100),
	"transaction_reference" varchar(100),
	"journal_entry_id" uuid,
	"webhook_payload" jsonb,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "announcements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"society_id" uuid NOT NULL,
	"title" varchar(255) NOT NULL,
	"body" text NOT NULL,
	"category" "notice_category" DEFAULT 'general' NOT NULL,
	"attachment_urls" jsonb DEFAULT '[]'::jsonb,
	"send_email" boolean DEFAULT false NOT NULL,
	"send_whatsapp" boolean DEFAULT false NOT NULL,
	"is_pinned" boolean DEFAULT false NOT NULL,
	"published_at" timestamp with time zone,
	"expires_at" timestamp with time zone,
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "complaint_assignments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"complaint_id" uuid NOT NULL,
	"society_id" uuid NOT NULL,
	"assigned_to" uuid NOT NULL,
	"assigned_by" uuid NOT NULL,
	"notes" text,
	"assigned_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "complaints" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"society_id" uuid NOT NULL,
	"complaint_number" varchar(50) NOT NULL,
	"unit_id" uuid,
	"raised_by" uuid NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"category" varchar(100) NOT NULL,
	"priority" "complaint_priority" DEFAULT 'medium' NOT NULL,
	"status" "complaint_status" DEFAULT 'open' NOT NULL,
	"attachment_urls" jsonb DEFAULT '[]'::jsonb,
	"sla_hours" integer,
	"resolved_at" timestamp with time zone,
	"closed_at" timestamp with time zone,
	"resolution" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
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
--> statement-breakpoint
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
--> statement-breakpoint
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
--> statement-breakpoint
ALTER TABLE "user_society_roles" ADD CONSTRAINT "user_society_roles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blocks" ADD CONSTRAINT "blocks_society_id_societies_id_fk" FOREIGN KEY ("society_id") REFERENCES "public"."societies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "floors" ADD CONSTRAINT "floors_block_id_blocks_id_fk" FOREIGN KEY ("block_id") REFERENCES "public"."blocks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "floors" ADD CONSTRAINT "floors_society_id_societies_id_fk" FOREIGN KEY ("society_id") REFERENCES "public"."societies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "units" ADD CONSTRAINT "units_society_id_societies_id_fk" FOREIGN KEY ("society_id") REFERENCES "public"."societies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "units" ADD CONSTRAINT "units_block_id_blocks_id_fk" FOREIGN KEY ("block_id") REFERENCES "public"."blocks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "units" ADD CONSTRAINT "units_floor_id_floors_id_fk" FOREIGN KEY ("floor_id") REFERENCES "public"."floors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "family_members" ADD CONSTRAINT "family_members_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "members" ADD CONSTRAINT "members_unit_id_units_id_fk" FOREIGN KEY ("unit_id") REFERENCES "public"."units"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "members" ADD CONSTRAINT "members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ledger_entries" ADD CONSTRAINT "ledger_entries_journal_entry_id_journal_entries_id_fk" FOREIGN KEY ("journal_entry_id") REFERENCES "public"."journal_entries"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ledger_entries" ADD CONSTRAINT "ledger_entries_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "charge_heads" ADD CONSTRAINT "charge_heads_income_account_id_accounts_id_fk" FOREIGN KEY ("income_account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice_line_items" ADD CONSTRAINT "invoice_line_items_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice_line_items" ADD CONSTRAINT "invoice_line_items_charge_head_id_charge_heads_id_fk" FOREIGN KEY ("charge_head_id") REFERENCES "public"."charge_heads"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_unit_id_units_id_fk" FOREIGN KEY ("unit_id") REFERENCES "public"."units"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "unit_charge_overrides" ADD CONSTRAINT "unit_charge_overrides_unit_id_units_id_fk" FOREIGN KEY ("unit_id") REFERENCES "public"."units"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "unit_charge_overrides" ADD CONSTRAINT "unit_charge_overrides_charge_head_id_charge_heads_id_fk" FOREIGN KEY ("charge_head_id") REFERENCES "public"."charge_heads"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "asset_maintenance_schedules" ADD CONSTRAINT "asset_maintenance_schedules_inventory_item_id_inventory_items_id_fk" FOREIGN KEY ("inventory_item_id") REFERENCES "public"."inventory_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_inventory_item_id_inventory_items_id_fk" FOREIGN KEY ("inventory_item_id") REFERENCES "public"."inventory_items"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_usr_society" ON "user_society_roles" USING btree ("user_id","society_id");--> statement-breakpoint
CREATE INDEX "idx_block_society" ON "blocks" USING btree ("society_id");--> statement-breakpoint
CREATE INDEX "idx_floor_society" ON "floors" USING btree ("society_id");--> statement-breakpoint
CREATE INDEX "idx_unit_society" ON "units" USING btree ("society_id");--> statement-breakpoint
CREATE INDEX "idx_unit_block" ON "units" USING btree ("block_id");--> statement-breakpoint
CREATE INDEX "idx_family_society" ON "family_members" USING btree ("society_id");--> statement-breakpoint
CREATE INDEX "idx_member_society" ON "members" USING btree ("society_id");--> statement-breakpoint
CREATE INDEX "idx_member_unit" ON "members" USING btree ("unit_id");--> statement-breakpoint
CREATE INDEX "idx_member_user" ON "members" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_parking_society" ON "parking_slots" USING btree ("society_id");--> statement-breakpoint
CREATE INDEX "idx_vehicle_society" ON "vehicles" USING btree ("society_id");--> statement-breakpoint
CREATE INDEX "idx_account_society" ON "accounts" USING btree ("society_id");--> statement-breakpoint
CREATE INDEX "idx_account_type" ON "accounts" USING btree ("society_id","account_type");--> statement-breakpoint
CREATE INDEX "idx_je_society" ON "journal_entries" USING btree ("society_id");--> statement-breakpoint
CREATE INDEX "idx_je_date" ON "journal_entries" USING btree ("society_id","date");--> statement-breakpoint
CREATE INDEX "idx_je_source" ON "journal_entries" USING btree ("source_type","source_id");--> statement-breakpoint
CREATE INDEX "idx_je_fy" ON "journal_entries" USING btree ("society_id","financial_year");--> statement-breakpoint
CREATE INDEX "idx_le_journal" ON "ledger_entries" USING btree ("journal_entry_id");--> statement-breakpoint
CREATE INDEX "idx_le_account" ON "ledger_entries" USING btree ("account_id");--> statement-breakpoint
CREATE INDEX "idx_le_society_date" ON "ledger_entries" USING btree ("society_id","date");--> statement-breakpoint
CREATE INDEX "idx_le_unit" ON "ledger_entries" USING btree ("unit_id");--> statement-breakpoint
CREATE INDEX "idx_charge_head_society" ON "charge_heads" USING btree ("society_id");--> statement-breakpoint
CREATE INDEX "idx_line_item_invoice" ON "invoice_line_items" USING btree ("invoice_id");--> statement-breakpoint
CREATE INDEX "idx_invoice_society" ON "invoices" USING btree ("society_id");--> statement-breakpoint
CREATE INDEX "idx_invoice_unit" ON "invoices" USING btree ("unit_id");--> statement-breakpoint
CREATE INDEX "idx_invoice_period" ON "invoices" USING btree ("society_id","billing_year","billing_month");--> statement-breakpoint
CREATE INDEX "idx_invoice_status" ON "invoices" USING btree ("society_id","status");--> statement-breakpoint
CREATE INDEX "idx_invoice_due" ON "invoices" USING btree ("society_id","due_date");--> statement-breakpoint
CREATE INDEX "idx_payment_society" ON "payments" USING btree ("society_id");--> statement-breakpoint
CREATE INDEX "idx_payment_invoice" ON "payments" USING btree ("invoice_id");--> statement-breakpoint
CREATE INDEX "idx_payment_razorpay" ON "payments" USING btree ("razorpay_payment_id");--> statement-breakpoint
CREATE INDEX "idx_payment_date" ON "payments" USING btree ("society_id","payment_date");--> statement-breakpoint
CREATE INDEX "idx_announcement_society" ON "announcements" USING btree ("society_id");--> statement-breakpoint
CREATE INDEX "idx_announcement_published" ON "announcements" USING btree ("society_id","published_at");--> statement-breakpoint
CREATE INDEX "idx_assign_complaint" ON "complaint_assignments" USING btree ("complaint_id");--> statement-breakpoint
CREATE INDEX "idx_complaint_society" ON "complaints" USING btree ("society_id");--> statement-breakpoint
CREATE INDEX "idx_complaint_status" ON "complaints" USING btree ("society_id","status");--> statement-breakpoint
CREATE INDEX "idx_complaint_unit" ON "complaints" USING btree ("unit_id");--> statement-breakpoint
CREATE INDEX "idx_ams_society" ON "asset_maintenance_schedules" USING btree ("society_id");--> statement-breakpoint
CREATE INDEX "idx_ams_item" ON "asset_maintenance_schedules" USING btree ("inventory_item_id");--> statement-breakpoint
CREATE INDEX "idx_ams_status" ON "asset_maintenance_schedules" USING btree ("society_id","status");--> statement-breakpoint
CREATE INDEX "idx_ams_scheduled" ON "asset_maintenance_schedules" USING btree ("society_id","scheduled_date");--> statement-breakpoint
CREATE INDEX "idx_inventory_society" ON "inventory_items" USING btree ("society_id");--> statement-breakpoint
CREATE INDEX "idx_inventory_category" ON "inventory_items" USING btree ("society_id","category");--> statement-breakpoint
CREATE INDEX "idx_inventory_barcode_lookup" ON "inventory_items" USING btree ("barcode");--> statement-breakpoint
CREATE INDEX "idx_inventory_condition" ON "inventory_items" USING btree ("society_id","condition");--> statement-breakpoint
CREATE INDEX "idx_sm_society" ON "stock_movements" USING btree ("society_id");--> statement-breakpoint
CREATE INDEX "idx_sm_item" ON "stock_movements" USING btree ("inventory_item_id");--> statement-breakpoint
CREATE INDEX "idx_sm_date" ON "stock_movements" USING btree ("society_id","date");--> statement-breakpoint
CREATE INDEX "idx_sm_type" ON "stock_movements" USING btree ("society_id","movement_type");