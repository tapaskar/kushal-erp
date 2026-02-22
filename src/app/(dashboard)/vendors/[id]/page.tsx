import { notFound } from "next/navigation";
import { getVendorById } from "@/services/vendor.service";
import { VendorDetailClient } from "./vendor-detail-client";

export default async function VendorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const vendor = await getVendorById(id);
  if (!vendor) notFound();

  return <VendorDetailClient vendor={vendor} />;
}
