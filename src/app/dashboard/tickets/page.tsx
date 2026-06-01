"use client";

import { useCallback, useEffect, useState } from "react";
import { Clock, MessageSquare, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DashboardHeader } from "@/components/dashboard/sidebar";
import { pt } from "@/lib/i18n/pt-br";

interface Ticket {
  id: string;
  subject: string;
  department: string;
  priority: string;
  status: string;
  slaDeadline: string | null;
  createdAt: string;
}

function slaRemaining(deadline: string | null) {
  if (!deadline) return "—";
  const h = (new Date(deadline).getTime() - Date.now()) / 3600000;
  if (h < 0) return "atrasado";
  return `${h.toFixed(1)}h`;
}

const PRIORITY_PT: Record<string, string> = {
  CRITICAL: "critical",
  HIGH: "high",
  MEDIUM: "medium",
  LOW: "low",
};

const STATUS_PT: Record<string, string> = {
  OPEN: "open",
  IN_PROGRESS: "in_progress",
  RESOLVED: "resolved",
  CLOSED: "closed",
};

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [subject, setSubject] = useState("");
  const [department, setDepartment] = useState("Suporte");

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/tickets");
    if (res.ok) {
      const d = await res.json();
      setTickets(d.tickets ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const open = tickets.filter((t) => t.status === "OPEN").length;
  const inProgress = tickets.filter((t) => t.status === "IN_PROGRESS").length;
  const resolved = tickets.filter((t) => t.status === "RESOLVED" || t.status === "CLOSED").length;

  const deptStats = ["Suporte", "Técnico", "Vendas", "Financeiro", "Discord"].map((name) => {
    const deptTickets = tickets.filter((t) => t.department === name && (t.status === "OPEN" || t.status === "IN_PROGRESS"));
    return { name, open: deptTickets.length };
  }).filter((d) => d.open > 0 || tickets.some((t) => t.department === d.name));

  async function createTicket() {
    if (!subject.trim()) return;
    await fetch("/api/tickets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject, department, priority: "MEDIUM" }),
    });
    setSubject("");
    setShowForm(false);
    await load();
  }

  async function updateStatus(id: string, status: string) {
    await fetch("/api/tickets", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    await load();
  }

  return (
    <div>
      <DashboardHeader title={pt.dashboard.tickets} description={pt.dashboard.ticketsDesc} />

      <div className="grid sm:grid-cols-4 gap-4 mb-8">
        <Card><CardContent className="p-4"><p className="text-2xl font-bold">{open}</p><p className="text-xs text-slate-500">Abertos</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-2xl font-bold text-amber-400">{inProgress}</p><p className="text-xs text-slate-500">Em progresso</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-2xl font-bold text-emerald-400">{resolved}</p><p className="text-xs text-slate-500">Resolvidos</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-2xl font-bold">{tickets.length}</p><p className="text-xs text-slate-500">Total</p></CardContent></Card>
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardContent className="p-4 flex flex-wrap gap-3 items-end">
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Assunto do ticket"
              className="flex-1 min-w-[200px] px-4 py-2.5 rounded-xl glass text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
            />
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="px-4 py-2.5 rounded-xl glass text-sm bg-transparent"
            >
              <option value="Suporte" className="bg-[#0f172a]">Suporte</option>
              <option value="Técnico" className="bg-[#0f172a]">Técnico</option>
              <option value="Vendas" className="bg-[#0f172a]">Vendas</option>
              <option value="Financeiro" className="bg-[#0f172a]">Financeiro</option>
            </select>
            <Button variant="premium" onClick={createTicket}>Criar</Button>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
          </CardContent>
        </Card>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Tickets</CardTitle>
              <Button variant="premium" size="sm" onClick={() => setShowForm(true)}>
                <Plus className="w-4 h-4" /> Novo Ticket
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {loading ? (
                <p className="text-sm text-slate-500">Carregando...</p>
              ) : tickets.length === 0 ? (
                <p className="text-sm text-slate-500">Nenhum ticket. Use `/nexora ticket` no Discord ou crie aqui.</p>
              ) : (
                tickets.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => updateStatus(t.id, t.status === "OPEN" ? "IN_PROGRESS" : t.status === "IN_PROGRESS" ? "RESOLVED" : "OPEN")}
                    className="w-full flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:border-cyan-500/20 transition-colors text-left"
                  >
                    <div className="flex items-center gap-4">
                      <MessageSquare className="w-5 h-5 text-cyan-400" />
                      <div>
                        <p className="font-medium text-sm">#{t.id.slice(-6)} — {t.subject}</p>
                        <p className="text-xs text-slate-500">{t.department}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={PRIORITY_PT[t.priority] === "high" || PRIORITY_PT[t.priority] === "critical" ? "danger" : PRIORITY_PT[t.priority] === "medium" ? "warning" : "outline"}>
                        {PRIORITY_PT[t.priority] ?? t.priority}
                      </Badge>
                      <Badge variant={STATUS_PT[t.status] === "resolved" || STATUS_PT[t.status] === "closed" ? "success" : STATUS_PT[t.status] === "open" ? "default" : "secondary"}>
                        {STATUS_PT[t.status] ?? t.status}
                      </Badge>
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {slaRemaining(t.slaDeadline)}
                      </span>
                    </div>
                  </button>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader><CardTitle>Departamentos</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {deptStats.length === 0 ? (
              <p className="text-sm text-slate-500">Sem departamentos ativos.</p>
            ) : (
              deptStats.map((d) => (
                <div key={d.name} className="p-3 rounded-xl bg-white/5 border border-white/5">
                  <div className="flex justify-between mb-1">
                    <span className="font-medium text-sm">{d.name}</span>
                    <Badge variant="outline">{d.open} abertos</Badge>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
