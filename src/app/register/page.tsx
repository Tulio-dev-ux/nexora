"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { pt } from "@/lib/i18n/pt-br";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const t = pt.auth;

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const normalizedEmail = email.trim().toLowerCase();

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email: normalizedEmail, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error === "Email already registered" ? "E-mail já cadastrado" : (data.error ?? "Erro ao criar conta"));
      setLoading(false);
      return;
    }

    const result = await signIn("credentials", {
      email: normalizedEmail,
      password,
      redirect: false,
    });

    if (!result?.ok) {
      setLoading(false);
      router.push("/login");
      return;
    }

    router.refresh();
    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center grid-bg relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.08)_0%,transparent_70%)]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md mx-4"
      >
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-violet-500 flex items-center justify-center">
              <span className="text-white font-bold">N</span>
            </div>
            <span className="font-bold text-xl">NEXORA<span className="text-cyan-400">AI</span></span>
          </Link>
          <h1 className="text-2xl font-bold">{t.createAccount}</h1>
          <p className="text-slate-400 mt-2">{t.registerSubtitle}</p>
        </div>

        <Card className="neon-glow">
          <CardContent className="p-6">
            <form onSubmit={handleRegister} className="space-y-4">
              <input
                placeholder={t.fullName}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl glass text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
              />
              <input
                placeholder={t.email}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl glass text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
              />
              <input
                placeholder={t.passwordMin}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="w-full px-4 py-3 rounded-xl glass text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
              />
              {error && <p className="text-sm text-red-400">{error}</p>}
              <Button variant="premium" className="w-full h-12" type="submit" disabled={loading}>
                {loading ? t.creating : t.createAccountBtn}
              </Button>
              <p className="text-xs text-slate-500 text-center">{t.termsNotice}</p>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-slate-500 mt-6">
          {t.hasAccount}{" "}
          <Link href="/login" className="text-cyan-400 hover:underline">{t.signIn}</Link>
        </p>
      </motion.div>
    </div>
  );
}
