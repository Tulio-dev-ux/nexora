import { prisma } from "@/lib/prisma";

export async function findUserByDiscordId(discordId: string) {
  const byField = await prisma.user.findFirst({ where: { discordId } });
  if (byField) return byField;

  const account = await prisma.account.findFirst({
    where: { provider: "discord", providerAccountId: discordId },
    include: { user: true },
  });

  if (!account?.user) return null;

  if (!account.user.discordId) {
    return prisma.user.update({
      where: { id: account.user.id },
      data: { discordId },
    });
  }

  return account.user;
}

export async function ensureUserDiscordId(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { accounts: { where: { provider: "discord" } } },
  });
  if (!user) return null;

  const discordAccount = user.accounts[0];
  if (!discordAccount) return user;

  if (!user.discordId) {
    return prisma.user.update({
      where: { id: userId },
      data: { discordId: discordAccount.providerAccountId },
    });
  }

  return user;
}

interface DiscordGuild {
  id: string;
  name: string;
  icon: string | null;
  owner: boolean;
  permissions: string;
}

export async function syncUserGuildsFromDiscord(userId: string) {
  const user = await ensureUserDiscordId(userId);
  if (!user) return { linked: 0, error: "Usuário não encontrado" };

  const account = await prisma.account.findFirst({
    where: { userId, provider: "discord" },
  });

  if (!account?.access_token) {
    return {
      linked: 0,
      error: "Conecte sua conta Discord para sincronizar servidores (login com Discord ou botão abaixo).",
    };
  }

  let accessToken = account.access_token;

  const fetchGuilds = async (token: string) => {
    const res = await fetch("https://discord.com/api/v10/users/@me/guilds", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res;
  };

  let guildsRes = await fetchGuilds(accessToken);

  if (guildsRes.status === 401 && account.refresh_token) {
    const refreshed = await refreshDiscordToken(account.refresh_token);
    if (refreshed?.access_token) {
      accessToken = refreshed.access_token;
      await prisma.account.update({
        where: { id: account.id },
        data: {
          access_token: refreshed.access_token,
          refresh_token: refreshed.refresh_token ?? account.refresh_token,
          expires_at: refreshed.expires_in
            ? Math.floor(Date.now() / 1000) + refreshed.expires_in
            : account.expires_at,
        },
      });
      guildsRes = await fetchGuilds(accessToken);
    }
  }

  if (!guildsRes.ok) {
    return {
      linked: 0,
      error: "Token Discord expirado — saia e entre novamente com Discord.",
    };
  }

  const guilds = (await guildsRes.json()) as DiscordGuild[];
  const botToken = process.env.DISCORD_BOT_TOKEN;
  let linked = 0;

  for (const guild of guilds) {
    const isOwner = guild.owner;
    const isAdmin = (BigInt(guild.permissions) & BigInt(0x8)) === BigInt(0x8);
    if (!isOwner && !isAdmin) continue;

    if (botToken) {
      const botInGuild = await fetch(`https://discord.com/api/v10/guilds/${guild.id}?with_counts=true`, {
        headers: { Authorization: `Bot ${botToken}` },
      });
      if (!botInGuild.ok) continue;
      const guildData = (await botInGuild.json()) as { approximate_member_count?: number };

      await prisma.server.upsert({
        where: { discordId: guild.id },
        create: {
          discordId: guild.id,
          name: guild.name,
          icon: guild.icon
            ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`
            : null,
          memberCount: guildData.approximate_member_count ?? 0,
          ownerId: user.id,
        },
        update: {
          name: guild.name,
          icon: guild.icon
            ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`
            : null,
          memberCount: guildData.approximate_member_count ?? 0,
          ownerId: user.id,
        },
      });
      linked++;
      continue;
    }

    await prisma.server.upsert({
      where: { discordId: guild.id },
      create: {
        discordId: guild.id,
        name: guild.name,
        icon: guild.icon
          ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`
          : null,
        memberCount: 0,
        ownerId: user.id,
      },
      update: {
        name: guild.name,
        icon: guild.icon
          ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`
          : null,
        ownerId: user.id,
      },
    });
    linked++;
  }

  return { linked, error: linked === 0 ? "Nenhum servidor com bot encontrado. Adicione o bot e clique sincronizar." : null };
}

async function refreshDiscordToken(refreshToken: string) {
  const clientId = process.env.DISCORD_CLIENT_ID;
  const clientSecret = process.env.DISCORD_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;

  const res = await fetch("https://discord.com/api/v10/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });

  if (!res.ok) return null;
  return res.json() as Promise<{
    access_token: string;
    refresh_token?: string;
    expires_in?: number;
  }>;
}
