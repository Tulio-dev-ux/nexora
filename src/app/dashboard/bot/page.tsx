"use client";

import { useCallback, useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import {
  Bot,
  ExternalLink,
  RefreshCw,
  Server,
  Terminal,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { pt } from "@/lib/i18n/pt-br";

interface LinkedServer {
  id: string;
  discordId: string;
  name: string;
  icon: string | null;
  memberCount: number;
  _count: { automations: number; moderationLogs: number };
}

const COMMANDS = [
  { cmd: "/nexora status", desc: "Estatísticas do servidor no painel" },
  { cmd: "/nexora moderar", desc: "Analisa texto com IA de moderação" },
  { cmd: "/nexora ticket", desc: "Abre ticket vinculado ao painel" },
  { cmd: "/nexora expulsar", desc: "Expulsa um membro (moderação)" },
  { cmd: "/nexora banir", desc: "Bane um membro (moderação)" },
  { cmd: "/nexora limpar", desc: "Apaga 1–100 mensagens do canal" },
  { cmd: "/nexora anunciar", desc: "Envia anúncio em um canal" },
  { cmd: "/nexora membros", desc: "Contagem de membros online/total" },
  { cmd: "/nexora servidor", desc: "Informações do servidor Discord" },
  { cmd: "/nexora avatar", desc: "Mostra avatar de um usuário" },
  { cmd: "/nexora cargos", desc: "Lista cargos do servidor" },
  { cmd: "/nexora ping", desc: "Latência bot ↔ API" },
  { cmd: "/nexora ajuda", desc: "Lista todos os comandos" },
];

export default function BotPage() {
  const t = pt.bot;
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [servers, setServers] = useState<LinkedServer[]>([]);
  const [botOnline, setBotOnline] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [needsDiscord, setNeedsDiscord] = useState(false);

  useEffect(() => {
    fetch("/api/user/profile")
      .then((r) => r.json())
      .then((d) => setNeedsDiscord(!d.user?.hasDiscord));
  }, []);

  const load = useCallback(async (runSync = false) => {
    setLoading(true);
    if (runSync) {
      await fetch("/api/discord/sync", { method: "POST" });
    }
    const [inviteRes, serversRes, statusRes] = await Promise.all([
      fetch("/api/discord/invite"),
      fetch("/api/discord/servers"),
      fetch("/api/discord/bot-status"),
    ]);
    if (inviteRes.ok) {
      const d = await inviteRes.json();
      setInviteUrl(d.url);
    }
    if (serversRes.ok) {
      const d = await serversRes.json();
      setServers(d.servers ?? []);
    }
    if (statusRes.ok) {
      const d = await statusRes.json();
      setBotOnline(d.botOnline);
    }
    setLoading(false);
  }, []);

  async function handleSync() {
    setLoading(true);
    setSyncMessage(null);
    const res = await fetch("/api/discord/sync", { method: "POST" });
    const data = await res.json();
    if (data.servers) setServers(data.servers);
    if (data.error) {
      setSyncMessage(data.error);
      if (data.error.includes("Discord")) setNeedsDiscord(true);
    } else if (data.linked > 0) setSyncMessage(`${data.linked} servidor(es) vinculado(s)!`);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div>
      <DashboardHeader title={t.title} description={t.description} />

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <Card className="lg:col-span-2 neon-glow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-cyan-400" />
              {t.addBot}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-slate-400">{t.addBotHint}</p>
            <div className="flex flex-wrap gap-3">
              <Button variant="premium" asChild disabled={!inviteUrl}>
                <a href={inviteUrl ?? "#"} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4" />
                  Adicionar ao Discord
                </a>
              </Button>
              <Button variant="secondary" onClick={handleSync} disabled={loading}>
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                {t.sync}
              </Button>
            </div>
            {syncMessage && (
              <p className={`text-sm ${syncMessage.includes("!") ? "text-emerald-400" : "text-amber-400"}`}>
                {syncMessage}
              </p>
            )}
            {needsDiscord && (
              <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-4 space-y-3">
                <p className="text-sm text-slate-300">{pt.auth.discordLinkHint}</p>
                <Button
                  variant="secondary"
                  onClick={() => signIn("discord", { callbackUrl: "/dashboard/bot" })}
                >
                  {pt.auth.connectDiscord}
                </Button>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm">
              {botOnline === null ? null : botOnline ? (
                <>
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">{t.botOnline}</span>
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 text-amber-400" />
                  <span className="text-amber-400">{t.botOffline}</span>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t.stepsTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3 text-sm text-slate-400 list-decimal list-inside">
              <li>{t.step1}</li>
              <li>{t.step2}</li>
              <li>{t.step3}</li>
            </ol>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="w-5 h-5 text-violet-400" />
            {t.linkedServers}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {servers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-400">{t.noServers}</p>
              <p className="text-sm text-slate-500 mt-2">{t.noServersHint}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {servers.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between p-4 rounded-xl glass border border-white/5"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-violet-500/20 flex items-center justify-center">
                      <Server className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                      <p className="font-medium">{s.name}</p>
                      <p className="text-xs text-slate-500">
                        {s.memberCount} {t.members} · {s._count.automations} {t.automations} ·{" "}
                        {s._count.moderationLogs} {t.modLogs}
                      </p>
                    </div>
                  </div>
                  <Badge variant="success">{t.linked}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-emerald-400" />
            {t.commandsTitle}
          </CardTitle>
          <p className="text-sm text-slate-400">{t.commandsHint}</p>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-3">
            {COMMANDS.map((c) => (
              <div
                key={c.cmd}
                className="p-4 rounded-xl bg-white/[0.03] border border-white/5"
              >
                <code className="text-cyan-400 text-sm">{c.cmd}</code>
                <p className="text-sm text-slate-400 mt-1">{c.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
