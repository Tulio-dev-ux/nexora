import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { moderateContent } from "@/lib/ai";
import { publishEvent } from "@/lib/redis";
import { findUserByDiscordId } from "@/lib/discord-sync";

const BOT_SECRET = process.env.DISCORD_BOT_SECRET;

async function verifyBotRequest() {
  const authHeader = (await headers()).get("authorization");
  return authHeader === `Bearer ${BOT_SECRET}`;
}

export async function POST(request: Request) {
  if (!(await verifyBotRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const {
    action,
    serverId,
    userId,
    content,
    messageId,
    channelId,
    name,
    icon,
    memberCount,
    ownerDiscordId,
    subject,
    description,
  } = body;

  if (action === "ping") {
    return NextResponse.json({ ok: true, latencyMs: 0 });
  }

  if (action === "guild_register") {
    const user = await findUserByDiscordId(ownerDiscordId);

    if (!user) {
      return NextResponse.json({
        linked: false,
        reason: "Dono não encontrado — entre no painel com a conta Discord do servidor.",
      });
    }

    const server = await prisma.server.upsert({
      where: { discordId: serverId },
      create: {
        discordId: serverId,
        name: name ?? "Servidor Discord",
        icon: icon ?? null,
        memberCount: memberCount ?? 0,
        ownerId: user.id,
      },
      update: {
        name: name ?? undefined,
        icon: icon ?? undefined,
        memberCount: memberCount ?? undefined,
        ownerId: user.id,
      },
    });

    await publishEvent("server:update", { server, action: "linked" });
    return NextResponse.json({ linked: true, server });
  }

  const server = await prisma.server.findUnique({ where: { discordId: serverId } });
  if (!server) {
    return NextResponse.json({ error: "Servidor não registrado", ok: false }, { status: 404 });
  }

  if (action === "command_status") {
    const [modLogs, automations, owner] = await Promise.all([
      prisma.moderationLog.count({ where: { serverId: server.id } }),
      prisma.automation.count({ where: { serverId: server.id, enabled: true } }),
      prisma.user.findUnique({
        where: { id: server.ownerId },
        include: { subscription: true },
      }),
    ]);

    return NextResponse.json({
      ok: true,
      stats: {
        name: server.name,
        members: server.memberCount,
        modLogs,
        automations,
        plan: owner?.subscription?.plan ?? "STARTER",
      },
    });
  }

  if (action === "command_moderate") {
    const result = await moderateContent(content, server.ownerId, server.id);
    return NextResponse.json({ result });
  }

  if (action === "command_ticket") {
    const ticket = await prisma.ticket.create({
      data: {
        subject: subject ?? "Ticket via Discord",
        description: description ?? `Aberto por usuário Discord ${userId}`,
        department: "Discord",
        priority: "MEDIUM",
        userId: server.ownerId,
        slaDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });
    await publishEvent("ticket:new", { ticket, serverId: server.discordId });
    return NextResponse.json({ ticket });
  }

  if (action === "log_moderation") {
    const { targetUserId, reason: modReason, modAction } = body;
    await prisma.moderationLog.create({
      data: {
        serverId: server.id,
        userId: targetUserId ?? userId,
        action: modAction ?? "moderation",
        reason: modReason ?? null,
      },
    });
    await publishEvent("moderation:action", {
      serverId: server.discordId,
      action: modAction,
      reason: modReason,
      userId: targetUserId,
    });
    return NextResponse.json({ ok: true });
  }

  if (action === "moderate") {
    const result = await moderateContent(content, server.ownerId, server.id);

    if (result.action !== "allow") {
      await prisma.moderationLog.create({
        data: {
          serverId: server.id,
          userId,
          action: result.action,
          reason: result.reason,
        },
      });

      await publishEvent("moderation:action", {
        serverId: server.discordId,
        action: result.action,
        reason: result.reason,
        userId,
      });
    }

    return NextResponse.json({ result });
  }

  if (action === "member_join") {
    await prisma.server.update({
      where: { id: server.id },
      data: { memberCount: { increment: 1 } },
    });

    const automations = await prisma.automation.findMany({
      where: { serverId: server.id, enabled: true },
    });

    const welcomeAutomation = automations.find(
      (a) => (a.trigger as { type?: string })?.type === "member_join"
    );

    await publishEvent("member:join", {
      serverId: server.discordId,
      userId,
      automation: welcomeAutomation?.id,
    });

    return NextResponse.json({ automations: welcomeAutomation ? [welcomeAutomation] : [] });
  }

  if (action === "message") {
    await publishEvent("message:new", {
      serverId: server.discordId,
      channelId,
      messageId,
      userId,
    });

    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}

export async function GET() {
  if (!(await verifyBotRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const servers = await prisma.server.findMany({
    include: {
      automations: { where: { enabled: true } },
      owner: { select: { subscription: { select: { plan: true } } } },
    },
  });

  return NextResponse.json({ servers });
}
