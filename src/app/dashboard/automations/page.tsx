"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowDown, GitBranch, MessageSquare, UserPlus, FileText, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DashboardHeader } from "@/components/dashboard/sidebar";
import { ServerSelector } from "@/components/dashboard/server-selector";
import { useServers } from "@/hooks/use-servers";
import { pt } from "@/lib/i18n/pt-br";

interface Automation {
  id: string;
  name: string;
  enabled: boolean;
  runCount: number;
  trigger: { type?: string };
  updatedAt: string;
}

const DEFAULT_STEPS = [
  { icon: UserPlus, label: "Evento: Usuário entra", color: "bg-cyan-500/20 text-cyan-400" },
  { icon: GitBranch, label: "Condição: Primeira vez?", color: "bg-violet-500/20 text-violet-400" },
  { icon: MessageSquare, label: "Enviar mensagem de boas-vindas", color: "bg-emerald-500/20 text-emerald-400" },
  { icon: Shield, label: "Aplicar cargo: Membro", color: "bg-amber-500/20 text-amber-400" },
  { icon: FileText, label: "Registrar log", color: "bg-slate-500/20 text-slate-400" },
];

function timeAgo(date: string) {
  const sec = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (sec < 3600) return `${Math.floor(sec / 60)} min`;
  if (sec < 86400) return `${Math.floor(sec / 3600)}h`;
  return `${Math.floor(sec / 86400)}d`;
}

export default function AutomationsPage() {
  const { servers, selectedServer, setSelectedServer, loading: serversLoading, reload } = useServers();
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  const server = servers.find((s) => s.discordId === selectedServer);

  const load = useCallback(async () => {
    if (!selectedServer) return;
    setLoading(true);
    const res = await fetch(`/api/automations?serverId=${selectedServer}`);
    if (res.ok) {
      const d = await res.json();
      setAutomations(d.automations ?? []);
    } else setAutomations([]);
    setLoading(false);
  }, [selectedServer]);

  useEffect(() => { load(); }, [load]);

  async function createWelcomeFlow() {
    if (!server) return;
    setCreating(true);
    await fetch("/api/automations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        serverId: server.id,
        name: "Welcome Flow",
        trigger: { type: "member_join" },
        actions: [{ type: "send_message", template: "Bem-vindo(a)!" }],
      }),
    });
    await load();
    setCreating(false);
  }

  async function toggleAutomation(id: string, enabled: boolean) {
    await fetch("/api/automations", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, enabled: !enabled }),
    });
    await load();
  }

  return (
    <div>
      <DashboardHeader title={pt.dashboard.automations} description={pt.dashboard.automationsDesc} />
      <ServerSelector servers={servers} value={selectedServer} onChange={setSelectedServer} onRefresh={() => { reload(); load(); }} loading={loading || serversLoading} />

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <Card className="neon-glow">
          <CardHeader><CardTitle>Modelo Welcome Flow</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-col items-center py-8">
              {DEFAULT_STEPS.map((step, i) => (
                <div key={i} className="flex flex-col items-center">
                  <div className={`flex items-center gap-3 px-6 py-3 rounded-xl ${step.color} border border-white/10 w-72`}>
                    <step.icon className="w-5 h-5" />
                    <span className="text-sm font-medium">{step.label}</span>
                  </div>
                  {i < DEFAULT_STEPS.length - 1 && <ArrowDown className="w-5 h-5 text-slate-600 my-2" />}
                </div>
              ))}
            </div>
            <div className="flex gap-3 justify-center mt-4">
              <Button variant="premium" onClick={createWelcomeFlow} disabled={!server || creating}>
                {creating ? "Criando..." : "Criar Welcome Flow"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Workflows do Servidor</CardTitle>
            <Badge variant="outline">{automations.length} total</Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <p className="text-sm text-slate-500">Carregando...</p>
            ) : automations.length === 0 ? (
              <p className="text-sm text-slate-500">Nenhuma automação. Crie um Welcome Flow acima.</p>
            ) : (
              automations.map((w) => (
                <button
                  key={w.id}
                  type="button"
                  onClick={() => toggleAutomation(w.id, w.enabled)}
                  className="w-full flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:border-cyan-500/20 transition-colors text-left"
                >
                  <div>
                    <p className="font-medium">{w.name}</p>
                    <p className="text-xs text-slate-500">{w.runCount.toLocaleString()} execuções · {(w.trigger as { type?: string })?.type ?? "custom"}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant={w.enabled ? "success" : "warning"}>{w.enabled ? "active" : "paused"}</Badge>
                    <p className="text-xs text-slate-500 mt-1">{timeAgo(w.updatedAt)} atrás</p>
                  </div>
                </button>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
