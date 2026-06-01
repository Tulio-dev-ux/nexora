const DISCORD_API = "https://discord.com/api/v10";

export class DiscordApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

function botToken() {
  const token = process.env.DISCORD_BOT_TOKEN?.trim();
  if (!token) throw new DiscordApiError(500, "DISCORD_BOT_TOKEN não configurado");
  return token;
}

function headers() {
  return { Authorization: `Bot ${botToken()}` };
}

export interface DiscordGuild {
  id: string;
  name: string;
  icon: string | null;
  member_count?: number;
  approximate_member_count?: number;
  approximate_presence_count?: number;
}

export interface DiscordRole {
  id: string;
  name: string;
  color: number;
  position: number;
  managed: boolean;
  permissions: string;
}

export interface DiscordMember {
  user: {
    id: string;
    username: string;
    global_name: string | null;
    avatar: string | null;
    bot?: boolean;
  };
  roles: string[];
  joined_at: string;
  nick: string | null;
}

export async function fetchGuild(guildId: string): Promise<DiscordGuild> {
  const res = await fetch(`${DISCORD_API}/guilds/${guildId}?with_counts=true`, {
    headers: headers(),
    next: { revalidate: 0 },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new DiscordApiError(
      res.status,
      res.status === 403
        ? "Ative Server Members Intent no Discord Developer Portal"
        : text || "Erro ao buscar servidor"
    );
  }
  return res.json();
}

export async function fetchGuildRoles(guildId: string): Promise<DiscordRole[]> {
  const res = await fetch(`${DISCORD_API}/guilds/${guildId}/roles`, {
    headers: headers(),
  });
  if (!res.ok) throw new DiscordApiError(res.status, "Erro ao buscar cargos");
  return res.json();
}

export async function fetchGuildMembers(guildId: string): Promise<DiscordMember[]> {
  const all: DiscordMember[] = [];
  let after: string | undefined;

  for (let page = 0; page < 10; page++) {
    const url = new URL(`${DISCORD_API}/guilds/${guildId}/members`);
    url.searchParams.set("limit", "1000");
    if (after) url.searchParams.set("after", after);

    const res = await fetch(url.toString(), { headers: headers() });
    if (!res.ok) {
      throw new DiscordApiError(
        res.status,
        res.status === 403
          ? "Ative Server Members Intent no Discord Developer Portal → Bot → Privileged Gateway Intents"
          : "Erro ao buscar membros"
      );
    }

    const batch = (await res.json()) as DiscordMember[];
    if (!batch.length) break;
    all.push(...batch);
    if (batch.length < 1000) break;
    after = batch[batch.length - 1].user.id;
  }

  return all;
}

export async function addMemberRole(guildId: string, userId: string, roleId: string) {
  const res = await fetch(
    `${DISCORD_API}/guilds/${guildId}/members/${userId}/roles/${roleId}`,
    { method: "PUT", headers: headers() }
  );
  if (!res.ok) {
    const text = await res.text();
    throw new DiscordApiError(res.status, text || "Erro ao adicionar cargo");
  }
}

export async function removeMemberRole(guildId: string, userId: string, roleId: string) {
  const res = await fetch(
    `${DISCORD_API}/guilds/${guildId}/members/${userId}/roles/${roleId}`,
    { method: "DELETE", headers: headers() }
  );
  if (!res.ok) {
    const text = await res.text();
    throw new DiscordApiError(res.status, text || "Erro ao remover cargo");
  }
}

export function memberAvatarUrl(userId: string, avatar: string | null) {
  if (!avatar) {
    const index = Number(BigInt(userId) >> BigInt(22)) % 6;
    return `https://cdn.discordapp.com/embed/avatars/${index}.png`;
  }
  return `https://cdn.discordapp.com/avatars/${userId}/${avatar}.png?size=64`;
}

export function roleColorHex(color: number) {
  if (!color) return "#94a3b8";
  return `#${color.toString(16).padStart(6, "0")}`;
}
