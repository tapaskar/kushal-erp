import { getSocietyForVendorPortal } from "@/services/vendor.service";
import { VendorRegisterClient } from "./vendor-register-client";

export default async function VendorRegisterPage({
  params,
}: {
  params: Promise<{ societyId: string }>;
}) {
  const { societyId } = await params;
  const society = await getSocietyForVendorPortal(societyId);

  if (!society) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-sm border p-8 text-center">
          <div className="text-4xl mb-4">🔗</div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Invalid Link</h1>
          <p className="text-gray-500">
            This vendor registration link is invalid. Please contact the society
            for a valid link.
          </p>
        </div>
      </div>
    );
  }

  return <VendorRegisterClient society={society} societyId={societyId} />;
}
