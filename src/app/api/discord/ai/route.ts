import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { resolveServer } from "@/lib/server-stats";
import { isAIConfigured } from "@/lib/ai";

export async function GET(request: Request) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const serverId = new URL(request.url).searchParams.get("serverId");
  if (!serverId) return NextResponse.json({ error: "serverId obrigatório" }, { status: 400 });

  const server = await resolveServer(session!.user.id, serverId);
  if (!server) return NextResponse.json({ error: "Servidor não encontrado" }, { status: 404 });

  const usage = await prisma.aIUsage.groupBy({
    by: ["module"],
    where: { serverId: server.id },
    _sum: { tokens: true, cost: true },
    _count: true,
  });

  const totalTokens = usage.reduce((a, u) => a + (u._sum.tokens ?? 0), 0);
  const totalCost = usage.reduce((a, u) => a + (u._sum.cost ?? 0), 0);

  const modules = [
    { key: "moderation", name: "IA Moderadora", icon: "shield" },
    { key: "assistant", name: "IA Assistente", icon: "bot" },
    { key: "analytics", name: "IA Analytics", icon: "chart" },
    { key: "general", name: "IA Geral", icon: "brain" },
  ].map((m) => {
    const u = usage.find((x) => x.module === m.key || x.module.includes(m.key));
    const tokens = u?._sum.tokens ?? 0;
    const pct = totalTokens ? Math.round((tokens / totalTokens) * 100) : 0;
    return {
      name: m.name,
      status: isAIConfigured() ? "active" : "offline",
      usage: pct,
      tokens,
      cost: u?._sum.cost ?? 0,
      calls: u?._count ?? 0,
    };
  });

  return NextResponse.json({
    configured: isAIConfigured(),
    stats: { totalTokens, totalCost, totalCalls: usage.reduce((a, u) => a + u._count, 0) },
    modules,
    suggestions: [
      totalTokens > 50000 ? "Alto uso de IA — considere upgrade Pro" : "Uso de IA dentro do normal",
      !isAIConfigured() ? "Configure GROQ_API_KEY no .env" : "Groq conectado e operacional",
      modules.find((m) => m.name.includes("Moderadora"))?.calls === 0
        ? "Ative moderação automática no Discord"
        : "Moderação IA ativa no servidor",
    ],
  });
}
