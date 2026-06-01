"use client";

import { motion } from "framer-motion";
import {
  BarChart3,
  Bot,
  Shield,
  ShieldCheck,
  Workflow,
  Zap,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { pt } from "@/lib/i18n/pt-br";

const features = [
  {
    icon: Shield,
    title: "IA MODERATION",
    color: "from-red-500/20 to-orange-500/20",
    iconColor: "text-red-400",
    items: [
      "Bloqueio automático",
      "Anti raid",
      "Anti spam",
      "Anti links maliciosos",
      "Análise comportamental",
    ],
  },
  {
    icon: Bot,
    title: "IA ASSISTANT",
    color: "from-cyan-500/20 to-blue-500/20",
    iconColor: "text-cyan-400",
    items: [
      "Respostas automáticas",
      "FAQ inteligente",
      "Atendimento automático",
      "Suporte contextual",
    ],
  },
  {
    icon: BarChart3,
    title: "ANALYTICS",
    color: "from-violet-500/20 to-purple-500/20",
    iconColor: "text-violet-400",
    items: [
      "Gráficos avançados",
      "Crescimento da comunidade",
      "Retenção",
      "Atividade por canal",
    ],
  },
  {
    icon: ShieldCheck,
    title: "SECURITY",
    color: "from-emerald-500/20 to-green-500/20",
    iconColor: "text-emerald-400",
    items: [
      "Proteção em tempo real",
      "Análise de risco",
      "Logs completos",
    ],
  },
  {
    icon: Workflow,
    title: "AUTOMATION",
    color: "from-amber-500/20 to-yellow-500/20",
    iconColor: "text-amber-400",
    items: [
      "Workflows",
      "Gatilhos",
      "Ações automáticas",
    ],
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-32 relative">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-cyan-400 text-sm font-medium uppercase tracking-wider">
            {pt.landing.featuresLabel}
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold mt-4 mb-6">
            {pt.landing.featuresTitle}{" "}
            <span className="holographic-text">{pt.landing.featuresTitleHighlight}</span>
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto">{pt.landing.featuresSubtitle}</p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <Card className="h-full group hover:neon-glow transition-all duration-500 hover:-translate-y-1">
                <CardHeader>
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <feature.icon className={`w-6 h-6 ${feature.iconColor}`} />
                  </div>
                  <CardTitle className="text-lg tracking-wide">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {feature.items.map((item) => (
                      <li
                        key={item}
                        className="flex items-center gap-2 text-sm text-slate-400"
                      >
                        <Zap className="w-3 h-3 text-cyan-500 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
