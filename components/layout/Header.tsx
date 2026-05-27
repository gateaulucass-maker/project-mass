"use client";

import { Bell } from "lucide-react";
import Link from "next/link";
import { MOCK_USER } from "@/lib/mock-data";

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  return (
    <header className="flex items-center justify-between px-4 lg:px-6 py-4 border-b border-border bg-background/80 backdrop-blur-xl sticky top-0 z-40">
      <div>
        {title && <h1 className="text-lg font-bold">{title}</h1>}
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-2">
        <Link href="/notifications">
          <div className="relative w-9 h-9 rounded-xl bg-secondary hover:bg-secondary/70 border border-border flex items-center justify-center transition-all cursor-pointer">
            <Bell className="w-4 h-4 text-muted-foreground" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-700 rounded-full" />
          </div>
        </Link>

        <Link href="/profile">
          <div className="w-8 h-8 rounded-full gradient-brand flex items-center justify-center text-white text-xs font-bold glow-brand-sm hover:opacity-90 transition-all cursor-pointer">
            {MOCK_USER.full_name?.charAt(0) ?? "L"}
          </div>
        </Link>
      </div>
    </header>
  );
}
