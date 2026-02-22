CREATE TYPE "public"."po_status" AS ENUM('draft', 'pending_l1', 'pending_l2', 'pending_l3', 'approved', 'issued', 'delivered', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."pr_priority" AS ENUM('low', 'normal', 'urgent');--> statement-breakpoint
CREATE TYPE "public"."pr_status" AS ENUM('draft', 'open', 'rfq_sent', 'quotes_received', 'po_created', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."quotation_status" AS ENUM('submitted', 'shortlisted', 'rejected', 'accepted');--> statement-breakpoint
CREATE TYPE "public"."rfq_status" AS ENUM('draft', 'sent', 'closed');--> statement-breakpoint
CREATE TYPE "public"."vendor_category" AS ENUM('housekeeping', 'heavy_machinery', 'furniture', 'electronics', 'fire_safety', 'dg_parts', 'garden', 'sports', 'plumbing', 'electrical', 'civil', 'it_amc', 'security', 'pest_control', 'lift_maintenance', 'painting', 'other');--> statement-breakpoint
CREATE TYPE "public"."vendor_status" AS ENUM('pending', 'approved', 'suspended', 'blacklisted');--> statement-breakpoint
CREATE TYPE "public"."vendor_type" AS ENUM('product', 'service');--> statement-breakpoint
CREATE TABLE "purchase_orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"society_id" uuid NOT NULL,
	"rfq_id" uuid NOT NULL,
	"quotation_id" uuid NOT NULL,
	"vendor_id" uuid NOT NULL,
	"reference_no" varchar(50) NOT NULL,
	"status" "po_status" DEFAULT 'pending_l1' NOT NULL,
	"approval_remark" text,
	"l1_approved_by" uuid,
	"l1_approved_at" timestamp with time zone,
	"l2_approved_by" uuid,
	"l2_approved_at" timestamp with time zone,
	"l3_approved_by" uuid,
	"l3_approved_at" timestamp with time zone,
	"total_amount" numeric(15, 2),
	"delivery_days" integer,
	"payment_terms" varchar(500),
	"notes" text,
	"issued_at" timestamp with time zone,
	"delivered_at" timestamp with time zone,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uq_po_reference" UNIQUE("society_id","reference_no")
);
--> statement-breakpoint
CREATE TABLE "purchase_request_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"purchase_request_id" uuid NOT NULL,
	"item_name" varchar(255) NOT NULL,
	"specification" text,
	"quantity" numeric(10, 2) NOT NULL,
	"unit" varchar(50) DEFAULT 'pcs' NOT NULL,
	"estimated_unit_price" numeric(15, 2),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "purchase_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"society_id" uuid NOT NULL,
	"reference_no" varchar(50) NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"category" "vendor_category" NOT NULL,
	"priority" "pr_priority" DEFAULT 'normal' NOT NULL,
	"status" "pr_status" DEFAULT 'open' NOT NULL,
	"required_by_date" date,
	"requested_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uq_pr_reference" UNIQUE("society_id","reference_no")
);
--> statement-breakpoint
CREATE TABLE "quotation_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"quotation_id" uuid NOT NULL,
	"pr_item_id" uuid,
	"item_name" varchar(255) NOT NULL,
	"quantity" numeric(10, 2) NOT NULL,
	"unit" varchar(50) NOT NULL,
	"unit_price" numeric(15, 2) NOT NULL,
	"gst_percent" numeric(5, 2) DEFAULT '0' NOT NULL,
	"line_total" numeric(15, 2) NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quotations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"society_id" uuid NOT NULL,
	"rfq_id" uuid NOT NULL,
	"vendor_id" uuid NOT NULL,
	"reference_no" varchar(50) NOT NULL,
	"status" "quotation_status" DEFAULT 'submitted' NOT NULL,
	"valid_until" date,
	"delivery_days" integer,
	"payment_terms" varchar(500),
	"subtotal" numeric(15, 2),
	"gst_amount" numeric(15, 2),
	"total_amount" numeric(15, 2),
	"rank" integer,
	"notes" text,
	"submitted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uq_quotation_reference" UNIQUE("society_id","reference_no"),
	CONSTRAINT "uq_quotation_rfq_vendor" UNIQUE("rfq_id","vendor_id")
);
--> statement-breakpoint
CREATE TABLE "rfq_vendors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"rfq_id" uuid NOT NULL,
	"vendor_id" uuid NOT NULL,
	"vendor_token" uuid DEFAULT gen_random_uuid() NOT NULL,
	"invited_at" timestamp with time zone,
	"email_sent_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "rfq_vendors_vendor_token_unique" UNIQUE("vendor_token"),
	CONSTRAINT "uq_rfq_vendor" UNIQUE("rfq_id","vendor_id")
);
--> statement-breakpoint
CREATE TABLE "rfqs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"society_id" uuid NOT NULL,
	"purchase_request_id" uuid NOT NULL,
	"reference_no" varchar(50) NOT NULL,
	"deadline" date NOT NULL,
	"terms" text,
	"status" "rfq_status" DEFAULT 'draft' NOT NULL,
	"sent_at" timestamp with time zone,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uq_rfq_reference" UNIQUE("society_id","reference_no")
);
--> statement-breakpoint
CREATE TABLE "vendor_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"vendor_id" uuid NOT NULL,
	"category" "vendor_category" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uq_vendor_category" UNIQUE("vendor_id","category")
);
--> statement-breakpoint
CREATE TABLE "vendors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"society_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"contact_person" varchar(255),
	"email" varchar(255) NOT NULL,
	"phone" varchar(20) NOT NULL,
	"address" text,
	"city" varchar(100),
	"gstin" varchar(15),
	"pan" varchar(10),
	"bank_name" varchar(255),
	"account_number" varchar(50),
	"ifsc_code" varchar(11),
	"vendor_type" "vendor_type" NOT NULL,
	"status" "vendor_status" DEFAULT 'pending' NOT NULL,
	"notes" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_rfq_id_rfqs_id_fk" FOREIGN KEY ("rfq_id") REFERENCES "public"."rfqs"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_quotation_id_quotations_id_fk" FOREIGN KEY ("quotation_id") REFERENCES "public"."quotations"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_vendor_id_vendors_id_fk" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendors"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_l1_approved_by_users_id_fk" FOREIGN KEY ("l1_approved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_l2_approved_by_users_id_fk" FOREIGN KEY ("l2_approved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_l3_approved_by_users_id_fk" FOREIGN KEY ("l3_approved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_request_items" ADD CONSTRAINT "purchase_request_items_purchase_request_id_purchase_requests_id_fk" FOREIGN KEY ("purchase_request_id") REFERENCES "public"."purchase_requests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_requests" ADD CONSTRAINT "purchase_requests_requested_by_users_id_fk" FOREIGN KEY ("requested_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quotation_items" ADD CONSTRAINT "quotation_items_quotation_id_quotations_id_fk" FOREIGN KEY ("quotation_id") REFERENCES "public"."quotations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quotation_items" ADD CONSTRAINT "quotation_items_pr_item_id_purchase_request_items_id_fk" FOREIGN KEY ("pr_item_id") REFERENCES "public"."purchase_request_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quotations" ADD CONSTRAINT "quotations_rfq_id_rfqs_id_fk" FOREIGN KEY ("rfq_id") REFERENCES "public"."rfqs"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quotations" ADD CONSTRAINT "quotations_vendor_id_vendors_id_fk" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendors"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rfq_vendors" ADD CONSTRAINT "rfq_vendors_rfq_id_rfqs_id_fk" FOREIGN KEY ("rfq_id") REFERENCES "public"."rfqs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rfq_vendors" ADD CONSTRAINT "rfq_vendors_vendor_id_vendors_id_fk" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendors"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rfqs" ADD CONSTRAINT "rfqs_purchase_request_id_purchase_requests_id_fk" FOREIGN KEY ("purchase_request_id") REFERENCES "public"."purchase_requests"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rfqs" ADD CONSTRAINT "rfqs_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendor_categories" ADD CONSTRAINT "vendor_categories_vendor_id_vendors_id_fk" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendors" ADD CONSTRAINT "vendors_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_po_society" ON "purchase_orders" USING btree ("society_id");--> statement-breakpoint
