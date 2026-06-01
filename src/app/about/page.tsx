import { PageShell } from "@/components/marketing/page-shell";

export default function AboutPage() {
  return (
    <PageShell>
      <div className="mx-auto max-w-3xl px-6 py-12 prose-docs">
        <h1>About NEXORA AI</h1>
        <p>
          NEXORA AI é uma plataforma enterprise de automação com inteligência artificial para
          comunidades Discord e além. Construída com Next.js, Neon PostgreSQL, Upstash Redis e Groq.
        </p>
        <h2>Missão</h2>
        <p>
          Democratizar moderação inteligente, automações e analytics para equipes de qualquer tamanho —
          com segurança, billing transparente e experiência premium.
        </p>
        <h2>Stack</h2>
        <ul>
          <li>Next.js 16 + React 19</li>
          <li>Prisma + Neon (PostgreSQL)</li>
          <li>Upstash Redis + Socket.io</li>
          <li>NextAuth v5 · Stripe · discord.js</li>
          <li>Groq (API OpenAI-compatible)</li>
        </ul>
      </div>
    </PageShell>
  );
}
