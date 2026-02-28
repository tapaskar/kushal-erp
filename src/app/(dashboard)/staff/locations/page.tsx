import { getActiveStaffLocations, getStaffList } from "@/services/staff-admin.service";
import { LocationsClient } from "./locations-client";

export default async function StaffLocationsPage() {
  const [locations, staffMembers] = await Promise.all([
    getActiveStaffLocations(),
    getStaffList({ isActive: true }),
  ]);

  const staffList = staffMembers.map((s) => ({
    id: s.id,
    name: s.name,
    role: s.role,
  }));

  return (
    <div className="container mx-auto py-6">
      <LocationsClient initialLocations={locations} staffList={staffList} />
    </div>
  );
}
