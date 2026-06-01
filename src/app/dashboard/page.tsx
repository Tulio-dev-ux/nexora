"use client";

import {
  Activity,
  Bot,
  MessageSquare,
  RefreshCw,
  Server,
  Ticket,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useDashboardData } from "@/hooks/use-live-metrics";
import { pt } from "@/lib/i18n/pt-br";

function timeAgo(date: string) {
  const sec = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (sec < 60) return `${sec}s`;
  if (sec < 3600) return `${Math.floor(sec / 60)} min`;
  if (sec < 86400) return `${Math.floor(sec / 3600)}h`;
  return `${Math.floor(sec / 86400)}d`;
}

export default function DashboardHome() {
  const { data, loading, error, refetch } = useDashboardData();

  const stats = (data?.stats ?? {}) as {
    servers?: number;
    members?: number;
    openTickets?: number;
    moderationActions?: number;
    plan?: string;
    botOnline?: boolean;
  };

  const servers = (data?.servers ?? []) as {
    id: string;
    name: string;
    memberCount: number;
    discordId: string;
  }[];

  const recentLogs = (data?.recentLogs ?? []) as {
    id: string;
    action: string;
    reason: string | null;
    createdAt: string;
  }[];

  const chartData =
    servers.length > 0
      ? servers.map((s, i) => ({
          day: s.name.slice(0, 8) || `S${i + 1}`,
          members: s.memberCount,
        }))
      : [{ day: "—", members: 0 }];

  const widgets = [
    {
      label: "Servidores",
      value: String(stats.servers ?? 0),
      change: stats.servers ? "Live" : "—",
      icon: Server,
      color: "text-cyan-400",
    },
    {
      label: "Membros",
      value: (stats.members ?? 0).toLocaleString("pt-BR"),
      change: stats.members ? "Total" : "—",
      icon: Users,
      color: "text-violet-400",
    },
    {
      label: "Plano",
      value: stats.plan ?? "STARTER",
      change: "Ativo",
      icon: MessageSquare,
      color: "text-emerald-400",
    },
    {
      label: "Tickets",
      value: String(stats.openTickets ?? 0),
      change: "Abertos",
      icon: Ticket,
      color: "text-amber-400",
    },
    {
      label: "Moderação",
      value: String(stats.moderationActions ?? 0),
      change: "Ações",
      icon: Activity,
      color: "text-green-400",
    },
    {
      label: "Bot",
      value: loading ? "—" : stats.botOnline ? "Online" : "Offline",
      change: stats.botOnline ? "Ativo" : "Inativo",
      icon: Bot,
      color: stats.botOnline ? "text-emerald-400" : "text-amber-400",
    },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">{pt.dashboard.dashboard}</h1>
          <p className="text-slate-400 mt-1">
            {loading ? "Carregando dados do servidor..." : pt.dashboard.dashboardDesc}
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={refetch} disabled={loading}>
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Atualizar
        </Button>
      </div>

      {error && (
        <Card className="mb-6 border-red-500/30 bg-red-500/5">
          <CardContent className="p-4 text-sm text-red-300">{error}</CardContent>
        </Card>
      )}

      {!loading && stats.servers === 0 && (
        <Card className="mb-6 border-amber-500/30 bg-amber-500/5">
          <CardContent className="p-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-amber-200">{pt.auth.discordLinkHint}</p>
            <Button variant="premium" size="sm" asChild>
              <Link href="/dashboard/bot">{pt.dashboard.bot}</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        {widgets.map((w) => (
          <Card key={w.label} className="hover:neon-glow transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <w.icon className={`w-5 h-5 ${w.color}`} />
                <Badge variant="outline">{w.change}</Badge>
              </div>
              <p className="text-2xl font-bold">{w.value}</p>
              <p className="text-xs text-slate-500 mt-1">{w.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-cyan-400" />
              Membros por Servidor
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="msgGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="#475569" fontSize={12} />
                <YAxis stroke="#475569" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: "rgba(15,23,42,0.9)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "12px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="members"
                  stroke="#06b6d4"
                  fill="url(#msgGrad)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Eventos Recentes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <p className="text-sm text-slate-500">Carregando...</p>
            ) : recentLogs.length === 0 ? (
              <p className="text-sm text-slate-500">
                Nenhum evento ainda. Adicione o bot e use moderação no Discord.
              </p>
            ) : (
              recentLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5"
                >
                  <span className="text-sm text-slate-300">
                    {log.action}: {log.reason ?? "—"}
                  </span>
                  <span className="text-xs text-slate-500 shrink-0 ml-4">
                    {timeAgo(log.createdAt)}
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Seus Servidores</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading ? (
            <p className="text-sm text-slate-500">Carregando...</p>
          ) : servers.length === 0 ? (
            <p className="text-sm text-slate-500">
              Nenhum servidor vinculado. Vá em <Link href="/dashboard/bot" className="text-cyan-400 hover:underline">Adicionar Bot</Link> e sincronize.
            </p>
          ) : (
            servers.map((s) => (
              <div key={s.id} className="flex justify-between p-3 rounded-xl bg-white/5">
                <span className="text-sm">{s.name}</span>
                <span className="text-xs text-slate-500">{s.memberCount} membros</span>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
