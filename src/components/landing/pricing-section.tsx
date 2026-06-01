"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { pt } from "@/lib/i18n/pt-br";

const plans = [
  {
    name: "Starter",
    price: "R$ 49",
    period: pt.landing.perMonth,
    description: "Para comunidades pequenas começando com IA.",
    features: [
      "1 servidor",
      "IA Moderation básica",
      "5.000 eventos/mês",
      "Analytics básico",
      "Suporte por email",
    ],
    cta: "Começar grátis",
    popular: false,
  },
  {
    name: "Pro",
    price: "R$ 149",
    period: pt.landing.perMonth,
    description: "Para comunidades em crescimento.",
    features: [
      "5 servidores",
      "IA completa (Moderation + Assistant)",
      "50.000 eventos/mês",
      "Analytics avançado",
      "Automações ilimitadas",
      "Tickets com SLA",
      "Suporte prioritário",
    ],
    cta: "Assinar Pro",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "Para grandes organizações e empresas.",
    features: [
      "Servidores ilimitados",
      "IA personalizada",
      "Eventos ilimitados",
      "SSO & 2FA avançado",
      "API dedicada",
      "SLA garantido",
      "Account manager",
    ],
    cta: "Falar com vendas",
    popular: false,
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="py-32 relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(139,92,246,0.08)_0%,transparent_50%)]" />
      <div className="relative mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-violet-400 text-sm font-medium uppercase tracking-wider">
            {pt.landing.pricingLabel}
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold mt-4 mb-6">
            {pt.landing.pricingTitle}{" "}
            <span className="holographic-text">{pt.landing.pricingTitleHighlight}</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Card
                className={`h-full relative ${
                  plan.popular ? "neon-glow border-cyan-500/30" : ""
                }`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                    {pt.landing.popular}
                  </Badge>
                )}
                <CardHeader className="text-center pb-2">
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-slate-500">{plan.period}</span>
                  </div>
                  <p className="text-sm text-slate-400 mt-2">{plan.description}</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <ul className="space-y-3">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm text-slate-300">
                        <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Button
                    variant={plan.popular ? "premium" : "secondary"}
                    className="w-full"
                    asChild
                  >
                    <Link href="/register">{plan.cta}</Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
