CREATE TYPE "public"."location_source" AS ENUM('gps', 'geofence_enter', 'geofence_exit', 'beacon', 'manual');--> statement-breakpoint
CREATE TYPE "public"."patrol_status" AS ENUM('pending', 'in_progress', 'completed', 'missed', 'partial');--> statement-breakpoint
CREATE TYPE "public"."shift_status" AS ENUM('scheduled', 'checked_in', 'checked_out', 'missed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."staff_role" AS ENUM('security', 'housekeeping', 'maintenance', 'gardener', 'electrician', 'plumber', 'supervisor');--> statement-breakpoint
CREATE TYPE "public"."staff_task_status" AS ENUM('pending', 'accepted', 'in_progress', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."staff_task_type" AS ENUM('complaint', 'maintenance', 'patrol', 'ad_hoc', 'inspection');--> statement-breakpoint
CREATE TABLE "beacon_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"society_id" uuid NOT NULL,
	"staff_id" uuid NOT NULL,
	"beacon_id" uuid NOT NULL,
	"shift_id" uuid,
	"event_type" varchar(20) NOT NULL,
	"rssi" integer,
	"dwell_seconds" integer,
	"recorded_at" timestamp with time zone NOT NULL,
	"received_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "beacons" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"society_id" uuid NOT NULL,
	"uuid" varchar(36) NOT NULL,
	"major" integer NOT NULL,
	"minor" integer NOT NULL,
	"label" varchar(255) NOT NULL,
	"location" varchar(255),
	"latitude" numeric(10, 7),
	"longitude" numeric(10, 7),
	"floor" integer,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uq_beacon_identity" UNIQUE("society_id","uuid","major","minor")
);
--> statement-breakpoint
CREATE TABLE "location_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"society_id" uuid NOT NULL,
	"staff_id" uuid NOT NULL,
	"shift_id" uuid,
	"latitude" numeric(10, 7) NOT NULL,
	"longitude" numeric(10, 7) NOT NULL,
	"accuracy" numeric(6, 2),
	"altitude" numeric(8, 2),
	"speed" numeric(6, 2),
	"heading" numeric(6, 2),
	"source" "location_source" DEFAULT 'gps' NOT NULL,
	"battery_level" numeric(5, 2),
	"is_moving" boolean,
	"recorded_at" timestamp with time zone NOT NULL,
	"received_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "patrol_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"society_id" uuid NOT NULL,
	"patrol_route_id" uuid NOT NULL,
	"staff_id" uuid NOT NULL,
	"shift_id" uuid,
	"status" "patrol_status" DEFAULT 'pending' NOT NULL,
	"started_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"checkpoint_results" jsonb DEFAULT '[]'::jsonb,
	"total_checkpoints" integer NOT NULL,
	"visited_checkpoints" integer DEFAULT 0 NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "patrol_routes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"society_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"estimated_duration_min" integer,
	"checkpoints" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "shifts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"society_id" uuid NOT NULL,
	"staff_id" uuid NOT NULL,
	"date" date NOT NULL,
	"scheduled_start" timestamp with time zone NOT NULL,
	"scheduled_end" timestamp with time zone NOT NULL,
	"actual_check_in" timestamp with time zone,
	"actual_check_out" timestamp with time zone,
	"check_in_lat" numeric(10, 7),
	"check_in_lng" numeric(10, 7),
	"check_out_lat" numeric(10, 7),
	"check_out_lng" numeric(10, 7),
	"check_in_photo_url" text,
	"check_out_photo_url" text,
	"status" "shift_status" DEFAULT 'scheduled' NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uq_shift_staff_date" UNIQUE("staff_id","date","scheduled_start")
);
--> statement-breakpoint
CREATE TABLE "staff" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"society_id" uuid NOT NULL,
	"user_id" uuid,
	"employee_code" varchar(50) NOT NULL,
	"name" varchar(255) NOT NULL,
	"phone" varchar(15) NOT NULL,
	"email" varchar(255),
	"role" "staff_role" NOT NULL,
	"department" varchar(100),
	"photo_url" text,
	"aadhaar_last4" varchar(4),
	"emergency_contact" varchar(15),
	"employed_since" date,
	"contractor_name" varchar(255),
	"monthly_salary" numeric(10, 2),
	"is_active" boolean DEFAULT true NOT NULL,
	"consent_given_at" timestamp with time zone,
	"consent_revoked_at" timestamp with time zone,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uq_staff_employee_code" UNIQUE("society_id","employee_code")
);
--> statement-breakpoint
CREATE TABLE "staff_tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"society_id" uuid NOT NULL,
	"staff_id" uuid,
	"task_type" "staff_task_type" NOT NULL,
	"status" "staff_task_status" DEFAULT 'pending' NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"priority" "complaint_priority" DEFAULT 'medium' NOT NULL,
	"complaint_id" uuid,
	"maintenance_schedule_id" uuid,
	"patrol_log_id" uuid,
	"location" varchar(255),
	"latitude" numeric(10, 7),
	"longitude" numeric(10, 7),
	"due_by" timestamp with time zone,
	"started_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"before_photo_url" text,
	"after_photo_url" text,
	"resolution" text,
	"assigned_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "beacon_events" ADD CONSTRAINT "beacon_events_staff_id_staff_id_fk" FOREIGN KEY ("staff_id") REFERENCES "public"."staff"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "beacon_events" ADD CONSTRAINT "beacon_events_beacon_id_beacons_id_fk" FOREIGN KEY ("beacon_id") REFERENCES "public"."beacons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "beacon_events" ADD CONSTRAINT "beacon_events_shift_id_shifts_id_fk" FOREIGN KEY ("shift_id") REFERENCES "public"."shifts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "beacons" ADD CONSTRAINT "beacons_society_id_societies_id_fk" FOREIGN KEY ("society_id") REFERENCES "public"."societies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "location_logs" ADD CONSTRAINT "location_logs_staff_id_staff_id_fk" FOREIGN KEY ("staff_id") REFERENCES "public"."staff"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "location_logs" ADD CONSTRAINT "location_logs_shift_id_shifts_id_fk" FOREIGN KEY ("shift_id") REFERENCES "public"."shifts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patrol_logs" ADD CONSTRAINT "patrol_logs_patrol_route_id_patrol_routes_id_fk" FOREIGN KEY ("patrol_route_id") REFERENCES "public"."patrol_routes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patrol_logs" ADD CONSTRAINT "patrol_logs_staff_id_staff_id_fk" FOREIGN KEY ("staff_id") REFERENCES "public"."staff"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patrol_logs" ADD CONSTRAINT "patrol_logs_shift_id_shifts_id_fk" FOREIGN KEY ("shift_id") REFERENCES "public"."shifts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patrol_routes" ADD CONSTRAINT "patrol_routes_society_id_societies_id_fk" FOREIGN KEY ("society_id") REFERENCES "public"."societies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shifts" ADD CONSTRAINT "shifts_society_id_societies_id_fk" FOREIGN KEY ("society_id") REFERENCES "public"."societies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shifts" ADD CONSTRAINT "shifts_staff_id_staff_id_fk" FOREIGN KEY ("staff_id") REFERENCES "public"."staff"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "staff" ADD CONSTRAINT "staff_society_id_societies_id_fk" FOREIGN KEY ("society_id") REFERENCES "public"."societies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "staff" ADD CONSTRAINT "staff_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "staff_tasks" ADD CONSTRAINT "staff_tasks_society_id_societies_id_fk" FOREIGN KEY ("society_id") REFERENCES "public"."societies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "staff_tasks" ADD CONSTRAINT "staff_tasks_staff_id_staff_id_fk" FOREIGN KEY ("staff_id") REFERENCES "public"."staff"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_be_society" ON "beacon_events" USING btree ("society_id");--> statement-breakpoint
