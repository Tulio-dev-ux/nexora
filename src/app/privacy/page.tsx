import Link from "next/link";
import { PageShell } from "@/components/marketing/page-shell";

export default function PrivacyPage() {
  return (
    <PageShell>
      <div className="mx-auto max-w-3xl px-6 py-12 prose-docs">
        <p className="text-sm text-slate-500">Last updated: 31 May 2026</p>
        <h1>Privacy Policy</h1>
        <p>
          NEXORA AI (&quot;we&quot;, &quot;us&quot;) respects your privacy. This policy explains
          what data we collect, how we use it, and your rights.
        </p>

        <h2>Data we collect</h2>
        <ul>
          <li><strong>Account data:</strong> name, email, OAuth provider identifiers</li>
          <li><strong>Discord data:</strong> server IDs, member events, messages processed for moderation (per your configuration)</li>
          <li><strong>Usage data:</strong> AI token usage, dashboard activity, billing events</li>
          <li><strong>Technical data:</strong> IP address, session tokens, device information for security</li>
        </ul>

        <h2>How we use data</h2>
        <ul>
          <li>Provide moderation, automation, analytics, and billing services</li>
          <li>Authenticate users and prevent fraud</li>
          <li>Improve AI models and platform reliability (aggregated, anonymized where possible)</li>
          <li>Communicate service updates and support responses</li>
        </ul>

        <h2>Third parties</h2>
        <p>We use trusted processors:</p>
        <ul>
          <li>Neon (PostgreSQL hosting)</li>
          <li>Upstash (Redis)</li>
          <li>Stripe (payments)</li>
          <li>Groq (AI inference)</li>
          <li>Discord, Google, GitHub (OAuth)</li>
        </ul>
        <p>Each processor is bound by their respective privacy terms and data processing agreements.</p>

        <h2>Retention</h2>
        <p>
          Account data is retained while your account is active. Moderation logs and metrics
          are retained per your plan settings (typically 30–365 days). You may request deletion
          via <a href="mailto:privacy@nexora.ai">privacy@nexora.ai</a>.
        </p>

        <h2>Your rights (LGPD / GDPR)</h2>
        <ul>
          <li>Access, correction, and deletion of personal data</li>
          <li>Data portability</li>
          <li>Withdraw consent for optional processing</li>
          <li>Lodge a complaint with your local authority</li>
        </ul>

        <h2>Contact</h2>
        <p>
          Data Protection: <a href="mailto:privacy@nexora.ai">privacy@nexora.ai</a>
          · <Link href="/contact">Contact form</Link>
        </p>
      </div>
    </PageShell>
  );
}
