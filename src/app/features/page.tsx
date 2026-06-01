import Link from "next/link";
import { PageShell } from "@/components/marketing/page-shell";
import { FeaturesSection } from "@/components/landing/features-section";

export default function FeaturesPage() {
  return (
    <PageShell>
      <div className="px-6 py-8 text-center">
        <h1 className="text-4xl font-bold mb-4">Features</h1>
        <p className="text-slate-400 max-w-2xl mx-auto">
          Moderação IA, automações, analytics, billing e bot Discord — tudo em uma plataforma.
        </p>
        <Link
          href="/register"
          className="inline-block mt-6 text-cyan-400 hover:underline"
        >
          Começar grátis →
        </Link>
      </div>
      <FeaturesSection />
    </PageShell>
  );
}
