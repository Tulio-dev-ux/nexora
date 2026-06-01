"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Search, Shield, RefreshCw, ChevronDown, Plus, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DashboardHeader } from "@/components/dashboard/sidebar";
import { pt } from "@/lib/i18n/pt-br";

interface ServerOption {
  id: string;
  discordId: string;
  name: string;
}

interface MemberRole {
  id: string;
  name: string;
  color: string;
}

interface Member {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  joinedAt: string;
  roles: MemberRole[];
}

interface MembersData {
  server: { id: string; discordId: string; name: string };
  stats: { totalMembers: number; onlineNow: number; newThisWeek: number };
  roles: MemberRole[];
  members: Member[];
}

export default function MembersPage() {
  const [servers, setServers] = useState<ServerOption[]>([]);
  const [selectedServer, setSelectedServer] = useState<string>("");
  const [data, setData] = useState<MembersData | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [roleMenu, setRoleMenu] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/discord/servers")
      .then((r) => r.json())
      .then((d) => {
        const list = d.servers ?? [];
        setServers(list);
        if (list.length) setSelectedServer(list[0].discordId);
        else setLoading(false);
      });
  }, []);

  const loadMembers = useCallback(async (serverId: string) => {
    if (!serverId) return;
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/discord/members?serverId=${serverId}`);
    const json = await res.json();
    if (!res.ok) {
      setError(json.error ?? "Erro ao carregar membros");
      setData(null);
    } else {
      setData(json);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (selectedServer) loadMembers(selectedServer);
  }, [selectedServer, loadMembers]);

  const filtered = useMemo(() => {
    if (!data?.members) return [];
    const q = search.toLowerCase();
    if (!q) return data.members;
    return data.members.filter(
      (m) =>
        m.displayName.toLowerCase().includes(q) ||
        m.username.toLowerCase().includes(q) ||
        m.id.includes(q)
    );
  }, [data?.members, search]);

  async function updateRole(memberId: string, roleId: string, action: "add" | "remove") {
    setUpdating(`${memberId}-${roleId}`);
    const res = await fetch("/api/discord/members", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ serverId: selectedServer, memberId, roleId, action }),
    });
    if (res.ok) {
      await loadMembers(selectedServer);
    } else {
      const json = await res.json();
      setError(json.error ?? "Erro ao atualizar cargo");
    }
    setUpdating(null);
    setRoleMenu(null);
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  return (
    <div>
      <DashboardHeader title={pt.dashboard.members} description={pt.dashboard.membersDesc} />

      {servers.length === 0 ? (
        <Card className="neon-glow">
          <CardContent className="p-8 text-center">
            <p className="text-slate-400">Nenhum servidor vinculado.</p>
            <p className="text-sm text-slate-500 mt-2">
              Vá em <strong>Adicionar Bot</strong>, adicione o bot e clique em Atualizar lista.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <select
              value={selectedServer}
              onChange={(e) => setSelectedServer(e.target.value)}
              className="px-4 py-2.5 rounded-xl glass text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/30 min-w-[200px]"
            >
              {servers.map((s) => (
                <option key={s.discordId} value={s.discordId} className="bg-[#0f172a]">
                  {s.name}
                </option>
              ))}
            </select>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => loadMembers(selectedServer)}
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              Atualizar
            </Button>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-sm">
              {error}
            </div>
          )}

          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardContent className="p-4">
                <p className="text-2xl font-bold">
                  {loading ? "—" : (data?.stats.totalMembers ?? 0).toLocaleString("pt-BR")}
                </p>
                <p className="text-xs text-slate-500">Total de membros</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-2xl font-bold text-emerald-400">
                  {loading ? "—" : (data?.stats.onlineNow ?? 0).toLocaleString("pt-BR")}
                </p>
                <p className="text-xs text-slate-500">Online agora</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-2xl font-bold text-cyan-400">
                  {loading ? "—" : (data?.stats.newThisWeek ?? 0).toLocaleString("pt-BR")}
                </p>
                <p className="text-xs text-slate-500">Novos esta semana</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <CardTitle>
                  Membros {data?.server.name ? `— ${data.server.name}` : ""}
                </CardTitle>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    placeholder="Buscar membros..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 pr-4 py-2 rounded-xl glass text-sm w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-center text-slate-500 py-12">Carregando membros do Discord...</p>
              ) : filtered.length === 0 ? (
                <p className="text-center text-slate-500 py-12">Nenhum membro encontrado.</p>
              ) : (
                <div className="space-y-2">
                  {filtered.map((m) => (
                    <div
                      key={m.id}
                      className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <Image
                          src={m.avatar}
                          alt=""
                          width={40}
                          height={40}
                          className="rounded-full shrink-0"
                          unoptimized
                        />
                        <div className="min-w-0">
                          <p className="font-medium truncate">{m.displayName}</p>
                          <p className="text-xs text-slate-500">
                            @{m.username} · Entrou {formatDate(m.joinedAt)}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {m.roles.map((r) => (
                          <Badge
                            key={r.id}
                            variant="outline"
                            className="gap-1 cursor-pointer hover:bg-red-500/10"
                            style={{ borderColor: r.color, color: r.color }}
                            onClick={() => updateRole(m.id, r.id, "remove")}
                            title="Clique para remover cargo"
                          >
                            {r.name}
                            <X className="w-3 h-3 opacity-60" />
                          </Badge>
                        ))}

                        <div className="relative">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setRoleMenu(roleMenu === m.id ? null : m.id)}
                            disabled={!!updating}
                          >
                            <Plus className="w-3 h-3" />
                            Cargo
                            <ChevronDown className="w-3 h-3" />
                          </Button>
                          {roleMenu === m.id && data?.roles && (
                            <div className="absolute right-0 top-full mt-1 z-20 min-w-[180px] max-h-48 overflow-y-auto rounded-xl glass-strong border border-white/10 p-1 shadow-xl">
                              {data.roles
                                .filter((r) => !m.roles.some((mr) => mr.id === r.id))
                                .map((r) => (
                                  <button
                                    key={r.id}
                                    type="button"
                                    className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-white/10 flex items-center gap-2"
                                    onClick={() => updateRole(m.id, r.id, "add")}
                                    disabled={updating === `${m.id}-${r.id}`}
                                  >
                                    <Shield className="w-3 h-3" style={{ color: r.color }} />
                                    {r.name}
                                  </button>
                                ))}
                              {data.roles.filter((r) => !m.roles.some((mr) => mr.id === r.id)).length === 0 && (
                                <p className="px-3 py-2 text-xs text-slate-500">Todos os cargos atribuídos</p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {data && !loading && (
                <p className="text-xs text-slate-500 mt-4 text-center">
                  {filtered.length} de {data.members.length} membros · Dados ao vivo via Discord API
                </p>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
