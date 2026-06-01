import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

async function checkBotOnline() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/api/discord/events`,
      {
        headers: { Authorization: `Bearer ${process.env.DISCORD_BOT_SECRET ?? ""}` },
        cache: "no-store",
      }
    );
    return res.ok;
  } catch {
    return false;
  }
}

async function refreshServerMemberCounts(
  servers: { id: string; discordId: string; memberCount: number }[]
) {
  const botToken = process.env.DISCORD_BOT_TOKEN;
  if (!botToken) return servers;

  const updated = await Promise.all(
    servers.map(async (s) => {
      try {
        const res = await fetch(
          `https://discord.com/api/v10/guilds/${s.discordId}?with_counts=true`,
          { headers: { Authorization: `Bot ${botToken}` }, next: { revalidate: 60 } }
        );
        if (!res.ok) return s;
        const guild = (await res.json()) as { approximate_member_count?: number };
        const count = guild.approximate_member_count ?? s.memberCount;
        if (count !== s.memberCount) {
          await prisma.server.update({
            where: { id: s.id },
            data: { memberCount: count },
          });
        }
        return { ...s, memberCount: count };
      } catch {
        return s;
      }
    })
  );

  return updated;
}

export async function GET() {
  const { session, error } = await requireAuth();
  if (error) return error;

  const [rawServers, subscription, usage, tickets, moderationLogs, recentLogs, botOnline] =
    await Promise.all([
      prisma.server.findMany({
        where: { ownerId: session!.user.id },
        include: { _count: { select: { automations: true, moderationLogs: true } } },
      }),
      prisma.subscription.findUnique({ where: { userId: session!.user.id } }),
      prisma.aIUsage.groupBy({
        by: ["module"],
        _sum: { tokens: true, cost: true },
        where: { userId: session!.user.id },
      }),
      prisma.ticket.count({
        where: { userId: session!.user.id, status: { in: ["OPEN", "IN_PROGRESS"] } },
      }),
      prisma.moderationLog.count({
        where: { server: { ownerId: session!.user.id } },
      }),
      prisma.moderationLog.findMany({
        where: { server: { ownerId: session!.user.id } },
        orderBy: { createdAt: "desc" },
        take: 8,
      }),
      checkBotOnline(),
    ]);

  const servers = await refreshServerMemberCounts(rawServers);
  const totalMembers = servers.reduce((acc, s) => acc + s.memberCount, 0);

  return NextResponse.json({
    stats: {
      servers: servers.length,
      members: totalMembers,
      openTickets: tickets,
      moderationActions: moderationLogs,
      plan: subscription?.plan ?? "STARTER",
      botOnline,
    },
    servers,
    recentLogs,
    aiUsage: usage,
    subscription,
  });
}
