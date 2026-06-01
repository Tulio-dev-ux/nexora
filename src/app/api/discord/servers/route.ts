import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { publishEvent } from "@/lib/redis";

export async function GET() {
  const { session, error } = await requireAuth();
  if (error) return error;

  const servers = await prisma.server.findMany({
    where: { ownerId: session!.user.id },
    include: {
      _count: { select: { automations: true, moderationLogs: true } },
    },
  });

  return NextResponse.json({ servers });
}

export async function POST(request: Request) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const { discordId, name, icon, memberCount } = await request.json();

  const server = await prisma.server.upsert({
    where: { discordId },
    create: {
      discordId,
      name,
      icon,
      memberCount: memberCount ?? 0,
      ownerId: session!.user.id,
    },
    update: { name, icon, memberCount },
  });

  await publishEvent("server:update", { server, action: "linked" });

  return NextResponse.json({ server }, { status: 201 });
}
