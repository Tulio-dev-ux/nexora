import Link from "next/link";
import { PageShell } from "@/components/marketing/page-shell";
import { Shield, Lock, Eye, Server } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const practices = [
  {
    icon: Lock,
    title: "Encryption",
    description: "TLS in transit for all connections. Database and Redis hosted with encryption at rest (Neon, Upstash).",
  },
  {
    icon: Shield,
    title: "Authentication",
    description: "NextAuth v5 with OAuth, bcrypt passwords, optional TOTP 2FA, and revocable device sessions.",
  },
  {
    icon: Eye,
    title: "Access control",
    description: "Role-based admin panel. API routes protected by session middleware. Bot events require secret header.",
  },
  {
    icon: Server,
    title: "Infrastructure",
    description: "Serverless PostgreSQL (Neon), managed Redis, Stripe PCI-compliant billing. No card data stored on our servers.",
  },
];

export default function SecurityPage() {
  return (
    <PageShell>
      <div className="mx-auto max-w-4xl px-6 py-12">
        <h1 className="text-4xl font-bold mb-2">Security</h1>
        <p className="text-slate-400 mb-12 max-w-2xl">
          How NEXORA AI protects your data, accounts, and communities.
        </p>

        <div className="grid md:grid-cols-2 gap-6 mb-16">
          {practices.map((p) => (
            <Card key={p.title}>
              <CardContent className="p-6">
                <p.icon className="w-8 h-8 text-cyan-400 mb-4" />
                <h2 className="font-bold mb-2">{p.title}</h2>
                <p className="text-sm text-slate-400">{p.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="prose-docs">
          <h2>Responsible disclosure</h2>
          <p>
            Found a vulnerability? Email{" "}
            <a href="mailto:security@nexora.ai">security@nexora.ai</a> with details.
            We aim to respond within 48 hours. Please do not publicly disclose before we patch.
          </p>

          <h2>Secrets management</h2>
          <ul>
            <li>Never commit <code>.env</code> files — use <code>.env.example</code> as template</li>
            <li>Rotate Discord bot token and OAuth secrets if exposed</li>
            <li>Use <code>npm run db:check</code> to validate configuration</li>
            <li>Stripe webhooks verified via <code>stripe-signature</code></li>
          </ul>

          <h2>Compliance</h2>
          <p>
            We align with LGPD and GDPR principles. See our{" "}
            <Link href="/privacy">Privacy Policy</Link> for data subject rights.
          </p>

          <h2>Incident response</h2>
          <p>
            Service status and incident history are published on{" "}
            <Link href="/status">Status</Link>. Subscribers receive email notifications for
            critical incidents affecting their data.
          </p>
        </div>
      </div>
    </PageShell>
  );
}
