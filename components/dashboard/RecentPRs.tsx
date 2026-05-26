"use client";

import { motion } from "framer-motion";
import { Trophy, TrendingUp } from "lucide-react";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import type { PersonalRecord } from "@/types";
import { cn } from "@/lib/utils";

interface RecentPRsProps {
  prs: PersonalRecord[];
}

export function RecentPRs({ prs }: RecentPRsProps) {
  return (
    <div className="space-y-2">
      {prs.slice(0, 5).map((pr, i) => (
        <motion.div
          key={`${pr.exercise_name}-${i}`}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.06 }}
          className={cn(
            "flex items-center gap-3 p-3 rounded-xl border transition-all",
            pr.is_new
              ? "bg-violet-500/10 border-violet-500/20"
              : "bg-secondary/40 border-border/40 hover:bg-secondary/70"
          )}
        >
          <div className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
            pr.is_new ? "bg-violet-500/20" : "bg-secondary"
          )}>
            {pr.is_new ? (
              <Trophy className="w-4 h-4 text-violet-400" />
            ) : (
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium truncate">{pr.exercise_name}</p>
              {pr.is_new && (
                <span className="text-[9px] font-bold px-1.5 py-0.5 bg-violet-500/20 text-violet-400 rounded-full border border-violet-500/30 flex-shrink-0">
                  PR
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {format(parseISO(pr.date), "dd MMM", { locale: fr })}
            </p>
          </div>

          <div className="text-right flex-shrink-0">
            <p className="text-sm font-bold">{pr.weight} kg</p>
            <p className="text-xs text-muted-foreground">{pr.reps} reps</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
