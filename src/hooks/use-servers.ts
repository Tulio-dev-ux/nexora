"use client";

import { useCallback, useEffect, useState } from "react";
import type { ServerOption } from "@/components/dashboard/server-selector";

export function useServers() {
  const [servers, setServers] = useState<ServerOption[]>([]);
  const [selectedServer, setSelectedServer] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/discord/servers");
    const data = await res.json();
    const list = data.servers ?? [];
    setServers(list);
    setSelectedServer((prev) => {
      if (prev && list.some((s: ServerOption) => s.discordId === prev)) return prev;
      return list[0]?.discordId ?? "";
    });
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { servers, selectedServer, setSelectedServer, loading, reload: load };
}
