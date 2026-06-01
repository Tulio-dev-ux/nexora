"use client";

import { useEffect, useState } from "react";
import { Check, CreditCard, Download, Receipt } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DashboardHeader } from "@/components/dashboard/sidebar";
import { pt } from "@/lib/i18n/pt-br";

const PLAN_META = {
  STARTER: { name: "Starter", price: "R$ 49/mês", features: ["1 servidor", "5K eventos", "Suporte email"] },
  PRO: { name: "Pro", price: "R$ 149/mês", features: ["5 servidores", "50K eventos", "IA completa", "Suporte prioritário"] },
  ENTERPRISE: { name: "Enterprise", price: "Custom", features: ["Ilimitado", "IA personalizada", "SLA garantido", "Account manager"] },
};

export default function BillingPage() {
  const [subscription, setSubscription] = useState<{ plan: string; status: string; currentPeriodEnd?: string } | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [coupon, setCoupon] = useState("");

  useEffect(() => {
    fetch("/api/billing")
      .then((r) => r.json())
      .then((d) => setSubscription(d.subscription));
  }, []);

  async function handleCheckout(plan: string) {
    setLoading(plan);
    const res = await fetch("/api/billing/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan, coupon: coupon || undefined }),
    });
    const data = await res.json();
    setLoading(null);
    if (data.url) window.location.href = data.url;
    else alert(data.error ?? "Checkout unavailable — configure Stripe keys");
  }

  async function handlePortal() {
    setLoading("portal");
    const res = await fetch("/api/billing/portal", { method: "POST" });
    const data = await res.json();
    setLoading(null);
    if (data.url) window.location.href = data.url;
    else alert(data.error ?? "Portal unavailable");
  }

  const currentPlan = subscription?.plan ?? "STARTER";

  return (
    <div>
      <DashboardHeader title={pt.dashboard.billing} description={pt.dashboard.billingDesc} />

      <Card className="mb-8 neon-glow">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <Badge variant="secondary" className="mb-2">Plano Atual</Badge>
              <h3 className="text-2xl font-bold">{PLAN_META[currentPlan as keyof typeof PLAN_META]?.name ?? currentPlan} Plan</h3>
              <p className="text-slate-400 mt-1">
                Status: {subscription?.status ?? "active"}
                {subscription?.currentPeriodEnd && ` — Renova em ${new Date(subscription.currentPeriodEnd).toLocaleDateString()}`}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <input
                placeholder="Cupom"
                value={coupon}
                onChange={(e) => setCoupon(e.target.value)}
                className="px-3 py-2 rounded-xl glass text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
              />
              <Button variant="outline" onClick={handlePortal} disabled={loading === "portal"}>
                Gerenciar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {(Object.keys(PLAN_META) as Array<keyof typeof PLAN_META>).map((planKey) => {
          const plan = PLAN_META[planKey];
          const isCurrent = currentPlan === planKey;
          return (
            <Card key={planKey} className={isCurrent ? "border-cyan-500/30 neon-glow" : ""}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{plan.name}</CardTitle>
                  {isCurrent && <Badge>Atual</Badge>}
                </div>
                <p className="text-2xl font-bold mt-2">{plan.price}</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-4">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-slate-400">
                      <Check className="w-4 h-4 text-cyan-400" /> {f}
                    </li>
                  ))}
                </ul>
                {!isCurrent && planKey !== "ENTERPRISE" && (
                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={() => handleCheckout(planKey)}
                    disabled={!!loading}
                  >
                    {loading === planKey ? "Redirecionando..." : planKey === "STARTER" ? "Downgrade" : "Upgrade"}
                  </Button>
                )}
                {planKey === "ENTERPRISE" && !isCurrent && (
                  <Button variant="outline" className="w-full" asChild>
                    <a href="/demo">Falar com vendas</a>
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="w-5 h-5" />
            Faturas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500">
            Faturas disponíveis no portal Stripe após configurar pagamentos.
          </p>
          <Button variant="outline" className="mt-4" onClick={handlePortal}>
            <CreditCard className="w-4 h-4 mr-2" />
            Ver faturas no portal
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
