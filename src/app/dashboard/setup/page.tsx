"use client";

import { useEffect, useState } from "react";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardHeader } from "@/components/dashboard/sidebar";
import { pt } from "@/lib/i18n/pt-br";

interface SetupStatus {
  percent: number;
  modules: {
    database: boolean;
    auth: boolean;
    redis: boolean;
    oauth: { discord: boolean; google: boolean; github: boolean };
    discordBot: boolean;
    stripe: boolean;
    ai: { groq: boolean };
  };
}

function StatusRow({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
      {ok ? (
        <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
      ) : (
        <XCircle className="w-4 h-4 text-slate-500 shrink-0" />
      )}
      <span className={ok ? "text-slate-200" : "text-slate-500"}>{label}</span>
    </div>
  );
}

export default function SetupPage() {
  const [status, setStatus] = useState<SetupStatus | null>(null);
  const [linkedServers, setLinkedServers] = useState(0);

  useEffect(() => {
    fetch("/api/setup/status").then((r) => r.json()).then(setStatus);
    fetch("/api/discord/servers")
      .then((r) => r.json())
      .then((d) => setLinkedServers(d.servers?.length ?? 0))
      .catch(() => setLinkedServers(0));
  }, []);

  return (
    <div>
      <DashboardHeader title={pt.dashboard.setup} description={pt.dashboard.setupDesc} />

      <Card className="mb-6 neon-glow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Completude</p>
              <p className="text-4xl font-bold holographic-text">
                {status?.percent ?? "—"}%
              </p>
            </div>
            {status && status.percent < 100 && (
              <div className="flex items-center gap-2 text-amber-400 text-sm">
                <AlertCircle className="w-4 h-4" />
                Configure o .env
              </div>
            )}
          </div>
          <div className="mt-4 h-2 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-violet-500 transition-all"
              style={{ width: `${status?.percent ?? 0}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {status && (
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle>Core</CardTitle></CardHeader>
            <CardContent>
              <StatusRow ok={status.modules.database} label="Neon PostgreSQL" />
              <StatusRow ok={status.modules.auth} label="Auth Secret" />
              <StatusRow ok={status.modules.redis} label="Upstash Redis" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>OAuth Login</CardTitle></CardHeader>
            <CardContent>
              <StatusRow ok={status.modules.oauth.discord} label="Discord" />
              <StatusRow ok={status.modules.oauth.google} label="Google" />
              <StatusRow ok={status.modules.oauth.github} label="GitHub" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Integrações</CardTitle></CardHeader>
            <CardContent>
              <StatusRow ok={status.modules.discordBot} label="Discord Bot" />
              <StatusRow ok={linkedServers > 0} label={`Servidores vinculados (${linkedServers})`} />
              <StatusRow ok={status.modules.stripe} label="Stripe Billing" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>IA</CardTitle></CardHeader>
            <CardContent>
              <StatusRow ok={status.modules.ai.groq} label="Groq (moderação, assistente, analytics)" />
            </CardContent>
          </Card>
        </div>
      )}

      <p className="text-sm text-slate-500 mt-6">
        Rode no terminal: <code className="text-cyan-400">npm run db:check</code>
      </p>
    </div>
  );
}
