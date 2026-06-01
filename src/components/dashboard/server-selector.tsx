"use client";

import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface ServerOption {
  id: string;
  discordId: string;
  name: string;
  memberCount?: number;
}

export function ServerSelector({
  servers,
  value,
  onChange,
  onRefresh,
  loading,
}: {
  servers: ServerOption[];
  value: string;
  onChange: (discordId: string) => void;
  onRefresh?: () => void;
  loading?: boolean;
}) {
  if (!servers.length) {
    return (
      <p className="text-sm text-amber-400 mb-6">
        Nenhum servidor vinculado — vá em <strong>Adicionar Bot</strong> e sincronize.
      </p>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3 mb-6">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="px-4 py-2.5 rounded-xl glass text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/30 min-w-[220px]"
      >
        {servers.map((s) => (
          <option key={s.discordId} value={s.discordId} className="bg-[#0f172a]">
            {s.name}
            {s.memberCount != null ? ` (${s.memberCount} membros)` : ""}
          </option>
        ))}
      </select>
      {onRefresh && (
        <Button variant="secondary" size="sm" onClick={onRefresh} disabled={loading}>
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Atualizar
        </Button>
      )}
    </div>
  );
}
