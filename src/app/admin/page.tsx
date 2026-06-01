"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function AdminOverview() {
  const [metrics, setMetrics] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    fetch("/api/admin/metrics")
      .then((r) => r.json())
      .then(setMetrics)
      .catch(console.error);
  }, []);

  const m = (metrics?.metrics ?? {}) as Record<string, number>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Admin Overview</h1>
      <p className="text-slate-400 mb-8">Métricas globais da plataforma NEXORA AI.</p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Users", value: m.totalUsers?.toLocaleString() ?? "—" },
          { label: "Active Servers", value: m.totalServers?.toLocaleString() ?? "—" },
          { label: "MRR", value: m.mrr ? `R$ ${m.mrr.toLocaleString()}` : "—" },
          { label: "Open Tickets", value: m.openTickets?.toString() ?? "—" },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4">
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-xs text-slate-500 mt-1">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold mb-4">Platform Stats</h3>
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div className="p-3 rounded-xl bg-white/5">
              <span className="text-slate-400">AI Cost Total</span>
              <p className="font-bold">R$ {(m.aiCost ?? 0).toFixed(2)}</p>
            </div>
            <div className="p-3 rounded-xl bg-white/5">
              <span className="text-slate-400">AI Tokens Used</span>
              <p className="font-bold">{(m.aiTokens ?? 0).toLocaleString()}</p>
            </div>
          </div>
          <Badge variant="success" className="mt-4">
            Live metrics via Socket.io
          </Badge>
        </CardContent>
      </Card>
    </div>
  );
}
