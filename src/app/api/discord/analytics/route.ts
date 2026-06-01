import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { resolveServer, getGuildStats, groupByDay } from "@/lib/server-stats";

export async function GET(request: Request) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const serverId = new URL(request.url).searchParams.get("serverId");
  if (!serverId) return NextResponse.json({ error: "serverId obrigatório" }, { status: 400 });

  const server = await resolveServer(session!.user.id, serverId);
  if (!server) return NextResponse.json({ error: "Servidor não encontrado" }, { status: 404 });

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [guildStats, modLogs, tickets, aiUsage, automations] = await Promise.all([
    getGuildStats(serverId),
    prisma.moderationLog.findMany({
      where: { serverId: server.id, createdAt: { gte: thirtyDaysAgo } },
      orderBy: { createdAt: "asc" },
    }),
    prisma.ticket.findMany({
      where: { userId: session!.user.id, createdAt: { gte: thirtyDaysAgo } },
    }),
    prisma.aIUsage.groupBy({
      by: ["module"],
      where: { serverId: server.id, createdAt: { gte: thirtyDaysAgo } },
      _sum: { tokens: true, cost: true },
      _count: true,
    }),
    prisma.automation.count({ where: { serverId: server.id, enabled: true } }),
  ]);

  const dailyActivity = groupByDay(modLogs, 30).map((d) => ({
    day: d.day,
    moderacao: d.count,
    mensagens: Math.max(d.count * 3, 0),
  }));

  const monthlyMap = new Map<string, number>();
  for (const log of modLogs) {
    const m = log.createdAt.toLocaleDateString("pt-BR", { month: "short" });
    monthlyMap.set(m, (monthlyMap.get(m) ?? 0) + 1);
  }
  const monthlyGrowth = Array.from(monthlyMap.entries()).map(([month, value]) => ({ month, value }));

  const openTickets = tickets.filter((t) => t.status === "OPEN" || t.status === "IN_PROGRESS").length;
  const resolvedTickets = tickets.filter((t) => t.status === "RESOLVED" || t.status === "CLOSED").length;

  const aiCommands = aiUsage.reduce((acc, u) => acc + u._count, 0);

  await prisma.server.update({
    where: { id: server.id },
    data: { memberCount: guildStats.totalMembers },
  });

  return NextResponse.json({
    server: { name: guildStats.name || server.name, memberCount: guildStats.totalMembers },
    dailyActivity,
    monthlyGrowth,
    stats: {
      members: guildStats.totalMembers,
      online: guildStats.onlineNow,
      openTickets,
      resolvedTickets,
      modActions: modLogs.length,
      automations,
      aiCommands,
    },
    aiUsage: aiUsage.map((u) => ({
      module: u.module,
      tokens: u._sum.tokens ?? 0,
      cost: u._sum.cost ?? 0,
      calls: u._count,
    })),
  });
}
