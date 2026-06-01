import { DocsShell } from "@/components/docs/docs-shell";
import { apiEndpoints, rateLimits } from "@/lib/content/api-docs";

export default function ApiDocsPage() {
  return (
    <DocsShell
      title="API Reference"
      description="REST endpoints for NEXORA AI integrations."
    >
      <section id="authentication">
        <h2>Authentication</h2>
        <p>
          Dashboard routes use NextAuth session cookies. Bot routes use{" "}
          <code>Authorization: Bearer DISCORD_BOT_SECRET</code>.
        </p>
      </section>

      <section id="endpoints" className="mt-10">
        <h2>Endpoints</h2>
        <div className="not-prose space-y-3">
          {apiEndpoints.map((ep) => (
            <div key={ep.path + ep.method} className="p-4 rounded-xl glass border border-white/5">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xs font-mono px-2 py-1 rounded bg-cyan-500/20 text-cyan-400">
                  {ep.method}
                </span>
                <code className="text-sm">{ep.path}</code>
              </div>
              <p className="text-sm text-slate-400">{ep.description}</p>
              <p className="text-xs text-slate-500 mt-1">Auth: {ep.auth}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="rate-limits" className="mt-10">
        <h2>Rate Limits</h2>
        <ul>
          <li>Authenticated: {rateLimits.authenticated}</li>
          <li>Bot: {rateLimits.bot}</li>
          <li>Public: {rateLimits.public}</li>
        </ul>
      </section>

      <section id="webhooks" className="mt-10">
        <h2>Webhooks</h2>
        <p>
          Stripe webhooks: <code>POST /api/billing/webhook</code> with{" "}
          <code>STRIPE_WEBHOOK_SECRET</code>.
        </p>
      </section>
    </DocsShell>
  );
}
