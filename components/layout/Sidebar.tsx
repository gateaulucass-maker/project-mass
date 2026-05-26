"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Dumbbell,
  TrendingUp,
  Scale,
  Camera,
  Bot,
  Target,
  LogOut,
  Settings,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/programs", label: "Programmes", icon: Target },
  { href: "/workouts", label: "Séances", icon: Dumbbell },
  { href: "/progress", label: "Progression", icon: TrendingUp },
  { href: "/weight", label: "Poids", icon: Scale },
  { href: "/photos", label: "Photos", icon: Camera },
  { href: "/ai-coach", label: "Coach IA", icon: Bot, badge: "NEW" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-64 h-screen sticky top-0 border-r border-border/50 bg-card/50 backdrop-blur-xl p-4">
      {/* Logo */}
      <div className="flex items-center gap-3 px-2 mb-8">
        <div className="w-9 h-9 rounded-xl gradient-violet flex items-center justify-center glow-violet-sm flex-shrink-0">
          <Zap className="w-5 h-5 text-white" />
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
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all relative group",
                  active
                    ? "bg-violet-600/15 text-violet-400 border border-violet-500/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/80"
                )}
              >
                {active && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 rounded-xl bg-violet-600/10"
                    transition={{ type: "spring", duration: 0.4 }}
                  />
                )}
                <item.icon className={cn("w-4 h-4 flex-shrink-0 relative z-10", active && "text-violet-400")} />
                <span className="relative z-10 flex-1">{item.label}</span>
                {item.badge && (
                  <span className="relative z-10 text-[9px] font-bold px-1.5 py-0.5 bg-violet-500/20 text-violet-400 rounded-full border border-violet-500/30">
                    {item.badge}
                  </span>
                )}
                {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full bg-violet-400" />}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="space-y-1 pt-4 border-t border-border/50">
        <ThemeToggle />
        <Link href="/settings">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-all">
            <Settings className="w-4 h-4" />
            Paramètres
          </div>
        </Link>
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all">
          <LogOut className="w-4 h-4" />
          Déconnexion
        </button>
      </div>
    </aside>
  );
}