CREATE INDEX "idx_be_staff_time" ON "beacon_events" USING btree ("staff_id","recorded_at");--> statement-breakpoint
CREATE INDEX "idx_be_beacon" ON "beacon_events" USING btree ("beacon_id");--> statement-breakpoint
CREATE INDEX "idx_be_shift" ON "beacon_events" USING btree ("shift_id");--> statement-breakpoint
CREATE INDEX "idx_beacon_society" ON "beacons" USING btree ("society_id");--> statement-breakpoint
CREATE INDEX "idx_ll_society" ON "location_logs" USING btree ("society_id");--> statement-breakpoint
CREATE INDEX "idx_ll_staff_time" ON "location_logs" USING btree ("staff_id","recorded_at");--> statement-breakpoint
CREATE INDEX "idx_ll_shift" ON "location_logs" USING btree ("shift_id");--> statement-breakpoint
CREATE INDEX "idx_ll_recorded" ON "location_logs" USING btree ("society_id","recorded_at");--> statement-breakpoint
CREATE INDEX "idx_pl_society" ON "patrol_logs" USING btree ("society_id");--> statement-breakpoint
CREATE INDEX "idx_pl_staff" ON "patrol_logs" USING btree ("staff_id");--> statement-breakpoint
CREATE INDEX "idx_pl_route" ON "patrol_logs" USING btree ("patrol_route_id");--> statement-breakpoint
CREATE INDEX "idx_pl_status" ON "patrol_logs" USING btree ("society_id","status");--> statement-breakpoint
CREATE INDEX "idx_patrol_route_society" ON "patrol_routes" USING btree ("society_id");--> statement-breakpoint
CREATE INDEX "idx_shift_society" ON "shifts" USING btree ("society_id");--> statement-breakpoint
CREATE INDEX "idx_shift_staff" ON "shifts" USING btree ("staff_id");--> statement-breakpoint
CREATE INDEX "idx_shift_date" ON "shifts" USING btree ("society_id","date");--> statement-breakpoint
CREATE INDEX "idx_shift_status" ON "shifts" USING btree ("society_id","status");--> statement-breakpoint
CREATE INDEX "idx_staff_society" ON "staff" USING btree ("society_id");--> statement-breakpoint
CREATE INDEX "idx_staff_role" ON "staff" USING btree ("society_id","role");--> statement-breakpoint
CREATE INDEX "idx_staff_phone" ON "staff" USING btree ("phone");--> statement-breakpoint
CREATE INDEX "idx_staff_user" ON "staff" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_st_society" ON "staff_tasks" USING btree ("society_id");--> statement-breakpoint
CREATE INDEX "idx_st_staff" ON "staff_tasks" USING btree ("staff_id");--> statement-breakpoint
CREATE INDEX "idx_st_status" ON "staff_tasks" USING btree ("society_id","status");--> statement-breakpoint
CREATE INDEX "idx_st_type" ON "staff_tasks" USING btree ("society_id","task_type");--> statement-breakpoint
CREATE INDEX "idx_st_complaint" ON "staff_tasks" USING btree ("complaint_id");--> statement-breakpoint
CREATE INDEX "idx_st_due" ON "staff_tasks" USING btree ("society_id","due_by");