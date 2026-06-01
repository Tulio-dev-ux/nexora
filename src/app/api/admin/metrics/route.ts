import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { PLANS } from "@/lib/stripe";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const [
    totalUsers,
    totalServers,
    openTickets,
    aiAgg,
    subscriptions,
    liveMetric,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.server.count(),
    prisma.ticket.count({ where: { status: { in: ["OPEN", "IN_PROGRESS"] } } }),
    prisma.aIUsage.aggregate({ _sum: { tokens: true, cost: true } }),
    prisma.subscription.groupBy({ by: ["plan"], _count: true }),
    prisma.liveMetric.findUnique({ where: { id: "global" } }),
  ]);

  const mrr = subscriptions.reduce((acc, s) => {
    const plan = PLANS[s.plan as keyof typeof PLANS];
    return acc + (plan?.amount ?? 0) / 100;
  }, 0);

  return NextResponse.json({
    metrics: {
      totalUsers,
      totalServers,
      openTickets,
      mrr,
      aiTokens: aiAgg._sum.tokens ?? 0,
      aiCost: aiAgg._sum.cost ?? 0,
      live: liveMetric,
      plans: subscriptions,
    },
  });
}
