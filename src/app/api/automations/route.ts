import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const serverDiscordId = new URL(request.url).searchParams.get("serverId");

  const automations = await prisma.automation.findMany({
    where: {
      server: {
        ownerId: session!.user.id,
        ...(serverDiscordId ? { discordId: serverDiscordId } : {}),
      },
    },
    include: { server: { select: { name: true, discordId: true } } },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({ automations });
}

export async function POST(request: Request) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const { serverId, name, trigger, actions } = await request.json();

  const server = await prisma.server.findFirst({
    where: { id: serverId, ownerId: session!.user.id },
  });

  if (!server) {
    return NextResponse.json({ error: "Server not found" }, { status: 404 });
  }

  const automation = await prisma.automation.create({
    data: { serverId, name, trigger, actions },
  });

  return NextResponse.json({ automation }, { status: 201 });
}

export async function PATCH(request: Request) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const { id, enabled, name, trigger, actions } = await request.json();

  const automation = await prisma.automation.updateMany({
    where: { id, server: { ownerId: session!.user.id } },
    data: { enabled, name, trigger, actions },
  });

  return NextResponse.json({ automation });
}
