import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { resolveServer, getModerationStats } from "@/lib/server-stats";

export async function GET(request: Request) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const serverId = new URL(request.url).searchParams.get("serverId");
  if (!serverId) return NextResponse.json({ error: "serverId obrigatório" }, { status: 400 });

  const server = await resolveServer(session!.user.id, serverId);
  if (!server) return NextResponse.json({ error: "Servidor não encontrado" }, { status: 404 });

  const { logs, counts, total } = await getModerationStats(server.id);

  const automations = await prisma.automation.findMany({
    where: { serverId: server.id },
    orderBy: { runCount: "desc" },
  });

  const rules = automations.map((a) => ({
    id: a.id,
    name: a.name,
    status: a.enabled ? "active" : "paused",
    triggers: a.runCount,
    trigger: a.trigger,
  }));

  const recent = logs.slice(0, 20).map((l) => ({
    id: l.id,
    userId: l.userId,
    action: l.action,
    reason: l.reason,
    time: l.createdAt,
  }));

  return NextResponse.json({
    stats: {
      warnings: counts.warn,
      mutes: counts.mute,
      bans: counts.ban,
      autoActions: total,
    },
    recent,
    rules,
  });
}
