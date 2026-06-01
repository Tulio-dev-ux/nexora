import Stripe from "stripe";
import type { Plan } from "@prisma/client";

export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

export const PLANS = {
  STARTER: {
    name: "Starter",
    priceId: process.env.STRIPE_STARTER_PRICE_ID,
    amount: 4900,
    features: ["1 servidor", "5K eventos/mês", "IA Moderation básica"],
  },
  PRO: {
    name: "Pro",
    priceId: process.env.STRIPE_PRO_PRICE_ID,
    amount: 14900,
    features: ["5 servidores", "50K eventos/mês", "IA completa"],
  },
  ENTERPRISE: {
    name: "Enterprise",
    priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID,
    amount: 0,
    features: ["Ilimitado", "IA personalizada", "SLA garantido"],
  },
} as const;

export function planFromPriceId(priceId: string): Plan {
  if (priceId === process.env.STRIPE_PRO_PRICE_ID) return "PRO";
  if (priceId === process.env.STRIPE_ENTERPRISE_PRICE_ID) return "ENTERPRISE";
  return "STARTER";
}

export async function getOrCreateStripeCustomer(
  userId: string,
  email: string,
  name?: string | null
) {
  if (!stripe) throw new Error("Stripe not configured");

  const { prisma } = await import("@/lib/prisma");

  const existing = await prisma.subscription.findUnique({
    where: { userId },
  });

  if (existing?.stripeCustomerId) {
    return existing.stripeCustomerId;
  }

  const customer = await stripe.customers.create({
    email,
    name: name ?? undefined,
    metadata: { userId },
  });

  await prisma.subscription.upsert({
    where: { userId },
    create: {
      userId,
      stripeCustomerId: customer.id,
      plan: "STARTER",
    },
    update: {
      stripeCustomerId: customer.id,
    },
  });

  return customer.id;
}
