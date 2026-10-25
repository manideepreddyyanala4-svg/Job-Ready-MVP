import { createHmac, timingSafeEqual } from "node:crypto";
import { projectPassPriceInr } from "@/lib/pricing";
import { sanitizeAnalyticsProperties, type FunnelEvent, type FunnelProperties } from "@/lib/analytics";

export interface PaymentProvider {
  createCheckout(): Promise<{ checkoutId: string; amount: number }>;
}

export type PaymentTransaction = {
  transactionId: string;
  checkoutId: string;
  amount: number;
  status: "created" | "paid" | "failed";
};

export type ProjectEntitlement = {
  entitlementId: string;
  projectId: string;
  status: "active";
  sourceTransactionId: string;
};

export class MockPaymentProvider implements PaymentProvider {
  async createCheckout() {
    return { checkoutId: `demo_${Date.now()}`, amount: projectPassPriceInr };
  }
}

export class RazorpayPaymentProvider implements PaymentProvider {
  async createCheckout(): Promise<{ checkoutId: string; amount: number }> {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      throw new Error("Razorpay credentials are not configured.");
    }
    throw new Error("Razorpay order creation must be implemented in the server payment adapter.");
  }
}

export function verifyRazorpayWebhookSignature(payload: string, signature: string, secret = process.env.RAZORPAY_WEBHOOK_SECRET) {
  if (!secret || !signature) return false;
  const expected = createHmac("sha256", secret).update(payload).digest("hex");
  const expectedBytes = Buffer.from(expected);
  const signatureBytes = Buffer.from(signature);
  return expectedBytes.length === signatureBytes.length && timingSafeEqual(expectedBytes, signatureBytes);
}

export function createMockEntitlement(projectId: string, transaction: PaymentTransaction): ProjectEntitlement {
  return {
    entitlementId: `entitlement_${Date.now()}`,
    projectId,
    status: "active",
    sourceTransactionId: transaction.transactionId,
  };
}

export interface AnalyticsProvider {
  track(event: FunnelEvent, properties?: FunnelProperties): void;
}

export const analytics: AnalyticsProvider = {
  track: (event, properties = {}) => {
    const safe = sanitizeAnalyticsProperties(properties);
    if (process.env.NODE_ENV === "development") console.info("[jobready:funnel]", event, safe);
  },
};
