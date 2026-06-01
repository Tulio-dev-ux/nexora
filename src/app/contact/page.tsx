import Link from "next/link";
import { PageShell } from "@/components/marketing/page-shell";

export default function ContactPage() {
  return (
    <PageShell>
      <div className="mx-auto max-w-3xl px-6 py-12 prose-docs">
        <h1>Contact</h1>
        <p>Entre em contato com a equipe NEXORA AI.</p>
        <ul>
          <li>
            Suporte: <a href="mailto:support@nexora.ai">support@nexora.ai</a>
          </li>
          <li>
            Vendas: <a href="mailto:sales@nexora.ai">sales@nexora.ai</a>
          </li>
          <li>
            Privacidade: <a href="mailto:privacy@nexora.ai">privacy@nexora.ai</a>
          </li>
        </ul>
        <p>
          Para tickets no painel, faça login e acesse{" "}
          <Link href="/dashboard/tickets">/dashboard/tickets</Link>.
        </p>
      </div>
    </PageShell>
  );
}
