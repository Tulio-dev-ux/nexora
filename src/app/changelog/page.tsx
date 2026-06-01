import { PageShell } from "@/components/marketing/page-shell";

const releases = [
  {
    version: "0.1.0",
    date: "May 2026",
    items: [
      "Discord bot com /nexora (status, moderar, ticket, moderação)",
      "Painel dashboard com IA Groq",
      "Billing Stripe (Starter / Pro / Enterprise)",
      "Socket.io + Redis pub/sub",
      "Auth OAuth + credentials + 2FA",
    ],
  },
];

export default function ChangelogPage() {
  return (
    <PageShell>
      <div className="mx-auto max-w-3xl px-6 py-12 prose-docs">
        <h1>Changelog</h1>
        {releases.map((r) => (
          <section key={r.version} className="mb-10">
            <h2>
              v{r.version}{" "}
              <span className="text-sm font-normal text-slate-500">{r.date}</span>
            </h2>
            <ul>
              {r.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </PageShell>
  );
}
