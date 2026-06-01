import { DocsShell } from "@/components/docs/docs-shell";

export default function GuidesPage() {
  return (
    <DocsShell
      title="Quick Start"
      description="Deploy NEXORA AI from zero to production in under 15 minutes."
    >
      <section>
        <h2>Prerequisites</h2>
        <ul>
          <li>Node.js 20+</li>
          <li>Neon PostgreSQL database</li>
          <li>Upstash Redis (optional, for live events)</li>
          <li>Groq API key</li>
          <li>Discord application (OAuth + bot)</li>
          <li>Stripe account (test mode for development)</li>
        </ul>
      </section>

      <section id="environment">
        <h2>Environment setup</h2>
        <ol>
          <li>Clone the repository and run <code>npm install</code></li>
          <li>Copy <code>.env.example</code> to <code>.env</code></li>
          <li>Fill all variables — run <code>npm run db:check</code> until 100%</li>
          <li>Push schema: <code>npm run db:push</code></li>
          <li>Seed admin user: <code>npm run db:seed</code> (admin@nexora.ai)</li>
        </ol>
        <pre>{`npm install
cp .env.example .env
npm run db:check
npm run db:push
npm run db:seed
npm run dev`}</pre>
      </section>

      <section id="discord-bot">
        <h2>Discord bot</h2>
        <ol>
          <li>Create app at Discord Developer Portal</li>
          <li>Enable OAuth2 redirects: <code>http://localhost:3000/api/auth/callback/discord</code></li>
          <li>Create bot, copy token to <code>DISCORD_BOT_TOKEN</code></li>
          <li>Set <code>DISCORD_BOT_SECRET</code> for API authentication</li>
          <li>Run bot: <code>npm run bot</code> (separate terminal)</li>
        </ol>
      </section>

      <section id="stripe">
        <h2>Stripe billing</h2>
        <p>
          Create products/prices in Stripe, add price IDs to <code>.env</code>, then forward webhooks locally:
        </p>
        <pre>stripe listen --forward-to localhost:3000/api/billing/webhook</pre>
      </section>

      <section id="first-server">
        <h2>First server setup</h2>
        <ol>
          <li>Register at <code>/register</code> or sign in with OAuth</li>
          <li>Invite the bot to your Discord server</li>
          <li>Open <code>/dashboard/setup</code> to verify all modules</li>
          <li>Configure moderation and automations in the dashboard</li>
        </ol>
      </section>
    </DocsShell>
  );
}
