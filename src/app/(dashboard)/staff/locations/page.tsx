import { getActiveStaffLocations, getStaffList } from "@/services/staff-admin.service";
import { getSession } from "@/lib/auth/session";
import { db } from "@/db";
import { societies } from "@/db/schema";
import { eq } from "drizzle-orm";
import { LocationsClient } from "./locations-client";

export default async function StaffLocationsPage() {
  const session = await getSession();
  const [locations, staffMembers] = await Promise.all([
    getActiveStaffLocations(),
    getStaffList({ isActive: true }),
  ]);

  // Load geofence config for the society
  let geofence = null;
  if (session?.societyId) {
    const [society] = await db
      .select({
        geofenceLat: societies.geofenceLat,
        geofenceLng: societies.geofenceLng,
        geofenceRadiusMeters: societies.geofenceRadiusMeters,
      })
      .from(societies)
      .where(eq(societies.id, session.societyId))
      .limit(1);

    if (society?.geofenceLat && society?.geofenceLng) {
      geofence = {
        lat: parseFloat(society.geofenceLat),
        lng: parseFloat(society.geofenceLng),
        radius: society.geofenceRadiusMeters || 200,
      };
    }
  }

  const staffList = staffMembers.map((s) => ({
    id: s.id,
    name: s.name,
    role: s.role,
  }));

  return (
    <div className="container mx-auto py-6">
      <LocationsClient
        initialLocations={locations}
        staffList={staffList}
        geofence={geofence}
      />
    </div>
  );
}
