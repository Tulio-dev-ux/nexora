"use client";

import { useEffect, useState } from "react";
import { Bell, Key, Monitor, Shield, User } from "lucide-react";
import { useSession, signIn } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DashboardHeader } from "@/components/dashboard/sidebar";
import { pt } from "@/lib/i18n/pt-br";

interface DeviceSession {
  id: string;
  device: string | null;
  ip: string | null;
  createdAt: string;
}

export default function SettingsPage() {
  const { data: session, update } = useSession();
  const [name, setName] = useState("");
  const [saved, setSaved] = useState(false);
  const [sessions, setSessions] = useState<DeviceSession[]>([]);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [token, setToken] = useState("");
  const [hasDiscord, setHasDiscord] = useState(true);

  useEffect(() => {
    if (session?.user?.name) setName(session.user.name);
  }, [session?.user?.name]);

  useEffect(() => {
    fetch("/api/auth/sessions").then((r) => r.json()).then((d) => setSessions(d.sessions ?? []));
    fetch("/api/auth/2fa").then((r) => r.json()).then((d) => setTwoFactorEnabled(d.enabled));
    fetch("/api/user/profile").then((r) => r.json()).then((d) => setHasDiscord(Boolean(d.user?.hasDiscord)));
  }, []);

  async function saveProfile() {
    await fetch("/api/user/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    await update({ name });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function setup2FA() {
    const res = await fetch("/api/auth/2fa", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "setup" }),
    });
    const data = await res.json();
    if (data.qrCode) setQrCode(data.qrCode);
  }

  async function verify2FA() {
    const res = await fetch("/api/auth/2fa", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "verify", token }),
    });
    if (res.ok) {
      setTwoFactorEnabled(true);
      setQrCode(null);
      await update({ twoFactorEnabled: true });
    }
  }

  async function revokeSession(sessionId: string) {
    await fetch("/api/auth/sessions", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId }),
    });
    setSessions((s) => s.filter((x) => x.id !== sessionId));
  }

  return (
    <div>
      <DashboardHeader title={pt.dashboard.settings} description={pt.dashboard.settingsDesc} />

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><User className="w-5 h-5" /> Perfil</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm text-slate-400">Nome</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full mt-1 px-4 py-2 rounded-xl glass text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
              />
            </div>
            <div>
              <label className="text-sm text-slate-400">Email</label>
              <input defaultValue={session?.user?.email ?? ""} readOnly className="w-full mt-1 px-4 py-2 rounded-xl glass text-sm opacity-70" />
            </div>
            <Button variant="premium" onClick={saveProfile}>
              {saved ? "Salvo!" : "Salvar"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">Discord</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
              <div>
                <p className="text-sm font-medium">Conta Discord</p>
                <p className="text-xs text-slate-500">Necessário para vincular servidores</p>
              </div>
              <Badge variant={hasDiscord ? "success" : "warning"}>
                {hasDiscord ? pt.auth.discordLinked : "Não conectado"}
              </Badge>
            </div>
            {!hasDiscord && (
              <>
                <p className="text-sm text-slate-400">{pt.auth.discordLinkHint}</p>
                <Button variant="secondary" onClick={() => signIn("discord", { callbackUrl: "/dashboard/settings" })}>
                  {pt.auth.connectDiscord}
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Shield className="w-5 h-5" /> Segurança — 2FA</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
              <div>
                <p className="text-sm font-medium">Autenticação 2FA</p>
                <p className="text-xs text-slate-500">Proteja sua conta com TOTP</p>
              </div>
              <Badge variant={twoFactorEnabled ? "success" : "outline"}>
                {twoFactorEnabled ? "Ativo" : "Inativo"}
              </Badge>
            </div>
            {!twoFactorEnabled && !qrCode && (
              <Button variant="outline" onClick={setup2FA}>Configurar 2FA</Button>
            )}
            {qrCode && (
              <div className="space-y-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qrCode} alt="2FA QR Code" className="mx-auto w-48 h-48 rounded-xl" />
                <input
                  placeholder="Código de 6 dígitos"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl glass text-sm"
                />
                <Button variant="premium" onClick={verify2FA}>Verificar e ativar</Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Monitor className="w-5 h-5" /> Sessões Ativas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {sessions.length === 0 ? (
              <p className="text-sm text-slate-500">Nenhuma sessão registrada</p>
            ) : (
              sessions.map((s, i) => (
                <div key={s.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                  <div>
                    <p className="text-sm font-medium">{s.device ?? "Unknown device"}</p>
                    <p className="text-xs text-slate-500">{s.ip ?? "—"} · {new Date(s.createdAt).toLocaleDateString()}</p>
                  </div>
                  {i === 0 ? <Badge>Atual</Badge> : (
                    <Button variant="ghost" size="sm" className="text-red-400" onClick={() => revokeSession(s.id)}>
                      Revogar
                    </Button>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Key className="w-5 h-5" /> API Keys</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 rounded-xl bg-white/5 font-mono text-xs text-slate-400">
              nx_live_••••••••••••••••••••
            </div>
            <Button variant="outline" size="sm">Regenerar Key</Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Bell className="w-5 h-5" /> Notificações</CardTitle>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-2 gap-4">
            {["Alertas de segurança", "Relatórios semanais", "Atualizações de produto", "Tickets urgentes"].map((n) => (
              <label key={n} className="flex items-center justify-between p-3 rounded-xl bg-white/5 cursor-pointer">
                <span className="text-sm">{n}</span>
                <input type="checkbox" defaultChecked className="accent-cyan-500" />
              </label>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
