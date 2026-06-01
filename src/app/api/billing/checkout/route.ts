import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { PLANS, getOrCreateStripeCustomer, stripe } from "@/lib/stripe";
import type { Plan } from "@prisma/client";

export async function GET() {
  return NextResponse.json({ error: "Use GET /api/billing" }, { status: 405 });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { plan, coupon } = await request.json() as { plan: Plan; coupon?: string };

  const planConfig = PLANS[plan];
  if (!planConfig?.priceId) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  if (!stripe) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }

  const customerId = await getOrCreateStripeCustomer(
    session.user.id,
    session.user.email,
    session.user.name
  );

  const checkoutSession = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: planConfig.priceId, quantity: 1 }],
    discounts: coupon ? [{ coupon }] : undefined,
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?canceled=true`,
    metadata: { userId: session.user.id, plan },
  });

  return NextResponse.json({ url: checkoutSession.url });
}
