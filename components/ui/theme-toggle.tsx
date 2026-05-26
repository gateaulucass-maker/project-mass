"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  compact?: boolean;
}

export function ThemeToggle({ compact }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();

  const toggle = () => setTheme(theme === "dark" ? "light" : "dark");

  if (compact) {
    return (
      <button
        onClick={toggle}
        className="w-9 h-9 rounded-xl bg-secondary/50 hover:bg-secondary border border-border/50 flex items-center justify-center transition-all"
      >
        <Sun className="w-4 h-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-muted-foreground" />
        <Moon className="absolute w-4 h-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-muted-foreground" />
      </button>
    );
  }

  return (
    <button
      onClick={toggle}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium",
        "text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-all"
      )}
    >
      <div className="relative w-4 h-4">
        <Sun className="w-4 h-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 absolute inset-0" />
        <Moon className="w-4 h-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 absolute inset-0" />
      </div>
      <span>Thème</span>
    </button>
  );
}
