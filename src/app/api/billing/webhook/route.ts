import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe, planFromPriceId } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import type Stripe from "stripe";

export async function POST(request: Request) {
  if (!stripe) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }

  const body = await request.text();
  const signature = (await headers()).get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      const plan = session.metadata?.plan;

      if (userId && plan) {
        await prisma.subscription.upsert({
          where: { userId },
          create: {
            userId,
            plan: plan as "STARTER" | "PRO" | "ENTERPRISE",
            stripeCustomerId: session.customer as string,
            stripeSubId: session.subscription as string,
            status: "active",
          },
          update: {
            plan: plan as "STARTER" | "PRO" | "ENTERPRISE",
            stripeSubId: session.subscription as string,
            status: "active",
          },
        });
      }
      break;
    }

    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const customerId = sub.customer as string;
      const periodEnd = (sub as Stripe.Subscription & { current_period_end?: number }).current_period_end;

      const subscription = await prisma.subscription.findFirst({
        where: { stripeCustomerId: customerId },
      });

      if (subscription) {
        const priceId = sub.items.data[0]?.price.id;
        await prisma.subscription.update({
          where: { id: subscription.id },
          data: {
            status: sub.status,
            plan: priceId ? planFromPriceId(priceId) : subscription.plan,
            currentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : undefined,
            stripeSubId: sub.id,
          },
        });
      }
      break;
    }

    case "invoice.payment_succeeded": {
      const invoice = event.data.object as Stripe.Invoice;
      console.log("Payment succeeded:", invoice.id);
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = invoice.customer as string;
      await prisma.subscription.updateMany({
        where: { stripeCustomerId: customerId },
        data: { status: "past_due" },
      });
      break;
    }
  }

  return NextResponse.json({ received: true });
}
