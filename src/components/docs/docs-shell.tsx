"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { docsNav } from "@/lib/content/docs-nav";

export function DocsShell({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#030712] grid-bg pt-28">
        <div className="mx-auto max-w-7xl px-6 py-12 flex flex-col lg:flex-row gap-10">
          <aside className="lg:w-64 shrink-0">
            <Link href="/docs" className="text-cyan-400 text-sm hover:underline">
              ← Documentation
            </Link>
            <nav className="mt-6 space-y-6">
              {docsNav.map((section) => (
                <div key={section.title}>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                    {section.title}
                  </p>
                  <ul className="space-y-1">
                    {section.links.map((link) => (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          className={cn(
                            "block text-sm py-1.5 px-3 rounded-lg transition-colors",
                            pathname === link.href
                              ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                              : "text-slate-400 hover:text-white hover:bg-white/5"
                          )}
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </nav>
          </aside>

          <main className="flex-1 min-w-0">
            <h1 className="text-4xl font-bold mb-2">{title}</h1>
            {description && <p className="text-slate-400 mb-10">{description}</p>}
            <div className="prose-docs">{children}</div>
          </main>
        </div>
      </div>
      <Footer />
    </>
  );
}
