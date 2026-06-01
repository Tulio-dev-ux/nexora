import Link from "next/link";
import { Book, Code, FileText, Video } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DocsShell } from "@/components/docs/docs-shell";

const sections = [
  {
    title: "Getting Started",
    href: "/docs/guides",
    icon: Book,
    items: ["Quick Start", "Environment Setup", "Discord Bot"],
  },
  {
    title: "API Reference",
    href: "/docs/api",
    icon: Code,
    items: ["Authentication", "Endpoints", "Webhooks", "Rate Limits"],
  },
  {
    title: "SDK",
    href: "/docs/sdk",
    icon: FileText,
    items: ["JavaScript SDK", "Python SDK", "REST Client"],
  },
  {
    title: "Tutorials",
    href: "/docs/tutorials",
    icon: Video,
    items: ["AI Moderation", "Automations", "Billing & Stripe"],
  },
];

export default function DocsPage() {
  return (
    <DocsShell
      title="Documentation"
      description="Everything you need to build, deploy, and scale with NEXORA AI."
    >
      <div className="grid md:grid-cols-2 gap-6 not-prose">
        {sections.map((s) => (
          <Link key={s.title} href={s.href}>
            <Card className="h-full hover:neon-glow transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <s.icon className="w-5 h-5 text-cyan-400" />
                  {s.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {s.items.map((item) => (
                    <li key={item} className="text-sm text-slate-400">
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <section className="mt-12">
        <h2 id="stack">Tech stack</h2>
        <p>
          NEXORA AI runs on Next.js 16, PostgreSQL (Neon), optional Redis (Upstash),
          NextAuth v5, Stripe, Socket.io, and Groq for AI. Run{" "}
          <code>npm run db:check</code> to validate your environment.
        </p>
      </section>
    </DocsShell>
  );
}
