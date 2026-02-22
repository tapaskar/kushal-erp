"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { submitQuotation } from "@/services/procurement.service";

type QuoteData = NonNullable<Awaited<ReturnType<typeof import("@/services/procurement.service").getQuoteByToken>>>;

type ItemState = {
  prItemId: string;
  itemName: string;
  quantity: string;
  unit: string;
  unitPrice: string;
  gstPercent: string;
};

export function QuoteClient({
  data,
  token,
}: {
  data: QuoteData;
  token: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [submitted, setSubmitted] = useState(false);
  const [validUntil, setValidUntil] = useState("");
  const [deliveryDays, setDeliveryDays] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("");
  const [notes, setNotes] = useState("");

  const [items, setItems] = useState<ItemState[]>(
    data.prItems.map((i) => ({
      prItemId: i.id,
      itemName: i.itemName,
      quantity: i.quantity,
      unit: i.unit,
      unitPrice: "",
      gstPercent: "18",
    }))
  );

  function updateItem(idx: number, field: keyof ItemState, value: string) {
    setItems((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item))
    );
  }

  // Live total calculation
  const totals = items.reduce(
    (acc, item) => {
      const qty = parseFloat(item.quantity) || 0;
      const price = parseFloat(item.unitPrice) || 0;
      const gst = parseFloat(item.gstPercent) || 0;
      const lineTotal = qty * price;
      const lineGst = lineTotal * (gst / 100);
      return {
        subtotal: acc.subtotal + lineTotal,
        gst: acc.gst + lineGst,
      };
    },
    { subtotal: 0, gst: 0 }
  );
  const grandTotal = totals.subtotal + totals.gst;

  function fmt(n: number) {
    return `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const missing = items.filter((i) => !i.unitPrice);
    if (missing.length > 0) {
      toast.error("Please fill in unit prices for all items");
      return;
    }

    startTransition(async () => {
      try {
        await submitQuotation(token, {
          validUntil: validUntil || undefined,
          deliveryDays: deliveryDays ? parseInt(deliveryDays) : undefined,
          paymentTerms: paymentTerms || undefined,
          notes: notes || undefined,
          items: items.map((i) => ({
            prItemId: i.prItemId,
            itemName: i.itemName,
            quantity: i.quantity,
            unit: i.unit,
            unitPrice: i.unitPrice,
            gstPercent: i.gstPercent || "0",
          })),
        });
        setSubmitted(true);
      } catch (err) {
        toast.error((err as Error).message || "Failed to submit quotation");
      }
    });
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-sm border p-8 text-center">
          <div className="text-5xl mb-4">🎉</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Quote Submitted!
          </h1>
          <p className="text-gray-500">
            Your quotation for <strong>{data.rfq.referenceNo}</strong> has been
            received. The society will review it and contact you with their decision.
          </p>
          <p className="text-sm text-gray-400 mt-4">
            Grand Total quoted: <strong>{fmt(grandTotal)}</strong>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2 text-primary font-bold text-lg mb-1">
                📡 Kushal-RWA
              </div>
              <h1 className="text-2xl font-bold text-gray-900">
                Quote Request — {data.rfq.referenceNo}
              </h1>
              <p className="text-gray-600 mt-1">{data.pr.title}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Respond by</p>
              <p className="text-lg font-bold text-red-600">{data.rfq.deadline}</p>
              <p className="text-sm text-gray-500 mt-1">
                For: <strong>{data.vendor.name}</strong>
              </p>
            </div>
          </div>

          {data.rfq.terms && (
            <div className="mt-4 bg-blue-50 border border-blue-100 rounded-lg p-3 text-sm text-blue-800">
              <strong>Terms & Conditions:</strong> {data.rfq.terms}
            </div>
          )}
        </div>

        {/* Quote Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Line Items */}
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="p-4 border-b bg-gray-50">
              <h2 className="font-semibold text-gray-900">
                Items Required — Enter Your Prices
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                Fill in your best unit price for each item below.
              </p>
            </div>
            <div className="divide-y">
              {items.map((item, idx) => (
                <div key={item.prItemId} className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{item.itemName}</p>
                      {data.prItems[idx]?.specification && (
                        <p className="text-sm text-gray-500">
                          {data.prItems[idx].specification}
                        </p>
                      )}
                      <p className="text-sm text-gray-600 mt-0.5">
                        Required: <strong>{item.quantity} {item.unit}</strong>
                      </p>
                    </div>
                    {item.unitPrice && (
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Line Total</p>
                        <p className="font-bold text-gray-900">
                          {fmt(
                            parseFloat(item.quantity) *
                              parseFloat(item.unitPrice) *
                              (1 + parseFloat(item.gstPercent || "0") / 100)
                          )}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">
                        Unit Price (₹) *
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        required
                        placeholder="0.00"
                        value={item.unitPrice}
                        onChange={(e) => updateItem(idx, "unitPrice", e.target.value)}
                        className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">
                        GST %
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="28"
                        step="any"
                        placeholder="18"
                        value={item.gstPercent}
                        onChange={(e) => updateItem(idx, "gstPercent", e.target.value)}
                        className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Running totals */}
            <div className="p-4 bg-gray-50 border-t space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span>{fmt(totals.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">GST</span>
                <span>{fmt(totals.gst)}</span>
              </div>
              <div className="flex justify-between text-base font-bold">
                <span>Grand Total</span>
                <span className="text-green-700">{fmt(grandTotal)}</span>
              </div>
            </div>
          </div>

          {/* Delivery & Terms */}
          <div className="bg-white rounded-xl shadow-sm border p-6 space-y-4">
            <h2 className="font-semibold text-gray-900">Delivery & Terms</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600 block mb-1">
                  Quote Valid Until
                </label>
                <input
                  type="date"
                  min={new Date().toISOString().split("T")[0]}
                  value={validUntil}
                  onChange={(e) => setValidUntil(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-1">
                  Delivery Days
                </label>
                <input
                  type="number"
                  min="1"
                  placeholder="e.g., 7"
                  value={deliveryDays}
                  onChange={(e) => setDeliveryDays(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-sm text-gray-600 block mb-1">
                  Payment Terms
                </label>
                <input
                  type="text"
                  placeholder="e.g., 50% advance, 50% on delivery"
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-sm text-gray-600 block mb-1">
                  Additional Notes
                </label>
                <textarea
                  placeholder="Any special conditions, warranty details, etc."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm min-h-[80px] resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold rounded-xl py-3 text-base transition-colors"
          >
            {isPending ? "Submitting..." : `Submit Quote — ${fmt(grandTotal)}`}
          </button>

          <p className="text-center text-xs text-gray-400">
            This link is unique to {data.vendor.name}. Do not share it.
          </p>
        </form>
      </div>
    </div>
  );
}
