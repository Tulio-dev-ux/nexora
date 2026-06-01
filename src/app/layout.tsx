import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/components/providers/auth-provider";
import { pt } from "@/lib/i18n/pt-br";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NEXORA AI — The Future of AI Automation",
  description:
    "Enterprise-grade artificial intelligence platform built for modern communities. AI moderation, automation, analytics, and more.",
  keywords: ["AI", "Discord", "automation", "moderation", "SaaS", "community"],
  openGraph: {
    title: "NEXORA AI — The Future of AI Automation",
    description: "Enterprise-grade AI platform for modern communities.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-[#030712] text-white">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
