"use client";

import { motion } from "framer-motion";
import { Scale, TrendingUp, Calendar, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  subValue?: string;
  icon: React.ElementType;
  color: string;
  change?: string;
  changeUp?: boolean;
  index: number;
}

function StatCard({ label, value, subValue, icon: Icon, color, change, changeUp, index }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      className="bg-card border border-border rounded-2xl p-5 card-hover relative overflow-hidden group"
    >
      <div className={cn("absolute -top-6 -right-6 w-20 h-20 rounded-full blur-2xl opacity-15 group-hover:opacity-25 transition-opacity", color)} />

      <div className="flex items-start justify-between mb-3">
        <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center", color.replace("bg-", "").includes("brand") ? "bg-brand-50" : color.replace("/20", "/15"))}>
          <Icon className={cn("w-4 h-4", color.includes("brand") ? "text-brand-700" : color.replace("bg-", "text-").replace("/20", ""))} />
        </div>
        {change && (
          <span className={cn(
            "text-xs font-medium px-2 py-0.5 rounded-full",
            changeUp === undefined ? "bg-secondary text-muted-foreground" :
            changeUp ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-red-50 text-red-600 border border-red-100"
          )}>
            {changeUp === true ? "+" : ""}{change}
          </span>
        )}
      </div>

      <div>
        <p className="text-2xl font-bold tracking-tight">{value}</p>
        {subValue && <p className="text-xs text-muted-foreground mt-0.5">{subValue}</p>}
        <p className="text-xs text-muted-foreground mt-1">{label}</p>
      </div>
    </motion.div>
  );
}

interface StatsCardsProps {
  currentWeight: number;
  targetWeight: number;
  sessionsThisWeek: number;
  weeklyFrequency: number;
  totalSessions: number;
}

export function StatsCards({ currentWeight, targetWeight, sessionsThisWeek, weeklyFrequency, totalSessions }: StatsCardsProps) {
  const weightDiff = (currentWeight - 78).toFixed(1);

  const stats: StatCardProps[] = [
    {
      label: "Poids actuel",
      value: `${currentWeight} kg`,
      subValue: `Objectif: ${targetWeight} kg`,
      icon: Scale,
      color: "bg-brand-700/20",
      change: `${Number(weightDiff) > 0 ? "+" : ""}${weightDiff} kg`,
      changeUp: Number(weightDiff) > 0,
      index: 0,
    },
    {
      label: "Seances semaine",
      value: `${sessionsThisWeek}/${weeklyFrequency}`,
      subValue: "Cette semaine",
      icon: Calendar,
      color: "bg-blue-500/20",
      change: `${Math.round((sessionsThisWeek / weeklyFrequency) * 100)}%`,
      changeUp: sessionsThisWeek >= weeklyFrequency / 2,
      index: 1,
    },
    {
      label: "Seances totales",
      value: String(totalSessions),
      subValue: "Depuis le debut",
      icon: Trophy,
      color: "bg-amber-500/20",
      index: 2,
    },
    {
      label: "Progression poids",
      value: `+${weightDiff} kg`,
      subValue: "Depuis reprise",
      icon: TrendingUp,
      color: "bg-emerald-500/20",
      change: "Fev 2026",
      index: 3,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map((s) => (
        <StatCard key={s.label} {...s} />
      ))}
    </div>
  );
}
