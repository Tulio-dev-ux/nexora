"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function DemoPage() {
  return (
    <div className="min-h-screen flex items-center justify-center grid-bg relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(6,182,212,0.08)_0%,transparent_70%)]" />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative max-w-lg mx-4 text-center">
        <h1 className="text-3xl font-bold mb-4">Request a Demo</h1>
        <p className="text-slate-400 mb-8">See NEXORA AI in action with a personalized walkthrough.</p>
        <Card className="neon-glow">
          <CardContent className="p-6 space-y-4 text-left">
            <input placeholder="Full name" className="w-full px-4 py-3 rounded-xl glass text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/30" />
            <input placeholder="Work email" type="email" className="w-full px-4 py-3 rounded-xl glass text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/30" />
            <input placeholder="Company" className="w-full px-4 py-3 rounded-xl glass text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/30" />
            <textarea placeholder="Tell us about your community..." rows={3} className="w-full px-4 py-3 rounded-xl glass text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/30 resize-none" />
            <Button variant="premium" className="w-full">
              Schedule Demo <ArrowRight className="w-4 h-4" />
            </Button>
          </CardContent>
        </Card>
        <Link href="/" className="text-cyan-400 text-sm hover:underline mt-6 inline-block">← Back to home</Link>
      </motion.div>
    </div>
  );
}
