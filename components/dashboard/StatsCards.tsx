"use client";

import { motion } from "framer-motion";
import { Scale, Flame, TrendingUp, Calendar, Target, Zap } from "lucide-react";
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
      {/* Background glow */}
      <div className={cn("absolute -top-6 -right-6 w-20 h-20 rounded-full blur-2xl opacity-20 group-hover:opacity-30 transition-opacity", color)} />

      <div className="flex items-start justify-between mb-3">
        <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center", color.replace("bg-", "bg-").replace("/100", "/20"))}>
          <Icon className={cn("w-4.5 h-4.5", color.replace("bg-", "text-").replace("/20", ""))} />
        </div>
        {change && (
          <span className={cn(
            "text-xs font-medium px-2 py-0.5 rounded-full",
            changeUp ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"
          )}>
            {changeUp ? "+" : ""}{change}
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
  streak: number;
  calories: number;
}

export function StatsCards({
  currentWeight,
  targetWeight,
  sessionsThisWeek,
  weeklyFrequency,
  streak,
  calories,
}: StatsCardsProps) {
  const weightDiff = (currentWeight - 78).toFixed(1);

  const stats: StatCardProps[] = [
    {
      label: "Poids actuel",
      value: `${currentWeight} kg`,
      subValue: `Objectif: ${targetWeight} kg`,
      icon: Scale,
      color: "bg-brand-700/20",
      change: `${weightDiff} kg`,
      changeUp: Number(weightDiff) > 0,
      index: 0,
    },
    {
      label: "Séances semaine",
      value: `${sessionsThisWeek}/${weeklyFrequency}`,
      subValue: "Cette semaine",
      icon: Calendar,
      color: "bg-blue-500/20",
      change: `${Math.round((sessionsThisWeek / weeklyFrequency) * 100)}%`,
      changeUp: sessionsThisWeek >= weeklyFrequency / 2,
      index: 1,
    },
    {
      label: "Série consécutive",
      value: `${streak} jours`,
      subValue: "Record: 18 jours",
      icon: Flame,
      color: "bg-orange-500/20",
      change: "🔥",
      index: 2,
    },
    {
      label: "Calories cibles",
      value: `${calories}`,
      subValue: "kcal / jour",
      icon: Zap,
      color: "bg-emerald-500/20",
      change: "Maintenu",
      changeUp: true,
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
