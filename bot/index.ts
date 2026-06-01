import "dotenv/config";
import {
  Client,
  GatewayIntentBits,
  Events,
  Partials,
  REST,
  Routes,
  type Message,
  type GuildMember,
} from "discord.js";
import { BOT_COMMANDS, handleSlashCommand } from "./commands";

const API_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
const BOT_SECRET = process.env.DISCORD_BOT_SECRET ?? "";
const TOKEN = process.env.DISCORD_BOT_TOKEN;
const CLIENT_ID = process.env.DISCORD_CLIENT_ID ?? "";

if (!TOKEN) {
  console.error("DISCORD_BOT_TOKEN é obrigatório");
  process.exit(1);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildModeration,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.GuildMember],
});

async function callAPI(action: string, data: Record<string, unknown>) {
  try {
    const res = await fetch(`${API_URL}/api/discord/events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${BOT_SECRET}`,
      },
      body: JSON.stringify({ action, ...data }),
    });
    if (!res.ok) {
      const err = await res.text();
      console.error(`API ${action} falhou (${res.status}):`, err);
      return null;
    }
    return res.json() as Promise<Record<string, unknown>>;
  } catch (err) {
    console.error(`Chamada API falhou (${action}):`, err);
    return null;
  }
}

async function registerSlashCommands() {
  if (!CLIENT_ID || !TOKEN) return;
  const rest = new REST({ version: "10" }).setToken(TOKEN);
  try {
    await rest.put(Routes.applicationCommands(CLIENT_ID), { body: BOT_COMMANDS });
    console.log("Comandos slash /nexora registrados globalmente");
  } catch (err) {
    console.error("Erro ao registrar comandos:", err);
  }
}

async function linkGuild(guildId: string, name: string, icon: string | null, memberCount: number) {
  try {
    const guild = await client.guilds.fetch(guildId);
    const owner = await guild.fetchOwner();
    await callAPI("guild_register", {
      serverId: guildId,
      name,
      icon,
      memberCount,
      ownerDiscordId: owner.id,
    });
  } catch (err) {
    console.error("Erro ao vincular guild:", err);
  }
}

client.once(Events.ClientReady, async (c) => {
  console.log(`NEXORA Bot online como ${c.user.tag}`);
  console.log(`Servindo ${c.guilds.cache.size} servidores`);
  await registerSlashCommands();
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName !== "nexora") return;
  try {
    await handleSlashCommand(interaction, callAPI);
  } catch (err) {
    console.error("Erro no comando:", err);
    const msg = { content: "Erro ao executar comando.", ephemeral: true };
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(msg);
    } else {
      await interaction.reply(msg);
    }
  }
});

client.on(Events.MessageCreate, async (message: Message) => {
  if (message.author.bot || !message.guild) return;

  await callAPI("message", {
    serverId: message.guild.id,
    userId: message.author.id,
    content: message.content,
    messageId: message.id,
    channelId: message.channel.id,
  });

  if (message.content.length < 5) return;

  const result = await callAPI("moderate", {
    serverId: message.guild.id,
    userId: message.author.id,
    content: message.content,
    messageId: message.id,
    channelId: message.channel.id,
  });

  if (result?.result && typeof result.result === "object") {
    const r = result.result as { action: string; reason: string };
    if (r.action === "ban") {
      try {
        await message.delete();
        await message.member?.ban({ reason: r.reason });
      } catch (err) {
        console.error("Ban falhou:", err);
      }
    } else if (r.action === "mute") {
      try {
        await message.delete();
      } catch (err) {
        console.error("Mute falhou:", err);
      }
    } else if (r.action === "warn") {
      try {
        await message.reply({
          content: `⚠️ ${r.reason}`,
          allowedMentions: { repliedUser: true },
        });
      } catch {
        // canal pode não permitir respostas
      }
    }
  }
});

client.on(Events.GuildMemberAdd, async (member: GuildMember) => {
  const result = await callAPI("member_join", {
    serverId: member.guild.id,
    userId: member.id,
  });

  if (Array.isArray(result?.automations) && result.automations.length > 0) {
    const welcomeChannel = member.guild.systemChannel;
    if (welcomeChannel) {
      await welcomeChannel.send(`Bem-vindo(a) a **${member.guild.name}**, ${member}! 👋`);
    }
  }
});

client.on(Events.GuildCreate, async (guild) => {
  console.log(`Entrou no servidor: ${guild.name} (${guild.id})`);
  await linkGuild(guild.id, guild.name, guild.iconURL({ size: 128 }), guild.memberCount);
});

client.login(TOKEN);
