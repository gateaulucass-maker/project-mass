"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { LayoutDashboard, Dumbbell, TrendingUp, Target, Scale } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Home", icon: LayoutDashboard },
  { href: "/programs", label: "Programmes", icon: Target },
  { href: "/workouts", label: "Séances", icon: Dumbbell },
  { href: "/progress", label: "Stats", icon: TrendingUp },
  { href: "/weight", label: "Poids", icon: Scale },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-border safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href} className="flex-1">
              <motion.div
                whileTap={{ scale: 0.9 }}
                className="flex flex-col items-center justify-center gap-1 py-2"
              >
                <div className={cn(
                  "relative p-2 rounded-xl transition-all",
                  active ? "bg-brand-50" : ""
                )}>
                  {active && (
                    <motion.div
                      layoutId="mobile-nav-active"
                      className="absolute inset-0 rounded-xl bg-brand-50"
                      transition={{ type: "spring", duration: 0.4 }}
                    />
                  )}
                  <item.icon className={cn(
                    "w-5 h-5 relative z-10 transition-colors",
                    active ? "text-brand-700" : "text-muted-foreground"
                  )} />
                </div>
                <span className={cn(
                  "text-[10px] font-medium transition-colors",
                  active ? "text-brand-700" : "text-muted-foreground"
                )}>
                  {item.label}
                </span>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
