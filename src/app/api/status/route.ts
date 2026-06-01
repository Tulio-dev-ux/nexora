import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isRedisConfigured } from "@/lib/redis";
import { isAIConfigured } from "@/lib/ai";

export async function GET() {
  const services = [
    { name: "API", status: "operational" },
    { name: "Database", status: "operational" },
    { name: "Redis", status: isRedisConfigured() ? "operational" : "degraded" },
    { name: "AI (Groq)", status: isAIConfigured() ? "operational" : "degraded" },
    { name: "Discord Bot", status: process.env.DISCORD_BOT_TOKEN ? "operational" : "degraded" },
  ];

  let liveMetric = null;
  try {
    liveMetric = await prisma.liveMetric.findUnique({ where: { id: "global" } });
  } catch {
    services[1] = { name: "Database", status: "outage" };
  }

  const overall = services.some((s) => s.status === "outage")
    ? "outage"
    : services.some((s) => s.status === "degraded")
      ? "degraded"
      : "operational";

  return NextResponse.json({
    status: overall,
    updatedAt: new Date().toISOString(),
    services,
    metrics: liveMetric,
  });
}
