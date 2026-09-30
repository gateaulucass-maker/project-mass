import { motion } from "framer-motion";

export interface StatTileProps {
  label: string;
  value: string;
  /** Classe Tailwind de couleur du texte de la valeur. */
  color: string;
}

export function StatTile({ label, value, color, index = 0 }: StatTileProps & { index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className="bg-card border border-border rounded-xl p-3 text-center"
    >
      <p className={`font-bold text-sm ${color}`}>{value}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
    </motion.div>
  );
}
