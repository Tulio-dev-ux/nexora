import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { getOwnedServer } from "@/lib/server-auth";
import {
  fetchGuild,
  fetchGuildMembers,
  fetchGuildRoles,
  addMemberRole,
  removeMemberRole,
  memberAvatarUrl,
  roleColorHex,
  DiscordApiError,
} from "@/lib/discord-api";

export async function GET(request: Request) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const serverId = new URL(request.url).searchParams.get("serverId");
  if (!serverId) {
    return NextResponse.json({ error: "serverId obrigatório" }, { status: 400 });
  }

  const server = await getOwnedServer(session!.user.id, serverId);
  if (!server) {
    return NextResponse.json({ error: "Servidor não encontrado" }, { status: 404 });
  }

  try {
    const [guild, members, roles] = await Promise.all([
      fetchGuild(serverId),
      fetchGuildMembers(serverId),
      fetchGuildRoles(serverId),
    ]);

    const totalMembers =
      guild.approximate_member_count ?? guild.member_count ?? members.length;
    const onlineNow = guild.approximate_presence_count ?? 0;

    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const newThisWeek = members.filter(
      (m) => new Date(m.joined_at).getTime() >= weekAgo
    ).length;

    await prisma.server.update({
      where: { id: server.id },
      data: { memberCount: totalMembers, name: guild.name },
    });

    const assignableRoles = roles
      .filter((r) => r.name !== "@everyone" && !r.managed)
      .sort((a, b) => b.position - a.position)
      .map((r) => ({
        id: r.id,
        name: r.name,
        color: roleColorHex(r.color),
      }));

    const roleMap = Object.fromEntries(roles.map((r) => [r.id, r]));

    const memberList = members
      .filter((m) => !m.user.bot)
      .map((m) => ({
        id: m.user.id,
        username: m.user.global_name ?? m.user.username,
        displayName: m.nick ?? m.user.global_name ?? m.user.username,
        avatar: memberAvatarUrl(m.user.id, m.user.avatar),
        joinedAt: m.joined_at,
        roles: m.roles
          .filter((id) => id !== serverId && roleMap[id])
          .map((id) => ({
            id,
            name: roleMap[id].name,
            color: roleColorHex(roleMap[id].color),
          })),
      }))
      .sort((a, b) => a.displayName.localeCompare(b.displayName));

    return NextResponse.json({
      server: { id: server.id, discordId: server.discordId, name: guild.name },
      stats: { totalMembers, onlineNow, newThisWeek },
      roles: assignableRoles,
      members: memberList,
    });
  } catch (err) {
    if (err instanceof DiscordApiError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("members GET:", err);
    return NextResponse.json({ error: "Erro ao carregar membros" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const body = await request.json();
  const { serverId, memberId, roleId, action } = body as {
    serverId?: string;
    memberId?: string;
    roleId?: string;
    action?: "add" | "remove";
  };

  if (!serverId || !memberId || !roleId || !action) {
    return NextResponse.json({ error: "Campos obrigatórios: serverId, memberId, roleId, action" }, { status: 400 });
  }

  const server = await getOwnedServer(session!.user.id, serverId);
  if (!server) {
    return NextResponse.json({ error: "Servidor não encontrado" }, { status: 404 });
  }

  try {
    if (action === "add") {
      await addMemberRole(serverId, memberId, roleId);
    } else {
      await removeMemberRole(serverId, memberId, roleId);
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof DiscordApiError) {
      const msg =
        err.status === 403
          ? "Sem permissão — o cargo do bot deve estar acima do cargo que você quer gerenciar"
          : err.message;
      return NextResponse.json({ error: msg }, { status: err.status });
    }
    return NextResponse.json({ error: "Erro ao atualizar cargo" }, { status: 500 });
  }
}
