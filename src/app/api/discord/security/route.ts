import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { resolveServer } from "@/lib/server-stats";

export async function GET(request: Request) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const serverId = new URL(request.url).searchParams.get("serverId");
  if (!serverId) {
    return NextResponse.json({ error: "serverId obrigatório" }, { status: 400 });
  }

  const server = await resolveServer(session!.user.id, serverId);
  if (!server) {
    return NextResponse.json({ error: "Servidor não encontrado" }, { status: 404 });
  }

  const [recentLogs, automations] = await Promise.all([
    prisma.moderationLog.findMany({
      where: { serverId: server.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.automation.findMany({
      where: { serverId: server.id, enabled: true },
      select: { id: true, name: true, trigger: true, runCount: true },
    }),
  ]);

  const threatCount = recentLogs.filter((l) =>
    ["ban", "mute", "raid"].some((t) => l.action.toLowerCase().includes(t))
  ).length;

  return NextResponse.json({
    server: { id: server.id, name: server.name, discordId: server.discordId },
    stats: {
      threatBlocks: threatCount,
      activeRules: automations.length,
      recentActions: recentLogs.length,
    },
    recentLogs,
    automations,
  });
}
