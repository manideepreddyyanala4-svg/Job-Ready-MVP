import { NextResponse } from "next/server";
import { createMockEntitlement, MockPaymentProvider } from "@/lib/providers";
import { isProductionMode } from "@/lib/runtime";

export async function POST(request: Request) {
  try {
    if (isProductionMode()) {
      return NextResponse.json({ ok: false, message: "Mock payments are disabled in production mode." }, { status: 404 });
    }
    const body = await request.json() as { projectId?: string };
    if (!body.projectId) return NextResponse.json({ ok: false, message: "A project is required." }, { status: 400 });
    const checkout = await new MockPaymentProvider().createCheckout();
    const transaction = {
      transactionId: `txn_${Date.now()}`,
      checkoutId: checkout.checkoutId,
      amount: checkout.amount,
      status: "paid" as const,
    };
    return NextResponse.json({ ok: true, transaction, entitlement: createMockEntitlement(body.projectId, transaction) });
  } catch {
    return NextResponse.json({ ok: false, message: "The mock payment could not be completed." }, { status: 400 });
  }
}
