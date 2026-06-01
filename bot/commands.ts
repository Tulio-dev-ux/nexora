import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  type ChatInputCommandInteraction,
  type RESTPostAPIChatInputApplicationCommandsJSONBody,
  type GuildMember,
  type TextChannel,
} from "discord.js";

export const BOT_COMMANDS: RESTPostAPIChatInputApplicationCommandsJSONBody[] = [
  new SlashCommandBuilder()
    .setName("nexora")
    .setDescription("Comandos NEXORA AI — integrados ao painel web")
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addSubcommand((s) =>
      s.setName("status").setDescription("Estatísticas do servidor no painel")
    )
    .addSubcommand((s) =>
      s
        .setName("moderar")
        .setDescription("Analisa texto com IA de moderação")
        .addStringOption((o) =>
          o.setName("texto").setDescription("Mensagem para analisar").setRequired(true)
        )
    )
    .addSubcommand((s) =>
      s
        .setName("ticket")
        .setDescription("Abre ticket de suporte no painel")
        .addStringOption((o) =>
          o.setName("assunto").setDescription("Assunto do ticket").setRequired(true)
        )
    )
    .addSubcommand((s) =>
      s
        .setName("expulsar")
        .setDescription("Expulsa um membro do servidor")
        .addUserOption((o) =>
          o.setName("usuario").setDescription("Membro").setRequired(true)
        )
        .addStringOption((o) => o.setName("motivo").setDescription("Motivo"))
    )
    .addSubcommand((s) =>
      s
        .setName("banir")
        .setDescription("Bane um membro do servidor")
        .addUserOption((o) =>
          o.setName("usuario").setDescription("Membro").setRequired(true)
        )
        .addStringOption((o) => o.setName("motivo").setDescription("Motivo"))
    )
    .addSubcommand((s) =>
      s
        .setName("limpar")
        .setDescription("Apaga mensagens do canal (1–100)")
        .addIntegerOption((o) =>
          o
            .setName("quantidade")
            .setDescription("Quantidade (1–100)")
            .setMinValue(1)
            .setMaxValue(100)
            .setRequired(true)
        )
    )
    .addSubcommand((s) =>
      s
        .setName("anunciar")
        .setDescription("Envia anúncio em um canal")
        .addChannelOption((o) =>
          o.setName("canal").setDescription("Canal de texto").setRequired(true)
        )
        .addStringOption((o) =>
          o.setName("mensagem").setDescription("Conteúdo do anúncio").setRequired(true)
        )
    )
    .addSubcommand((s) => s.setName("membros").setDescription("Contagem de membros"))
    .addSubcommand((s) => s.setName("servidor").setDescription("Informações do servidor"))
    .addSubcommand((s) =>
      s
        .setName("avatar")
        .setDescription("Mostra avatar de um usuário")
        .addUserOption((o) => o.setName("usuario").setDescription("Usuário"))
    )
    .addSubcommand((s) => s.setName("cargos").setDescription("Lista cargos do servidor"))
    .addSubcommand((s) => s.setName("ajuda").setDescription("Lista todos os comandos"))
    .addSubcommand((s) => s.setName("ping").setDescription("Latência bot ↔ API"))
    .toJSON(),
];

function hasModPerms(member: GuildMember | null) {
  return member?.permissions.has(PermissionFlagsBits.ModerateMembers) ?? false;
}

