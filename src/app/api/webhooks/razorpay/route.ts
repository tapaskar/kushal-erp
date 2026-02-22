import { NextResponse } from "next/server";

/**
 * Razorpay webhook handler — placeholder.
 *
 * When Razorpay is configured:
 * 1. Verify webhook signature using RAZORPAY_WEBHOOK_SECRET
 * 2. Handle event: payment.captured → record payment + JE + update invoice
 * 3. Handle event: payment.failed → log failure
 * 4. Idempotency: check if payment already exists by razorpay_payment_id
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const event = body.event;

    console.log("[Razorpay Webhook] Received event:", event);

    // TODO: Verify signature
    // const signature = request.headers.get("x-razorpay-signature");
    // const isValid = verifyWebhookSignature(body, signature);
    // if (!isValid) return NextResponse.json({ error: "Invalid signature" }, { status: 400 });

    switch (event) {
      case "payment.captured": {
        const payment = body.payload?.payment?.entity;
        console.log("[Razorpay Webhook] Payment captured:", payment?.id);

        // TODO: When Razorpay is configured, implement:
        // 1. Find invoice by razorpay_order_id
        // 2. Check idempotency (payment already recorded?)
        // 3. Record payment + create journal entry
        // 4. Update invoice status
        break;
      }

      case "payment.failed": {
        const payment = body.payload?.payment?.entity;
        console.log("[Razorpay Webhook] Payment failed:", payment?.id);
        break;
      }

      default:
        console.log("[Razorpay Webhook] Unhandled event:", event);
    }

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("[Razorpay Webhook] Error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
