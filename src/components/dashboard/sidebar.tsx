"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Bot,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Settings,
  Shield,
  Ticket,
  Users,
  Workflow,
  Menu,
  X,
  ChevronLeft,
  CheckCircle2,
  PlusCircle,
} from "lucide-react";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { pt } from "@/lib/i18n/pt-br";

const navItems = [
  { href: "/dashboard", label: pt.dashboard.dashboard, icon: LayoutDashboard },
  { href: "/dashboard/bot", label: pt.dashboard.bot, icon: PlusCircle },
  { href: "/dashboard/ai-center", label: pt.dashboard.aiCenter, icon: Bot },
  { href: "/dashboard/analytics", label: pt.dashboard.analytics, icon: BarChart3 },
  { href: "/dashboard/moderation", label: pt.dashboard.moderation, icon: Shield },
  { href: "/dashboard/automations", label: pt.dashboard.automations, icon: Workflow },
  { href: "/dashboard/members", label: pt.dashboard.members, icon: Users },
  { href: "/dashboard/tickets", label: pt.dashboard.tickets, icon: Ticket },
  { href: "/dashboard/security", label: pt.dashboard.security, icon: Shield },
  { href: "/dashboard/billing", label: pt.dashboard.billing, icon: CreditCard },
  { href: "/dashboard/settings", label: pt.dashboard.settings, icon: Settings },
  { href: "/dashboard/setup", label: pt.dashboard.setup, icon: CheckCircle2 },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const sidebar = (
    <aside
      className={cn(
        "flex flex-col h-full glass-strong border-r border-white/5 transition-all duration-300",
        collapsed ? "w-[72px]" : "w-64"
      )}
    >
      <div className="flex items-center justify-between p-4 border-b border-white/5">
        {!collapsed && (
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-violet-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">N</span>
            </div>
            <span className="font-bold text-sm">
              NEXORA<span className="text-cyan-400">AI</span>
            </span>
          </Link>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex p-1.5 rounded-lg hover:bg-white/5 text-slate-400"
        >
          <ChevronLeft
            className={cn("w-4 h-4 transition-transform", collapsed && "rotate-180")}
          />
        </button>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const active =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200",
                active
                  ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/20"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              )}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-white/5">
        <div className={cn("flex items-center gap-3 p-3 rounded-xl glass", collapsed && "justify-center")}>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-violet-500 shrink-0" />
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{session?.user?.name ?? "Usuário"}</p>
              <Badge variant="secondary" className="text-[10px] mt-0.5">
                {session?.user?.email ?? pt.dashboard.freePlan}
              </Badge>
            </div>
          )}
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex items-center gap-3 w-full px-3 py-2 mt-2 rounded-xl text-sm text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && <span>{pt.dashboard.signOut}</span>}
        </button>
      </div>
    </aside>
  );

  return (
    <>
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 glass rounded-xl"
        onClick={() => setMobileOpen(true)}
      >
        <Menu className="w-5 h-5" />
      </button>

      <div className="hidden lg:block fixed inset-y-0 left-0 z-40">
        {sidebar}
      </div>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-64">
            <button
              className="absolute top-4 right-4 p-1 text-slate-400"
              onClick={() => setMobileOpen(false)}
            >
              <X className="w-5 h-5" />
            </button>
            {sidebar}
          </div>
        </div>
      )}
    </>
  );
}

export function DashboardHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mb-8">
      <h1 className="text-2xl sm:text-3xl font-bold">{title}</h1>
      {description && <p className="text-slate-400 mt-1">{description}</p>}
    </div>
  );
}
