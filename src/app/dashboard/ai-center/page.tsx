"use client";

import { useCallback, useEffect, useState } from "react";
import { Bot, Brain, Shield, BarChart3, Zap, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { DashboardHeader } from "@/components/dashboard/sidebar";
import { ServerSelector } from "@/components/dashboard/server-selector";
import { useServers } from "@/hooks/use-servers";
import { pt } from "@/lib/i18n/pt-br";

const ICONS: Record<string, typeof Bot> = {
  "IA Moderadora": Shield,
  "IA Assistente": Bot,
  "IA Analytics": BarChart3,
  "IA Geral": Brain,
};

interface AIData {
  configured: boolean;
  stats: { totalTokens: number; totalCost: number; totalCalls: number };
  modules: { name: string; status: string; usage: number; tokens: number; cost: number; calls: number }[];
  suggestions: string[];
}

export default function AICenterPage() {
  const { servers, selectedServer, setSelectedServer, loading: serversLoading, reload } = useServers();
  const [data, setData] = useState<AIData | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!selectedServer) return;
    setLoading(true);
    const res = await fetch(`/api/discord/ai?serverId=${selectedServer}`);
    if (res.ok) setData(await res.json());
    else setData(null);
    setLoading(false);
  }, [selectedServer]);

  useEffect(() => { load(); }, [load]);

  const totalUsage = data?.modules.reduce((a, m) => a + m.usage, 0) ?? 0;
  const avgUsage = data?.modules.length ? Math.round(totalUsage / data.modules.length) : 0;

  return (
    <div>
      <DashboardHeader title={pt.dashboard.aiCenter} description={pt.dashboard.aiCenterDesc} />
      <ServerSelector servers={servers} value={selectedServer} onChange={setSelectedServer} onRefresh={() => { reload(); load(); }} loading={loading || serversLoading} />

      {loading && !data ? (
        <p className="text-slate-400 text-sm">Carregando centro de IA...</p>
      ) : (
        <>
          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            <Card className="neon-glow">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-cyan-400" />
                  <span className="text-sm text-slate-400">Consumo Médio</span>
                </div>
                <p className="text-2xl font-bold">{avgUsage}%</p>
                <Progress value={avgUsage} className="mt-2" />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="w-4 h-4 text-violet-400" />
                  <span className="text-sm text-slate-400">Chamadas IA</span>
                </div>
                <p className="text-2xl font-bold text-emerald-400">{data?.stats.totalCalls ?? 0}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4 text-amber-400" />
                  <span className="text-sm text-slate-400">Custo Estimado</span>
                </div>
                <p className="text-2xl font-bold">R$ {(data?.stats.totalCost ?? 0).toFixed(2)}</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-4 mb-8">
            {(data?.modules ?? []).map((mod) => {
              const Icon = ICONS[mod.name] ?? Brain;
              return (
                <Card key={mod.name} className="hover:neon-glow transition-all duration-300">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5 text-cyan-400" />
                        <CardTitle className="text-base">{mod.name}</CardTitle>
                      </div>
                      <Badge variant={mod.status === "active" ? "success" : "outline"}>{mod.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs text-slate-400 mb-1">
                        <span>Consumo</span>
                        <span>{mod.usage}%</span>
                      </div>
                      <Progress value={mod.usage} />
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Tokens</span>
                      <span>{mod.tokens.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Chamadas</span>
                      <span>{mod.calls}</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card>
            <CardHeader><CardTitle>Sugestões</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {(data?.suggestions ?? []).map((s, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-cyan-500/5 border border-cyan-500/10">
                  <Zap className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span className="text-sm text-slate-300">{s}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
