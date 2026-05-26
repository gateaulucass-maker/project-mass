"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Dumbbell,
  TrendingUp,
  Scale,
  Target,
  LogOut,
  Settings,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/programs", label: "Programmes", icon: Target },
  { href: "/workouts", label: "Séances", icon: Dumbbell },
  { href: "/progress", label: "Progression", icon: TrendingUp },
  { href: "/weight", label: "Poids", icon: Scale },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-64 h-screen sticky top-0 border-r border-border bg-white p-4">
      {/* Logo */}
      <div className="flex items-center gap-3 px-2 mb-8">
        <div className="w-9 h-9 rounded-xl gradient-brand flex items-center justify-center glow-brand-sm flex-shrink-0">
          <Activity className="w-5 h-5 text-white" />
        </div>
        <div>
          <span className="font-bold text-base tracking-tight">Project Mass</span>
          <div className="text-[10px] text-muted-foreground font-medium tracking-widest uppercase">Performance</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all relative",
                  active
                    ? "bg-brand-50 text-brand-700 border border-brand-200"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                )}
              >
                {active && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 rounded-xl bg-brand-50"
                    transition={{ type: "spring", duration: 0.4 }}
                  />
                )}
                <item.icon className={cn("w-4 h-4 flex-shrink-0 relative z-10", active && "text-brand-700")} />
                <span className="relative z-10 flex-1">{item.label}</span>
                {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full bg-brand-700" />}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="space-y-0.5 pt-4 border-t border-border">
        <Link href="/settings">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-all">
            <Settings className="w-4 h-4" />
            Paramètres
          </div>
        </Link>
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-brand-700 hover:bg-brand-50 transition-all">
          <LogOut className="w-4 h-4" />
          Deconnexion
        </button>
      </div>
    </aside>
  );
}
