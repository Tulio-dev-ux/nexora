"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { pt } from "@/lib/i18n/pt-br";

const navLinks = [
  { href: "/features", label: pt.nav.features },
  { href: "/pricing", label: pt.nav.pricing },
  { href: "/docs", label: pt.nav.docs },
  { href: "/blog", label: pt.nav.blog },
  { href: "/status", label: pt.nav.status },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="fixed top-0 left-0 right-0 z-50"
    >
      <nav className="mx-auto max-w-7xl px-6 py-4">
        <div className="glass-strong rounded-2xl px-6 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-violet-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">N</span>
            </div>
            <span className="font-bold text-lg tracking-tight">
              NEXORA<span className="text-cyan-400">AI</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-slate-400 hover:text-white transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link href="/login">{pt.nav.signIn}</Link>
            </Button>
            <Button variant="premium" asChild>
              <Link href="/register">{pt.nav.startFree}</Link>
            </Button>
          </div>

          <button
            className="md:hidden p-2"
            onClick={() => setOpen(!open)}
            aria-label="Menu"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden mt-2 glass-strong rounded-2xl p-4 space-y-3"
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block text-sm text-slate-400 hover:text-white py-2"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="flex flex-col gap-2 pt-2 border-t border-white/10">
              <Button variant="ghost" asChild>
                <Link href="/login">{pt.nav.signIn}</Link>
              </Button>
              <Button variant="premium" asChild>
                <Link href="/register">{pt.nav.startFree}</Link>
              </Button>
            </div>
          </motion.div>
        )}
      </nav>
    </motion.header>
  );
}
