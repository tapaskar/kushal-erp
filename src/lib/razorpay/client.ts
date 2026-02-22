/**
 * Razorpay client — placeholder for production integration.
 *
 * To enable:
 * 1. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env
 * 2. Uncomment the Razorpay initialization below
 * 3. Implement createOrder, verifyPayment, createPaymentLink
 */

// import Razorpay from "razorpay";
//
// export const razorpay = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID!,
//   key_secret: process.env.RAZORPAY_KEY_SECRET!,
// });

export const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder";
export const RAZORPAY_ENABLED = !!process.env.RAZORPAY_KEY_SECRET;

/**
 * Placeholder: Create a Razorpay order for an invoice.
 */
export async function createRazorpayOrder(params: {
  amount: number; // in paise (₹100 = 10000)
  currency?: string;
  receipt: string;
  notes?: Record<string, string>;
}): Promise<{ id: string; amount: number; currency: string }> {
  if (!RAZORPAY_ENABLED) {
    // Return a mock order for dev
    return {
      id: `order_mock_${Date.now()}`,
      amount: params.amount,
      currency: params.currency || "INR",
    };
  }

  // TODO: Replace with real Razorpay API call
  // const order = await razorpay.orders.create({
  //   amount: params.amount,
  //   currency: params.currency || "INR",
  //   receipt: params.receipt,
  //   notes: params.notes,
  // });
  // return order;

  throw new Error("Razorpay not configured. Set RAZORPAY_KEY_SECRET.");
}

/**
 * Placeholder: Verify Razorpay payment signature.
 */
export function verifyRazorpaySignature(params: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  if (!RAZORPAY_ENABLED) return true; // Accept all in dev

  // TODO: Replace with real HMAC verification
  // const crypto = require("crypto");
  // const generated = crypto
  //   .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
  //   .update(`${params.orderId}|${params.paymentId}`)
  //   .digest("hex");
  // return generated === params.signature;

  return false;
}

/**
 * Placeholder: Create a payment link for WhatsApp sharing.
 */
export async function createPaymentLink(params: {
  amount: number; // in paise
  invoiceNumber: string;
  customerName: string;
  customerPhone: string;
  description: string;
}): Promise<{ id: string; short_url: string }> {
  if (!RAZORPAY_ENABLED) {
    return {
      id: `plink_mock_${Date.now()}`,
      short_url: `https://rzp.io/mock/${Date.now()}`,
    };
  }

  throw new Error("Razorpay not configured. Set RAZORPAY_KEY_SECRET.");
}
