import { BeaconsClient } from "./beacons-client";
import { getBeaconsList } from "@/services/staff-admin.service";

export default async function BeaconsPage() {
  const beacons = await getBeaconsList();

  return <BeaconsClient beacons={beacons} />;
}