CREATE INDEX "idx_po_status" ON "purchase_orders" USING btree ("society_id","status");--> statement-breakpoint
CREATE INDEX "idx_po_vendor" ON "purchase_orders" USING btree ("vendor_id");--> statement-breakpoint
CREATE INDEX "idx_po_rfq" ON "purchase_orders" USING btree ("rfq_id");--> statement-breakpoint
CREATE INDEX "idx_pri_request" ON "purchase_request_items" USING btree ("purchase_request_id");--> statement-breakpoint
CREATE INDEX "idx_pr_society" ON "purchase_requests" USING btree ("society_id");--> statement-breakpoint
CREATE INDEX "idx_pr_status" ON "purchase_requests" USING btree ("society_id","status");--> statement-breakpoint
CREATE INDEX "idx_pr_category" ON "purchase_requests" USING btree ("society_id","category");--> statement-breakpoint
CREATE INDEX "idx_qi_quotation" ON "quotation_items" USING btree ("quotation_id");--> statement-breakpoint
CREATE INDEX "idx_quot_rfq" ON "quotations" USING btree ("rfq_id");--> statement-breakpoint
CREATE INDEX "idx_quot_vendor" ON "quotations" USING btree ("vendor_id");--> statement-breakpoint
CREATE INDEX "idx_quot_status" ON "quotations" USING btree ("society_id","status");--> statement-breakpoint
CREATE INDEX "idx_rfqv_rfq" ON "rfq_vendors" USING btree ("rfq_id");--> statement-breakpoint
CREATE INDEX "idx_rfqv_vendor" ON "rfq_vendors" USING btree ("vendor_id");--> statement-breakpoint
CREATE INDEX "idx_rfqv_token" ON "rfq_vendors" USING btree ("vendor_token");--> statement-breakpoint
CREATE INDEX "idx_rfq_society" ON "rfqs" USING btree ("society_id");--> statement-breakpoint
CREATE INDEX "idx_rfq_pr" ON "rfqs" USING btree ("purchase_request_id");--> statement-breakpoint
CREATE INDEX "idx_rfq_status" ON "rfqs" USING btree ("society_id","status");--> statement-breakpoint
CREATE INDEX "idx_vc_vendor" ON "vendor_categories" USING btree ("vendor_id");--> statement-breakpoint
CREATE INDEX "idx_vc_category" ON "vendor_categories" USING btree ("category");--> statement-breakpoint
CREATE INDEX "idx_vendors_society" ON "vendors" USING btree ("society_id");--> statement-breakpoint
CREATE INDEX "idx_vendors_status" ON "vendors" USING btree ("society_id","status");--> statement-breakpoint
CREATE INDEX "idx_vendors_type" ON "vendors" USING btree ("society_id","vendor_type");