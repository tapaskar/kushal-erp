import { getQuoteByToken } from "@/services/procurement.service";
import { QuoteClient } from "./quote-client";

export default async function QuotePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const data = await getQuoteByToken(token);

  if (!data) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-sm border p-8 text-center">
          <div className="text-4xl mb-4">🔗</div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Invalid Link</h1>
          <p className="text-gray-500">
            This quote link is invalid or has expired. Please contact the society
            office for assistance.
          </p>
        </div>
      </div>
    );
  }

  if (data.alreadySubmitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-sm border p-8 text-center">
          <div className="text-4xl mb-4">✅</div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Quote Already Submitted</h1>
          <p className="text-gray-500">
            Your quotation for <strong>{data.rfq.referenceNo}</strong> has already
            been received. The society will contact you with the decision.
          </p>
        </div>
      </div>
    );
  }

  if (new Date(data.rfq.deadline) < new Date()) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-sm border p-8 text-center">
          <div className="text-4xl mb-4">⏰</div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Deadline Passed</h1>
          <p className="text-gray-500">
            The deadline for <strong>{data.rfq.referenceNo}</strong> was{" "}
            <strong>{data.rfq.deadline}</strong>. This RFQ is now closed.
          </p>
        </div>
      </div>
    );
  }

  return <QuoteClient data={data} token={token} />;
}
