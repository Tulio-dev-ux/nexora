import { prisma } from "@/lib/prisma";
import { fetchGuild } from "@/lib/discord-api";
import { getOwnedServer } from "@/lib/server-auth";

export async function resolveServer(userId: string, serverDiscordId: string) {
  const server = await getOwnedServer(userId, serverDiscordId);
  if (!server) return null;
  return server;
}

export async function getGuildStats(serverDiscordId: string) {
  try {
    const guild = await fetchGuild(serverDiscordId);
    return {
      name: guild.name,
      totalMembers: guild.approximate_member_count ?? guild.member_count ?? 0,
      onlineNow: guild.approximate_presence_count ?? 0,
    };
  } catch {
    return { name: "", totalMembers: 0, onlineNow: 0 };
  }
}

export function groupByDay<T extends { createdAt: Date }>(items: T[], days = 30) {
  const map = new Map<string, number>();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    map.set(d.toISOString().slice(0, 10), 0);
  }
  for (const item of items) {
    const key = item.createdAt.toISOString().slice(0, 10);
    if (map.has(key)) map.set(key, (map.get(key) ?? 0) + 1);
  }
  return Array.from(map.entries()).map(([date, count], i) => ({
    day: `${i + 1}`,
    date,
    count,
  }));
}

export async function getModerationStats(serverId: string) {
  const logs = await prisma.moderationLog.findMany({
    where: { serverId },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const counts = { warn: 0, mute: 0, ban: 0, other: 0 };
  for (const log of logs) {
    const a = log.action.toLowerCase();
    if (a.includes("warn")) counts.warn++;
    else if (a.includes("mute")) counts.mute++;
    else if (a.includes("ban")) counts.ban++;
    else counts.other++;
  }

  return { logs, counts, total: logs.length };
}
