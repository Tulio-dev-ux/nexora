"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  Bot,
  MessageSquare,
  Users,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useLiveMetrics } from "@/hooks/use-live-metrics";

function LiveMetric({
  label,
  value,
  icon: Icon,
  trend,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  trend?: string;
}) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
      <div className="p-2 rounded-lg bg-cyan-500/10">
        <Icon className="w-4 h-4 text-cyan-400" />
      </div>
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-sm font-semibold text-white">{value}</p>
      </div>
      {trend && (
        <span className="ml-auto text-xs text-emerald-400">{trend}</span>
      )}
    </div>
  );
}

function MiniChart() {
  const [data, setData] = useState<number[]>(
    Array.from({ length: 20 }, () => Math.random() * 60 + 20)
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setData((prev) => [...prev.slice(1), Math.random() * 60 + 20]);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const max = Math.max(...data);

  return (
    <div className="flex items-end gap-0.5 h-16">
      {data.map((val, i) => (
        <motion.div
          key={i}
          className="flex-1 bg-gradient-to-t from-cyan-500/40 to-cyan-400/80 rounded-sm"
          animate={{ height: `${(val / max) * 100}%` }}
          transition={{ duration: 0.5 }}
        />
      ))}
    </div>
  );
}

const severityStyles = {
  success: "bg-emerald-500/10 border-emerald-500/20 text-emerald-300",
  warning: "bg-amber-500/10 border-amber-500/20 text-amber-300",
  info: "bg-cyan-500/10 border-cyan-500/20 text-cyan-300",
  danger: "bg-red-500/10 border-red-500/20 text-red-300",
};

export function DashboardMockup() {
  const { metrics, events, connected } = useLiveMetrics();

  return (
    <motion.div
      initial={{ opacity: 0, x: 40, rotateY: -5 }}
      animate={{ opacity: 1, x: 0, rotateY: 0 }}
      transition={{ duration: 1, delay: 0.3 }}
      className="relative perspective-1000"
    >
      <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500/20 to-violet-500/20 rounded-3xl blur-2xl" />
      <div className="relative glass-strong rounded-2xl p-1 shadow-premium neon-glow overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-amber-500/80" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
          </div>
          <span className="text-xs text-slate-500 ml-2">nexora.ai/dashboard</span>
          <Badge variant={connected ? "success" : "warning"} className="ml-auto">
            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${connected ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`} />
            {connected ? "Live" : "Demo"}
          </Badge>
        </div>

        <div className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <LiveMetric
              label="Online Users"
              value={metrics.onlineUsers.toLocaleString()}
              icon={Users}
              trend="+12%"
            />
            <LiveMetric
              label="Requests/min"
              value={metrics.requestsPerMin.toLocaleString()}
              icon={Zap}
              trend="+8%"
            />
          </div>

          <div className="p-3 rounded-xl bg-white/5 border border-white/5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-slate-400">AI Processing Events</span>
              <Bot className="w-4 h-4 text-violet-400 animate-pulse-glow" />
            </div>
            <MiniChart />
          </div>

          <div className="space-y-2">
            {(events.length > 0
              ? events.slice(0, 3)
              : [
                  { message: `AI moderated ${metrics.eventsProcessed} events`, severity: "success" as const },
                  { message: "Raid attempt blocked — Server #2847", severity: "warning" as const },
                  { message: "Auto-response sent — Ticket #8921", severity: "info" as const },
                ]
            ).map((event, i) => (
              <div
                key={i}
                className={`flex items-center gap-2 p-2 rounded-lg border ${severityStyles[event.severity as keyof typeof severityStyles] ?? severityStyles.info}`}
              >
                {event.severity === "warning" ? (
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                ) : event.severity === "success" ? (
                  <Activity className="w-3.5 h-3.5 shrink-0" />
                ) : (
                  <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                )}
                <span className="text-xs">{event.message}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
