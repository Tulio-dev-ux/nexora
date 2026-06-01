"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardHeader } from "@/components/dashboard/sidebar";
import { ServerSelector } from "@/components/dashboard/server-selector";
import { useServers } from "@/hooks/use-servers";
import { pt } from "@/lib/i18n/pt-br";

interface AnalyticsData {
  dailyActivity: { day: string; moderacao: number; mensagens: number }[];
  monthlyGrowth: { month: string; value: number }[];
  stats: {
    members: number;
    online: number;
    openTickets: number;
    resolvedTickets: number;
    modActions: number;
    automations: number;
    aiCommands: number;
  };
}

export default function AnalyticsPage() {
  const { servers, selectedServer, setSelectedServer, loading: serversLoading, reload } = useServers();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!selectedServer) return;
    setLoading(true);
    const res = await fetch(`/api/discord/analytics?serverId=${selectedServer}`);
    if (res.ok) setData(await res.json());
    else setData(null);
    setLoading(false);
  }, [selectedServer]);

  useEffect(() => {
    load();
  }, [load]);

  const stats = data?.stats;

  return (
    <div>
      <DashboardHeader title={pt.dashboard.analytics} description={pt.dashboard.analyticsDesc} />
      <ServerSelector
        servers={servers}
        value={selectedServer}
        onChange={setSelectedServer}
        onRefresh={() => { reload(); load(); }}
        loading={loading || serversLoading}
      />

      {loading && !data ? (
        <p className="text-slate-400 text-sm">Carregando analytics...</p>
      ) : !selectedServer ? null : (
        <>
          <div className="grid sm:grid-cols-4 gap-4 mb-6">
            <Card><CardContent className="p-4"><p className="text-2xl font-bold">{stats?.members ?? 0}</p><p className="text-xs text-slate-500">Membros</p></CardContent></Card>
            <Card><CardContent className="p-4"><p className="text-2xl font-bold text-cyan-400">{stats?.online ?? 0}</p><p className="text-xs text-slate-500">Online agora</p></CardContent></Card>
            <Card><CardContent className="p-4"><p className="text-2xl font-bold">{stats?.modActions ?? 0}</p><p className="text-xs text-slate-500">Ações moderação (30d)</p></CardContent></Card>
            <Card><CardContent className="p-4"><p className="text-2xl font-bold text-violet-400">{stats?.aiCommands ?? 0}</p><p className="text-xs text-slate-500">Chamadas IA</p></CardContent></Card>
          </div>

          <div className="grid lg:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader><CardTitle>Atividade Diária (30 dias)</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={data?.dailyActivity ?? []}>
                    <XAxis dataKey="day" stroke="#475569" fontSize={11} />
                    <YAxis stroke="#475569" fontSize={11} />
                    <Tooltip contentStyle={{ background: "rgba(15,23,42,0.9)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px" }} />
                    <Line type="monotone" dataKey="moderacao" name="Moderação" stroke="#06b6d4" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="mensagens" name="Est. mensagens" stroke="#8b5cf6" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Moderação por Mês</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={data?.monthlyGrowth?.length ? data.monthlyGrowth : [{ month: "—", value: 0 }]}>
                    <XAxis dataKey="month" stroke="#475569" fontSize={11} />
                    <YAxis stroke="#475569" fontSize={11} />
                    <Tooltip contentStyle={{ background: "rgba(15,23,42,0.9)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px" }} />
                    <Bar dataKey="value" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader><CardTitle>Automações</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between"><span className="text-slate-400">Ativas</span><span className="font-bold">{stats?.automations ?? 0}</span></div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Tickets</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between"><span className="text-slate-400">Abertos</span><span className="font-bold">{stats?.openTickets ?? 0}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Resolvidos</span><span className="font-bold text-emerald-400">{stats?.resolvedTickets ?? 0}</span></div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>IA</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between"><span className="text-slate-400">Comandos IA (30d)</span><span className="font-bold">{stats?.aiCommands ?? 0}</span></div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
