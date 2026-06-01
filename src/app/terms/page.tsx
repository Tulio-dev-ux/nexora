import Link from "next/link";
import { PageShell } from "@/components/marketing/page-shell";

export default function TermsPage() {
  return (
    <PageShell>
      <div className="mx-auto max-w-3xl px-6 py-12 prose-docs">
        <p className="text-sm text-slate-500">Last updated: 31 May 2026</p>
        <h1>Terms of Service</h1>
        <p>
          By using NEXORA AI, you agree to these Terms. If you do not agree, do not use the service.
        </p>

        <h2>1. Service description</h2>
        <p>
          NEXORA AI provides AI-powered community management tools including moderation,
          automations, analytics, ticketing, and billing for Discord servers and related platforms.
        </p>

        <h2>2. Accounts</h2>
        <p>
          You must provide accurate information and keep credentials secure. You are responsible
          for activity under your account. We may suspend accounts that violate these Terms or
          Discord&apos;s Terms of Service.
        </p>

        <h2>3. Acceptable use</h2>
        <p>You may not use NEXORA AI to:</p>
        <ul>
          <li>Violate laws or third-party terms (including Discord ToS)</li>
          <li>Harass, spam, or distribute malware</li>
          <li>Reverse engineer or abuse API rate limits</li>
          <li>Resell the service without written authorization</li>
        </ul>

        <h2>4. Subscriptions & billing</h2>
        <p>
          Paid plans renew automatically via Stripe unless cancelled. Refunds follow our
          fair-use policy — contact support within 14 days for billing disputes. Event quotas
          and feature limits are defined per plan on the <Link href="/pricing">Pricing</Link> page.
        </p>

        <h2>5. AI disclaimer</h2>
        <p>
          AI moderation and assistant outputs may contain errors. You remain responsible for
          final moderation decisions and compliance with applicable laws. We do not guarantee
          100% accuracy of automated actions.
        </p>

        <h2>6. Intellectual property</h2>
        <p>
          NEXORA AI retains all rights to the platform. You retain rights to your community content.
          You grant us a limited license to process content solely to provide the service.
        </p>

        <h2>7. Limitation of liability</h2>
        <p>
          To the maximum extent permitted by law, NEXORA AI is not liable for indirect,
          incidental, or consequential damages. Our total liability is limited to fees paid
          in the twelve months preceding the claim.
        </p>

        <h2>8. Changes</h2>
        <p>
          We may update these Terms. Material changes will be notified via email or dashboard.
          Continued use after changes constitutes acceptance.
        </p>

        <h2>Contact</h2>
        <p>
          Legal: <a href="mailto:legal@nexora.ai">legal@nexora.ai</a>
          · <Link href="/privacy">Privacy Policy</Link>
        </p>
      </div>
    </PageShell>
  );
}
