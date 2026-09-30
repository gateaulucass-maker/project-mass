import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { ACCENTS, type Accent } from "./accent";

export interface HeroMetricCardProps {
  accent: Accent;
  label: string;
  value: string;
  unit: string;
  /** Ligne secondaire sous la valeur (dernière sortie, évolution…). */
  subline?: ReactNode;
  addLabel: string;
  expanded: boolean;
  onToggle: () => void;
  /** Formulaire d'ajout, affiché quand `expanded` est vrai. */
  children?: ReactNode;
}

export function HeroMetricCard({ accent, label, value, unit, subline, addLabel, expanded, onToggle, children }: HeroMetricCardProps) {
  const a = ACCENTS[accent];
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-2xl p-6 relative overflow-hidden"
    >
      <div className={`absolute top-0 right-0 w-40 h-40 ${a.blob} rounded-full blur-3xl pointer-events-none`} />
      <div className="flex items-end justify-between relative z-10">
        <div>
          <p className="text-sm text-muted-foreground mb-1">{label}</p>
          <p className="text-5xl font-black">
            {value}
            <span className="text-2xl font-bold text-muted-foreground ml-1">{unit}</span>
          </p>
          {subline}
        </div>
        <button
          type="button"
          onClick={onToggle}
          aria-label={addLabel}
          aria-expanded={expanded}
          className={`w-12 h-12 rounded-2xl ${a.addButton} flex items-center justify-center hover:opacity-90 active:scale-95 transition-all`}
        >
          <Plus className="w-5 h-5 text-white" aria-hidden="true" />
        </button>
      </div>
      {expanded && children}
    </motion.div>
  );
}
