"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, Ban, MessageSquareOff, Shield, VolumeX } from "lucide-react";
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

interface ModData {
  stats: { warnings: number; mutes: number; bans: number; autoActions: number };
  recent: { id: string; userId: string | null; action: string; reason: string | null; time: string }[];
  rules: { id: string; name: string; status: string; triggers: number; trigger: unknown }[];
}

export default function ModerationPage() {
  const { servers, selectedServer, setSelectedServer, loading: serversLoading, reload } = useServers();
  const [data, setData] = useState<ModData | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!selectedServer) return;
    setLoading(true);
    const res = await fetch(`/api/discord/moderation?serverId=${selectedServer}`);
    if (res.ok) setData(await res.json());
    else setData(null);
    setLoading(false);
  }, [selectedServer]);

  useEffect(() => { load(); }, [load]);

  const s = data?.stats;

  return (
    <div>
      <DashboardHeader title={pt.dashboard.moderation} description={pt.dashboard.moderationDesc} />
      <ServerSelector servers={servers} value={selectedServer} onChange={setSelectedServer} onRefresh={() => { reload(); load(); }} loading={loading || serversLoading} />

      {loading && !data ? (
        <p className="text-slate-400 text-sm">Carregando moderação...</p>
      ) : (
        <>
          <div className="grid sm:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Warnings", value: s?.warnings ?? 0, icon: AlertTriangle, color: "text-amber-400" },
              { label: "Mutes", value: s?.mutes ?? 0, icon: VolumeX, color: "text-orange-400" },
              { label: "Bans", value: s?.bans ?? 0, icon: Ban, color: "text-red-400" },
              { label: "Auto Actions", value: s?.autoActions ?? 0, icon: Shield, color: "text-cyan-400" },
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

          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle>Ações Recentes</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {(data?.recent ?? []).length === 0 ? (
                  <p className="text-sm text-slate-500">Nenhuma ação registrada ainda.</p>
                ) : (
                  data!.recent.map((a) => (
                    <div key={a.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                      <div>
                        <p className="text-sm font-medium">{a.userId ? `@${a.userId.slice(-8)}` : "Sistema"}</p>
                        <p className="text-xs text-slate-500">{a.reason ?? "—"}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant={a.action.includes("ban") ? "danger" : a.action.includes("mute") ? "warning" : "default"}>
                          {a.action}
                        </Badge>
                        <p className="text-xs text-slate-500 mt-1">{timeAgo(a.time)}</p>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Automações de Moderação</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {(data?.rules ?? []).length === 0 ? (
                  <p className="text-sm text-slate-500">Crie automações em Automações ou use `/nexora moderar` no Discord.</p>
                ) : (
                  data!.rules.map((r) => (
                    <div key={r.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                      <div className="flex items-center gap-3">
                        <MessageSquareOff className="w-4 h-4 text-cyan-400" />
                        <span className="text-sm">{r.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-500">{r.triggers} execuções</span>
                        <Badge variant={r.status === "active" ? "success" : "warning"}>{r.status}</Badge>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
