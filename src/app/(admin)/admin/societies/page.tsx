import { getAllSocieties } from "@/services/admin.service";
import { SocietiesClient } from "./societies-client";

export default async function SocietiesPage() {
  const societies = await getAllSocieties();

  return <SocietiesClient societies={societies} />;
}
