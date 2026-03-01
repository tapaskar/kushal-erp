CREATE TYPE "public"."nfa_approval_action" AS ENUM('approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."nfa_status" AS ENUM('draft', 'pending_exec', 'pending_treasurer', 'approved', 'po_created', 'completed', 'rejected', 'cancelled');--> statement-breakpoint
ALTER TYPE "public"."user_role" ADD VALUE 'estate_manager';--> statement-breakpoint
ALTER TYPE "public"."user_role" ADD VALUE 'president';--> statement-breakpoint
ALTER TYPE "public"."user_role" ADD VALUE 'vice_president';--> statement-breakpoint
ALTER TYPE "public"."user_role" ADD VALUE 'secretary';--> statement-breakpoint
ALTER TYPE "public"."user_role" ADD VALUE 'joint_secretary';--> statement-breakpoint
ALTER TYPE "public"."user_role" ADD VALUE 'joint_treasurer';--> statement-breakpoint
ALTER TYPE "public"."user_role" ADD VALUE 'executive_member';--> statement-breakpoint
CREATE TABLE "society_modules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"society_id" uuid NOT NULL,
	"module_key" varchar(100) NOT NULL,
	"module_name" varchar(255) NOT NULL,
	"description" text,
	"is_enabled" boolean DEFAULT true NOT NULL,
	"configured_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uq_society_module" UNIQUE("society_id","module_key")
);
--> statement-breakpoint
CREATE TABLE "society_role_permissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"society_id" uuid NOT NULL,
	"role" varchar(50) NOT NULL,
	"role_type" varchar(10) NOT NULL,
	"module_key" varchar(100) NOT NULL,
	"permission" varchar(100) NOT NULL,
	"is_granted" boolean DEFAULT false NOT NULL,
	"configured_by" uuid,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uq_society_role_perm" UNIQUE("society_id","role","module_key","permission")
);
--> statement-breakpoint
CREATE TABLE "nfa_approvals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nfa_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"user_name" varchar(255) NOT NULL,
	"user_role" varchar(50) NOT NULL,
	"action" "nfa_approval_action" NOT NULL,
	"remarks" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uq_nfa_approval_user" UNIQUE("nfa_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "nfa_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nfa_id" uuid NOT NULL,
	"item_name" varchar(255) NOT NULL,
	"specification" text,
	"quantity" numeric(10, 2) NOT NULL,
	"unit" varchar(50) DEFAULT 'pcs',
	"l1_vendor_name" varchar(255),
	"l1_unit_price" numeric(15, 2),
	"l1_total_price" numeric(15, 2),
	"l2_vendor_name" varchar(255),
	"l2_unit_price" numeric(15, 2),
	"l2_total_price" numeric(15, 2),
	"l3_vendor_name" varchar(255),
	"l3_unit_price" numeric(15, 2),
	"l3_total_price" numeric(15, 2),
	"selected_quote" varchar(5),
	"justification" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notes_for_approval" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"society_id" uuid NOT NULL,
	"reference_no" varchar(50) NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"category" "vendor_category",
	"priority" "pr_priority" DEFAULT 'normal' NOT NULL,
	"status" "nfa_status" DEFAULT 'draft' NOT NULL,
	"total_estimated_amount" numeric(15, 2),
	"required_exec_approvals" integer DEFAULT 0 NOT NULL,
	"current_exec_approvals" integer DEFAULT 0 NOT NULL,
	"current_exec_rejections" integer DEFAULT 0 NOT NULL,
	"treasurer_approved_by" uuid,
	"treasurer_approved_at" timestamp with time zone,
	"treasurer_remarks" text,
	"purchase_order_id" uuid,
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uq_nfa_reference" UNIQUE("society_id","reference_no")
);
--> statement-breakpoint
ALTER TABLE "society_modules" ADD CONSTRAINT "society_modules_configured_by_users_id_fk" FOREIGN KEY ("configured_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "society_role_permissions" ADD CONSTRAINT "society_role_permissions_configured_by_users_id_fk" FOREIGN KEY ("configured_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nfa_approvals" ADD CONSTRAINT "nfa_approvals_nfa_id_notes_for_approval_id_fk" FOREIGN KEY ("nfa_id") REFERENCES "public"."notes_for_approval"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nfa_approvals" ADD CONSTRAINT "nfa_approvals_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nfa_items" ADD CONSTRAINT "nfa_items_nfa_id_notes_for_approval_id_fk" FOREIGN KEY ("nfa_id") REFERENCES "public"."notes_for_approval"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notes_for_approval" ADD CONSTRAINT "notes_for_approval_treasurer_approved_by_users_id_fk" FOREIGN KEY ("treasurer_approved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notes_for_approval" ADD CONSTRAINT "notes_for_approval_purchase_order_id_purchase_orders_id_fk" FOREIGN KEY ("purchase_order_id") REFERENCES "public"."purchase_orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notes_for_approval" ADD CONSTRAINT "notes_for_approval_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_smod_society" ON "society_modules" USING btree ("society_id");--> statement-breakpoint
CREATE INDEX "idx_srp_society" ON "society_role_permissions" USING btree ("society_id");--> statement-breakpoint
CREATE INDEX "idx_srp_role" ON "society_role_permissions" USING btree ("society_id","role");--> statement-breakpoint
CREATE INDEX "idx_srp_module" ON "society_role_permissions" USING btree ("society_id","module_key");--> statement-breakpoint
CREATE INDEX "idx_nfa_approvals_nfa" ON "nfa_approvals" USING btree ("nfa_id");--> statement-breakpoint
CREATE INDEX "idx_nfa_approvals_user" ON "nfa_approvals" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_nfa_items_nfa" ON "nfa_items" USING btree ("nfa_id");--> statement-breakpoint
CREATE INDEX "idx_nfa_society" ON "notes_for_approval" USING btree ("society_id");--> statement-breakpoint
CREATE INDEX "idx_nfa_status" ON "notes_for_approval" USING btree ("society_id","status");--> statement-breakpoint
CREATE INDEX "idx_nfa_creator" ON "notes_for_approval" USING btree ("created_by");