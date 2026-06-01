import { DocsShell } from "@/components/docs/docs-shell";

export default function TutorialsPage() {
  return (
    <DocsShell title="Tutorials" description="Step-by-step guides for NEXORA AI.">
      <section id="ai-moderation">
        <h2>AI Moderation</h2>
        <ol>
          <li>Configure <code>GROQ_API_KEY</code> in .env</li>
          <li>Add the bot to your Discord server</li>
          <li>Enable auto-moderation in dashboard → Moderation</li>
          <li>Use <code>/nexora moderar &lt;texto&gt;</code> for manual checks</li>
        </ol>
      </section>

      <section id="automations" className="mt-10">
        <h2>Automations</h2>
        <p>
          Create welcome flows and triggers in <strong>Dashboard → Automations</strong>. The bot
          fires member_join events via Redis pub/sub.
        </p>
      </section>

      <section id="billing" className="mt-10">
        <h2>Billing & Stripe</h2>
        <ol>
          <li>Set Stripe keys and price IDs in .env</li>
          <li>Run <code>stripe listen --forward-to localhost:3000/api/billing/webhook</code></li>
          <li>Upgrade plan from Dashboard → Billing</li>
        </ol>
      </section>
    </DocsShell>
  );
}
