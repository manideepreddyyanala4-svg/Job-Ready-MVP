import { createHmac, timingSafeEqual } from "node:crypto";

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
    return { checkoutId: `demo_${Date.now()}`, amount: 499 };
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
  track(event: AnalyticsEvent, properties?: Record<string, string>): void;
}

export type AnalyticsEvent =
  | "landing_view"
  | "assessment_started"
  | "onboarding_completed"
  | "resume_uploaded"
  | "analysis_completed"
  | "role_viewed"
  | "project_recommendation_viewed"
  | "project_selected"
  | "mission_started"
  | "mission_completed"
  | "paywall_viewed"
  | "checkout_started"
  | "payment_completed"
  | "project_unlocked";

export const analytics: AnalyticsProvider = {
  track: (event, properties) => {
    if (process.env.NODE_ENV === "development") console.info("[analytics]", event, properties ?? {});
  },
};
