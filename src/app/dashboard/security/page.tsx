"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, Eye, Lock, Shield, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DashboardHeader } from "@/components/dashboard/sidebar";
import { ServerSelector } from "@/components/dashboard/server-selector";
import { useServers } from "@/hooks/use-servers";
import { pt } from "@/lib/i18n/pt-br";

function timeAgo(date: string) {
  const sec = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (sec < 60) return `${sec}s`;
  if (sec < 3600) return `${Math.floor(sec / 60)} min`;
  if (sec < 86400) return `${Math.floor(sec / 3600)}h`;
  return `${Math.floor(sec / 86400)}d`;
}

interface SecurityData {
  stats: { threatScore: string; blockedToday: number; activeSessions: number; riskEvents: number };
  logs: { event: string; detail: string; time: string; level: string }[];
}

export default function SecurityPage() {
  const { servers, selectedServer, setSelectedServer, loading: serversLoading, reload } = useServers();
  const [data, setData] = useState<SecurityData | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const url = selectedServer
      ? `/api/discord/security?serverId=${selectedServer}`
      : "/api/discord/security";
    const res = await fetch(url);
    if (res.ok) setData(await res.json());
    else setData(null);
    setLoading(false);
  }, [selectedServer]);

  useEffect(() => { load(); }, [load]);

  const s = data?.stats;

  return (
    <div>
      <DashboardHeader title={pt.dashboard.security} description={pt.dashboard.securityDesc} />
      <ServerSelector servers={servers} value={selectedServer} onChange={setSelectedServer} onRefresh={() => { reload(); load(); }} loading={loading || serversLoading} />

      {loading && !data ? (
        <p className="text-slate-400 text-sm">Carregando segurança...</p>
      ) : (
        <>
          <div className="grid sm:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Nível de Ameaça", value: s?.threatScore ?? "—", icon: Shield, color: "text-emerald-400" },
              { label: "Bloqueados Hoje", value: s?.blockedToday ?? 0, icon: Lock, color: "text-red-400" },
              { label: "Sessões Ativas", value: s?.activeSessions ?? 0, icon: Eye, color: "text-cyan-400" },
              { label: "Eventos de Risco", value: s?.riskEvents ?? 0, icon: AlertTriangle, color: "text-amber-400" },
            ].map((item) => (
              <Card key={item.label}>
                <CardContent className="p-4 flex items-center gap-3">
                  <item.icon className={`w-8 h-8 ${item.color}`} />
                  <div>
                    <p className="text-2xl font-bold">{item.value}</p>
                    <p className="text-xs text-slate-500">{item.label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-cyan-400" />
                Logs de Segurança
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {(data?.logs ?? []).length === 0 ? (
                <p className="text-sm text-slate-500">Nenhum evento registrado.</p>
              ) : (
                data!.logs.map((log, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                    <div>
                      <p className="text-sm font-medium">{log.event}</p>
                      <p className="text-xs text-slate-500">{log.detail}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={log.level === "critical" ? "danger" : log.level === "warning" ? "warning" : "default"}>
                        {log.level}
                      </Badge>
                      <span className="text-xs text-slate-500">{timeAgo(log.time)}</span>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
