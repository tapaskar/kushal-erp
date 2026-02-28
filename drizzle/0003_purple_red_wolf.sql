CREATE TYPE "public"."cleaning_frequency" AS ENUM('daily', 'weekly', 'biweekly', 'monthly');--> statement-breakpoint
CREATE TYPE "public"."cleaning_status" AS ENUM('pending', 'in_progress', 'completed', 'verified', 'issue_reported');--> statement-breakpoint
CREATE TYPE "public"."incident_severity" AS ENUM('low', 'medium', 'high', 'critical');--> statement-breakpoint
CREATE TYPE "public"."incident_status" AS ENUM('reported', 'investigating', 'resolved', 'escalated');--> statement-breakpoint
CREATE TYPE "public"."visitor_status" AS ENUM('expected', 'checked_in', 'checked_out', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."visitor_type" AS ENUM('guest', 'delivery', 'cab', 'vendor', 'service', 'other');--> statement-breakpoint
CREATE TABLE "incidents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"society_id" uuid NOT NULL,
	"reported_by" uuid NOT NULL,
	"severity" "incident_severity" DEFAULT 'medium' NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"location" varchar(255),
	"latitude" numeric(10, 7),
	"longitude" numeric(10, 7),
	"photo_urls" jsonb DEFAULT '[]'::jsonb,
	"status" "incident_status" DEFAULT 'reported' NOT NULL,
	"resolved_at" timestamp with time zone,
	"resolved_by" uuid,
	"resolution" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sos_alerts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"society_id" uuid NOT NULL,
	"staff_id" uuid NOT NULL,
	"latitude" numeric(10, 7),
	"longitude" numeric(10, 7),
	"message" text,
	"is_resolved" boolean DEFAULT false NOT NULL,
	"resolved_at" timestamp with time zone,
	"resolved_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "visitor_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"society_id" uuid NOT NULL,
	"staff_id" uuid,
	"visitor_name" varchar(255) NOT NULL,
	"visitor_phone" varchar(15),
	"visitor_type" "visitor_type" DEFAULT 'guest' NOT NULL,
	"unit_id" uuid,
	"purpose" varchar(500),
	"vehicle_number" varchar(20),
	"photo_url" text,
	"id_proof_url" text,
	"status" "visitor_status" DEFAULT 'checked_in' NOT NULL,
	"expected_at" timestamp with time zone,
	"check_in_at" timestamp with time zone,
	"check_out_at" timestamp with time zone,
	"check_in_gate" varchar(100),
	"check_out_gate" varchar(100),
	"approved_by" uuid,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cleaning_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"society_id" uuid NOT NULL,
	"zone_id" uuid NOT NULL,
	"staff_id" uuid,
	"shift_id" uuid,
	"scheduled_date" date NOT NULL,
	"status" "cleaning_status" DEFAULT 'pending' NOT NULL,
	"started_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"before_photo_url" text,
	"after_photo_url" text,
	"notes" text,
	"verified_by" uuid,
	"verified_at" timestamp with time zone,
	"rating" integer,
	"rating_comment" text,
	"rated_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cleaning_zones" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"society_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"floor" integer,
	"block_id" uuid,
	"zone_type" varchar(50) DEFAULT 'common_area' NOT NULL,
	"frequency" "cleaning_frequency" DEFAULT 'daily' NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "supply_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"society_id" uuid NOT NULL,
	"staff_id" uuid NOT NULL,
	"item_name" varchar(255) NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"urgency" varchar(20) DEFAULT 'normal' NOT NULL,
	"reason" text,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"approved_by" uuid,
	"fulfilled_at" timestamp with time zone,
	"inventory_item_id" uuid,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "material_usage_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"society_id" uuid NOT NULL,
	"staff_id" uuid NOT NULL,
	"task_id" uuid,
	"inventory_item_id" uuid NOT NULL,
	"quantity_used" integer DEFAULT 1 NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "incidents" ADD CONSTRAINT "incidents_society_id_societies_id_fk" FOREIGN KEY ("society_id") REFERENCES "public"."societies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "incidents" ADD CONSTRAINT "incidents_reported_by_staff_id_fk" FOREIGN KEY ("reported_by") REFERENCES "public"."staff"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sos_alerts" ADD CONSTRAINT "sos_alerts_society_id_societies_id_fk" FOREIGN KEY ("society_id") REFERENCES "public"."societies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sos_alerts" ADD CONSTRAINT "sos_alerts_staff_id_staff_id_fk" FOREIGN KEY ("staff_id") REFERENCES "public"."staff"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "visitor_logs" ADD CONSTRAINT "visitor_logs_society_id_societies_id_fk" FOREIGN KEY ("society_id") REFERENCES "public"."societies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "visitor_logs" ADD CONSTRAINT "visitor_logs_staff_id_staff_id_fk" FOREIGN KEY ("staff_id") REFERENCES "public"."staff"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cleaning_logs" ADD CONSTRAINT "cleaning_logs_society_id_societies_id_fk" FOREIGN KEY ("society_id") REFERENCES "public"."societies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cleaning_logs" ADD CONSTRAINT "cleaning_logs_zone_id_cleaning_zones_id_fk" FOREIGN KEY ("zone_id") REFERENCES "public"."cleaning_zones"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cleaning_logs" ADD CONSTRAINT "cleaning_logs_staff_id_staff_id_fk" FOREIGN KEY ("staff_id") REFERENCES "public"."staff"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cleaning_logs" ADD CONSTRAINT "cleaning_logs_shift_id_shifts_id_fk" FOREIGN KEY ("shift_id") REFERENCES "public"."shifts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cleaning_zones" ADD CONSTRAINT "cleaning_zones_society_id_societies_id_fk" FOREIGN KEY ("society_id") REFERENCES "public"."societies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supply_requests" ADD CONSTRAINT "supply_requests_society_id_societies_id_fk" FOREIGN KEY ("society_id") REFERENCES "public"."societies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supply_requests" ADD CONSTRAINT "supply_requests_staff_id_staff_id_fk" FOREIGN KEY ("staff_id") REFERENCES "public"."staff"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supply_requests" ADD CONSTRAINT "supply_requests_inventory_item_id_inventory_items_id_fk" FOREIGN KEY ("inventory_item_id") REFERENCES "public"."inventory_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "material_usage_logs" ADD CONSTRAINT "material_usage_logs_society_id_societies_id_fk" FOREIGN KEY ("society_id") REFERENCES "public"."societies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "material_usage_logs" ADD CONSTRAINT "material_usage_logs_staff_id_staff_id_fk" FOREIGN KEY ("staff_id") REFERENCES "public"."staff"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "material_usage_logs" ADD CONSTRAINT "material_usage_logs_task_id_staff_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."staff_tasks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "material_usage_logs" ADD CONSTRAINT "material_usage_logs_inventory_item_id_inventory_items_id_fk" FOREIGN KEY ("inventory_item_id") REFERENCES "public"."inventory_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_inc_society" ON "incidents" USING btree ("society_id");--> statement-breakpoint
CREATE INDEX "idx_inc_reporter" ON "incidents" USING btree ("reported_by");--> statement-breakpoint
CREATE INDEX "idx_inc_status" ON "incidents" USING btree ("society_id","status");--> statement-breakpoint
CREATE INDEX "idx_inc_severity" ON "incidents" USING btree ("society_id","severity");--> statement-breakpoint
CREATE INDEX "idx_sos_society" ON "sos_alerts" USING btree ("society_id");--> statement-breakpoint
CREATE INDEX "idx_sos_staff" ON "sos_alerts" USING btree ("staff_id");--> statement-breakpoint
CREATE INDEX "idx_sos_resolved" ON "sos_alerts" USING btree ("society_id","is_resolved");--> statement-breakpoint
CREATE INDEX "idx_vl_society" ON "visitor_logs" USING btree ("society_id");--> statement-breakpoint
CREATE INDEX "idx_vl_staff" ON "visitor_logs" USING btree ("staff_id");--> statement-breakpoint
CREATE INDEX "idx_vl_status" ON "visitor_logs" USING btree ("society_id","status");--> statement-breakpoint
CREATE INDEX "idx_vl_date" ON "visitor_logs" USING btree ("society_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_vl_unit" ON "visitor_logs" USING btree ("unit_id");--> statement-breakpoint
CREATE INDEX "idx_cl_society" ON "cleaning_logs" USING btree ("society_id");--> statement-breakpoint
CREATE INDEX "idx_cl_zone" ON "cleaning_logs" USING btree ("zone_id");--> statement-breakpoint
CREATE INDEX "idx_cl_staff" ON "cleaning_logs" USING btree ("staff_id");--> statement-breakpoint
CREATE INDEX "idx_cl_date" ON "cleaning_logs" USING btree ("society_id","scheduled_date");--> statement-breakpoint
CREATE INDEX "idx_cl_status" ON "cleaning_logs" USING btree ("society_id","status");--> statement-breakpoint
CREATE INDEX "idx_cz_society" ON "cleaning_zones" USING btree ("society_id");--> statement-breakpoint
CREATE INDEX "idx_cz_block" ON "cleaning_zones" USING btree ("block_id");--> statement-breakpoint
CREATE INDEX "idx_cz_type" ON "cleaning_zones" USING btree ("society_id","zone_type");--> statement-breakpoint
CREATE INDEX "idx_sr_society" ON "supply_requests" USING btree ("society_id");--> statement-breakpoint
CREATE INDEX "idx_sr_staff" ON "supply_requests" USING btree ("staff_id");--> statement-breakpoint
CREATE INDEX "idx_sr_status" ON "supply_requests" USING btree ("society_id","status");--> statement-breakpoint
CREATE INDEX "idx_mul_society" ON "material_usage_logs" USING btree ("society_id");--> statement-breakpoint
CREATE INDEX "idx_mul_staff" ON "material_usage_logs" USING btree ("staff_id");--> statement-breakpoint
CREATE INDEX "idx_mul_task" ON "material_usage_logs" USING btree ("task_id");--> statement-breakpoint
CREATE INDEX "idx_mul_item" ON "material_usage_logs" USING btree ("inventory_item_id");