export async function handleSlashCommand(
  interaction: ChatInputCommandInteraction,
  callAPI: (action: string, data: Record<string, unknown>) => Promise<Record<string, unknown> | null>
) {
  const sub = interaction.options.getSubcommand();
  const guild = interaction.guild;
  if (!guild) {
    await interaction.reply({ content: "Use este comando em um servidor.", ephemeral: true });
    return;
  }

  const base = {
    serverId: guild.id,
    userId: interaction.user.id,
    channelId: interaction.channelId,
  };

  const panelUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  if (sub === "ping") {
    const start = Date.now();
    const result = await callAPI("ping", base);
    const apiMs = (result?.latencyMs as number) ?? Date.now() - start;
    await interaction.reply({
      content: `**Pong!**\n• Discord: ${Date.now() - start}ms\n• API NEXORA: ${apiMs}ms`,
      ephemeral: true,
    });
    return;
  }

  if (sub === "ajuda") {
    await interaction.reply({
      content: [
        "**Comandos NEXORA AI**",
        "`/nexora status` — estatísticas do painel",
        "`/nexora moderar <texto>` — análise IA",
        "`/nexora ticket <assunto>` — abre ticket",
        "`/nexora expulsar` / `banir` / `limpar` — moderação",
        "`/nexora anunciar` — anúncio em canal",
        "`/nexora membros` / `servidor` / `avatar` / `cargos`",
        "`/nexora ping` / `ajuda`",
        "",
        `Painel: ${panelUrl}/dashboard`,
      ].join("\n"),
      ephemeral: true,
    });
    return;
  }

  if (sub === "membros") {
    await guild.members.fetch();
    const online = guild.members.cache.filter((m) => m.presence?.status === "online").size;
    await interaction.reply({
      content: `**${guild.name}**\nTotal: **${guild.memberCount}**\nOnline (aprox.): **${online}**`,
      ephemeral: true,
    });
    return;
  }

  if (sub === "servidor") {
    const owner = await guild.fetchOwner();
    await interaction.reply({
      content: [
        `**${guild.name}**`,
        `ID: \`${guild.id}\``,
        `Dono: ${owner.user.tag}`,
        `Membros: **${guild.memberCount}**`,
        `Criado: <t:${Math.floor(guild.createdTimestamp / 1000)}:R>`,
      ].join("\n"),
      ephemeral: true,
    });
    return;
  }

  if (sub === "avatar") {
    const user = interaction.options.getUser("usuario") ?? interaction.user;
    await interaction.reply({
      content: `Avatar de **${user.tag}**: ${user.displayAvatarURL({ size: 512 })}`,
      ephemeral: true,
    });
    return;
  }

  if (sub === "cargos") {
    const roles = guild.roles.cache
      .filter((r) => r.id !== guild.id)
      .sort((a, b) => b.position - a.position)
      .map((r) => r.name)
      .slice(0, 25);
    await interaction.reply({
      content: roles.length ? roles.join(", ") : "Nenhum cargo.",
      ephemeral: true,
    });
    return;
  }

  const needsMod = ["expulsar", "banir", "limpar", "anunciar"].includes(sub);
  if (needsMod && !hasModPerms(interaction.member as GuildMember)) {
    await interaction.reply({ content: "Sem permissão de moderação.", ephemeral: true });
    return;
  }

  if (sub === "limpar" || sub === "expulsar" || sub === "banir" || sub === "anunciar") {
    await interaction.deferReply({ ephemeral: true });
  } else {
    await interaction.deferReply({ ephemeral: sub === "moderar" });
  }

  if (sub === "status") {
    const result = await callAPI("command_status", base);
    if (!result?.ok) {
      await interaction.editReply({
        content:
          "Servidor não vinculado. O dono deve entrar no painel em **Adicionar Bot** com a conta Discord correta.",
      });
      return;
    }
    const s = result.stats as {
      name: string;
      members: number;
      modLogs: number;
      automations: number;
      plan: string;
    };
    await interaction.editReply({
      content: [
        `**${s.name}**`,
        `Membros: **${s.members}**`,
        `Logs de moderação: **${s.modLogs}**`,
        `Automações ativas: **${s.automations}**`,
        `Plano: **${s.plan}**`,
      ].join("\n"),
    });
    return;
  }

  if (sub === "moderar") {
    const texto = interaction.options.getString("texto", true);
    const result = await callAPI("command_moderate", { ...base, content: texto });
    if (!result?.result) {
      await interaction.editReply({ content: "Servidor não vinculado ou IA indisponível." });
      return;
    }
    const r = result.result as { action: string; confidence: number; reason: string };
    await interaction.editReply({
      content: `**Ação:** ${r.action}\n**Confiança:** ${Math.round(r.confidence * 100)}%\n**Motivo:** ${r.reason}`,
    });
    return;
  }

  if (sub === "ticket") {
    const assunto = interaction.options.getString("assunto", true);
    const result = await callAPI("command_ticket", {
      ...base,
      subject: assunto,
      description: `Ticket aberto por ${interaction.user.tag} via Discord`,
    });
    if (!result?.ticket) {
      await interaction.editReply({ content: "Não foi possível criar o ticket." });
      return;
    }
    const t = result.ticket as { id: string; subject: string };
    await interaction.editReply({
      content: `**Ticket criado!** #${t.id.slice(-6)} — ${t.subject}\n${panelUrl}/dashboard/tickets`,
    });
    return;
  }

  if (sub === "expulsar") {
    const target = interaction.options.getMember("usuario") as GuildMember | null;
    const motivo = interaction.options.getString("motivo") ?? "Expulso via /nexora";
    if (!target) {
      await interaction.editReply({ content: "Membro não encontrado." });
      return;
    }
    await target.kick(motivo);
    await callAPI("log_moderation", {
      ...base,
      targetUserId: target.id,
      modAction: "kick",
      modReason: motivo,
    });
    await interaction.editReply({ content: `${target.user.tag} expulso.` });
    return;
  }

  if (sub === "banir") {
    const target = interaction.options.getUser("usuario", true);
    const motivo = interaction.options.getString("motivo") ?? "Banido via /nexora";
    await guild.members.ban(target.id, { reason: motivo });
    await callAPI("log_moderation", {
      ...base,
      targetUserId: target.id,
      modAction: "ban",
      modReason: motivo,
    });
    await interaction.editReply({ content: `${target.tag} banido.` });
    return;
  }

  if (sub === "limpar") {
    const qty = interaction.options.getInteger("quantidade", true);
    const channel = interaction.channel as TextChannel;
    const deleted = await channel.bulkDelete(qty, true);
    await interaction.editReply({ content: `${deleted.size} mensagem(ns) removida(s).` });
    return;
  }

  if (sub === "anunciar") {
    const channel = interaction.options.getChannel("canal", true) as TextChannel;
    const mensagem = interaction.options.getString("mensagem", true);
    await channel.send({ content: mensagem });
    await interaction.editReply({ content: `Anúncio enviado em ${channel}.` });
  }
}
