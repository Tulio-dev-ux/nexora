import { PageShell } from "@/components/marketing/page-shell";
import { PricingSection } from "@/components/landing/pricing-section";

export default function PricingPage() {
  return (
    <PageShell>
      <div className="px-6 py-8 text-center">
        <h1 className="text-4xl font-bold mb-4">Pricing</h1>
        <p className="text-slate-400">Planos flexíveis para comunidades de qualquer escala.</p>
      </div>
      <PricingSection />
    </PageShell>
  );
}
