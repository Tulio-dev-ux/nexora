import { PageShell } from "@/components/marketing/page-shell";

const roles = [
  { title: "Full-stack Engineer", location: "Remote · PT-BR", type: "Full-time" },
  { title: "ML / AI Engineer", location: "Remote", type: "Full-time" },
  { title: "Developer Advocate", location: "Hybrid · São Paulo", type: "Full-time" },
];

export default function CareersPage() {
  return (
    <PageShell>
      <div className="mx-auto max-w-3xl px-6 py-12 prose-docs">
        <h1>Careers</h1>
        <p>Construa o futuro da automação com IA para comunidades.</p>
        <div className="not-prose space-y-4 mt-8">
          {roles.map((r) => (
            <div key={r.title} className="p-5 rounded-xl glass border border-white/5">
              <h3 className="font-semibold text-lg">{r.title}</h3>
              <p className="text-sm text-slate-400">
                {r.location} · {r.type}
              </p>
              <a
                href="mailto:careers@nexora.ai"
                className="text-cyan-400 text-sm mt-2 inline-block hover:underline"
              >
                Apply → careers@nexora.ai
              </a>
            </div>
          ))}
        </div>
      </div>
    </PageShell>
  );
}
