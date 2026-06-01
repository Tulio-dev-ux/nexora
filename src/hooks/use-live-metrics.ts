"use client";

import { useEffect, useState, useCallback } from "react";
import { io, type Socket } from "socket.io-client";

export interface LiveMetrics {
  onlineUsers: number;
  requestsPerMin: number;
  eventsProcessed: number;
  timestamp: string;
}

export interface LiveEvent {
  type: string;
  message: string;
  severity: "info" | "warning" | "success" | "danger";
  timestamp: string;
}

let socket: Socket | null = null;

function getSocket() {
  if (!socket) {
    socket = io({
      path: "/api/socket",
      transports: ["websocket", "polling"],
      autoConnect: false,
    });
  }
  return socket;
}

export function useLiveMetrics() {
  const [metrics, setMetrics] = useState<LiveMetrics>({
    onlineUsers: 2847,
    requestsPerMin: 12453,
    eventsProcessed: 892,
    timestamp: new Date().toISOString(),
  });
  const [events, setEvents] = useState<LiveEvent[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const s = getSocket();
    s.connect();

    s.on("connect", () => setConnected(true));
    s.on("disconnect", () => setConnected(false));

    s.on("metrics:update", (data: LiveMetrics) => {
      setMetrics(data);
    });

    s.on("event:new", (event: LiveEvent) => {
      setEvents((prev) => [event, ...prev].slice(0, 10));
    });

    return () => {
      s.off("connect");
      s.off("disconnect");
      s.off("metrics:update");
      s.off("event:new");
    };
  }, []);

  const subscribe = useCallback((room: string) => {
    getSocket().emit("subscribe", room);
  }, []);

  return { metrics, events, connected, subscribe };
}

export function useDashboardData() {
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/dashboard", { cache: "no-store" });
      const json = await res.json();
      if (res.status === 401) {
        setData(null);
        setError("Sessão expirada. Faça login novamente.");
        window.location.href = "/login?callbackUrl=/dashboard";
        return;
      }
      if (!res.ok) {
        setError(json.error ?? "Erro ao carregar painel");
        setData(null);
        return;
      }
      setData(json);
    } catch {
      setError("Falha de conexão com o servidor");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60_000);
    return () => clearInterval(interval);
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}
