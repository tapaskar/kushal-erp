ALTER TABLE "societies" ADD COLUMN "geofence_lat" numeric(10, 7);--> statement-breakpoint
ALTER TABLE "societies" ADD COLUMN "geofence_lng" numeric(10, 7);--> statement-breakpoint
ALTER TABLE "societies" ADD COLUMN "geofence_radius_meters" integer DEFAULT 200;