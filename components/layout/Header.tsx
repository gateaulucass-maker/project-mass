"use client";

import { Bell, Search } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { MOCK_USER } from "@/lib/mock-data";

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  return (
    <header className="flex items-center justify-between px-4 lg:px-6 py-4 border-b border-border/50 bg-background/80 backdrop-blur-xl sticky top-0 z-40">
      <div>
        {title && <h1 className="text-lg font-bold">{title}</h1>}
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-2">
        <button className="lg:flex hidden items-center gap-2 px-3 py-2 bg-secondary/50 hover:bg-secondary text-muted-foreground rounded-xl text-sm transition-all border border-border/50 w-48">
          <Search className="w-3.5 h-3.5" />
          <span className="text-xs">Rechercher...</span>
          <kbd className="ml-auto text-[10px] font-mono bg-background/60 border border-border/50 rounded px-1">⌘K</kbd>
        </button>

        <button className="relative w-9 h-9 rounded-xl bg-secondary/50 hover:bg-secondary border border-border/50 flex items-center justify-center transition-all">
          <Bell className="w-4 h-4 text-muted-foreground" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-violet-500 rounded-full" />
        </button>

        <div className="lg:hidden">
          <ThemeToggle compact />
        </div>

        <div className="w-8 h-8 rounded-full gradient-violet flex items-center justify-center text-white text-xs font-bold glow-violet-sm">
          {MOCK_USER.full_name?.charAt(0) ?? "L"}
        </div>
      </div>
    </header>
  );
}
