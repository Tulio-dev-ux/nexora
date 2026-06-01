import { DocsShell } from "@/components/docs/docs-shell";

export default function SdkDocsPage() {
  return (
    <DocsShell title="SDK" description="Client libraries and REST usage.">
      <section id="javascript">
        <h2>JavaScript / TypeScript</h2>
        <pre className="not-prose p-4 rounded-xl bg-black/40 text-sm overflow-x-auto">
{`const res = await fetch("/api/ai", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  credentials: "include",
  body: JSON.stringify({
    module: "assistant",
    messages: [{ role: "user", content: "Hello" }],
  }),
});
const { response } = await res.json();`}
        </pre>
      </section>

      <section id="python" className="mt-10">
        <h2>Python</h2>
        <pre className="not-prose p-4 rounded-xl bg-black/40 text-sm overflow-x-auto">
{`import requests

r = requests.post(
    "https://your-app.com/api/status",
)
print(r.json())`}
        </pre>
      </section>

      <section id="rest" className="mt-10">
        <h2>REST Client</h2>
        <p>
          Use session cookies from the dashboard or configure server-to-server calls with your
          deployment URL (<code>NEXT_PUBLIC_APP_URL</code>).
        </p>
      </section>
    </DocsShell>
  );
}
