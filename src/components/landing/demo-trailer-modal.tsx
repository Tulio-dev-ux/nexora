"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BarChart3,
  Bot,
  Pause,
  Play,
  RotateCcw,
  Shield,
  Sparkles,
  X,
  Zap,
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { pt } from "@/lib/i18n/pt-br";

const SCENE_MS = 3200;
const YOUTUBE_ID = process.env.NEXT_PUBLIC_DEMO_VIDEO_ID?.trim();

const SCENES = [
  {
    id: "intro",
    title: "NEXORA AI",
    subtitle: "O futuro da automação para comunidades Discord",
    icon: Sparkles,
    accent: "from-cyan-500 to-violet-600",
  },
  {
    id: "dashboard",
    title: "Painel em tempo real",
    subtitle: "Servidores, membros, tickets e métricas ao vivo",
    icon: BarChart3,
    accent: "from-cyan-500 to-blue-600",
    preview: (
      <div className="grid grid-cols-3 gap-2 mt-4">
        {["2.8K Membros", "47 Tickets", "99.9% Uptime"].map((s) => (
          <div key={s} className="rounded-lg bg-white/5 border border-white/10 p-2 text-center text-xs text-slate-300">
            {s}
          </div>
        ))}
      </div>
    ),
  },
  {
    id: "moderation",
    title: "Moderação com IA",
    subtitle: "Anti-spam, anti-raid e ações automáticas 24/7",
    icon: Shield,
    accent: "from-red-500 to-orange-600",
    preview: (
      <div className="mt-4 space-y-2">
        {["Spam bloqueado", "Raid detectado", "Link malicioso removido"].map((s) => (
          <div key={s} className="flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2 text-xs text-red-300">
            <Shield className="w-3 h-3" />
            {s}
          </div>
        ))}
      </div>
    ),
  },
  {
    id: "bot",
    title: "Bot Discord integrado",
    subtitle: "/nexora status · moderar · ticket · banir · limpar",
    icon: Bot,
    accent: "from-violet-500 to-purple-600",
    preview: (
      <div className="mt-4 font-mono text-xs space-y-1 text-cyan-400/90">
        <p>/nexora status → stats do servidor</p>
        <p>/nexora moderar → análise IA</p>
        <p>/nexora ticket → abre no painel</p>
      </div>
    ),
  },
  {
    id: "analytics",
    title: "Analytics & Automações",
    subtitle: "Gráficos reais, workflows e welcome flow",
    icon: Zap,
    accent: "from-emerald-500 to-cyan-600",
    preview: (
      <div className="mt-4 flex items-end gap-1 h-16">
        {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-t bg-gradient-to-t from-cyan-500/40 to-violet-500/60"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
    ),
  },
  {
    id: "cta",
    title: "Pronto para começar?",
    subtitle: "Grátis para começar · Setup em minutos",
    icon: Sparkles,
    accent: "from-cyan-500 via-violet-500 to-cyan-500",
  },
];

function YouTubeEmbed({ videoId }: { videoId: string }) {
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black">
      <iframe
        className="absolute inset-0 h-full w-full"
        src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
        title="NEXORA AI — Demonstração"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}

function TrailerPlayer({ onClose }: { onClose: () => void }) {
  const [scene, setScene] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [progress, setProgress] = useState(0);

  const advance = useCallback(() => {
    setScene((s) => (s + 1) % SCENES.length);
    setProgress(0);
  }, []);

  useEffect(() => {
    if (!playing) return;
    const tick = 50;
    const interval = setInterval(() => {
      setProgress((p) => {
        const next = p + (tick / SCENE_MS) * 100;
        if (next >= 100) {
          advance();
          return 0;
        }
        return next;
      });
    }, tick);
    return () => clearInterval(interval);
  }, [playing, scene, advance]);

  const current = SCENES[scene];
  const Icon = current.icon;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={onClose}
        className="absolute -top-2 -right-2 z-10 rounded-full bg-white/10 p-2 text-slate-400 hover:bg-white/20 hover:text-white transition-colors"
        aria-label="Fechar"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="relative aspect-video overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-[#0f172a] to-[#030712]">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.08)_1px,transparent_1px)] bg-[size:32px_32px]" />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.98 }}
            transition={{ duration: 0.45 }}
            className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center"
          >
            <div className={`mb-4 rounded-2xl bg-gradient-to-br ${current.accent} p-4 shadow-lg`}>
              <Icon className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2">{current.title}</h3>
            <p className="text-sm sm:text-base text-slate-400 max-w-md">{current.subtitle}</p>
            {current.preview && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="w-full max-w-sm"
              >
                {current.preview}
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          <div className="mb-3 h-1 overflow-hidden rounded-full bg-white/10">
            <motion.div
              className="h-full bg-gradient-to-r from-cyan-500 to-violet-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">
              {scene + 1} / {SCENES.length}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPlaying((p) => !p)}
                className="rounded-lg bg-white/10 p-2 text-slate-300 hover:bg-white/20 transition-colors"
                aria-label={playing ? "Pausar" : "Reproduzir"}
              >
                {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
              <button
                type="button"
                onClick={() => { setScene(0); setProgress(0); setPlaying(true); }}
                className="rounded-lg bg-white/10 p-2 text-slate-300 hover:bg-white/20 transition-colors"
                aria-label="Reiniciar"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function DemoTrailerModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-4 sm:p-6">
        <div className="mb-4">
          <p className="text-xs uppercase tracking-widest text-cyan-400 mb-1">{pt.landing.demoTrailerLabel}</p>
          <DialogTitle>{pt.landing.demoTrailerTitle}</DialogTitle>
          <DialogDescription className="sr-only">
            Tour em vídeo pela plataforma NEXORA AI
          </DialogDescription>
        </div>
        {YOUTUBE_ID ? (
          <YouTubeEmbed videoId={YOUTUBE_ID} />
        ) : (
          <TrailerPlayer onClose={() => onOpenChange(false)} />
        )}
        <div className="mt-4 flex justify-end gap-3">
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
          <Button variant="premium" size="sm" asChild>
            <a href="/register">{pt.landing.startFree}</a>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
