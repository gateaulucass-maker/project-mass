import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { Trash2 } from "lucide-react";

export interface HistoryRow {
  left: ReactNode;
  right: ReactNode;
}

export interface HistoryListProps<T extends { id: string }> {
  /** Entrées dans l'ordre chronologique ; la liste est affichée du plus récent au plus ancien. */
  items: readonly T[];
  renderRow: (item: T, index: number) => HistoryRow;
  onRemove?: (id: string) => void;
  removeLabel?: string;
  limit?: number;
}

export function HistoryList<T extends { id: string }>({ items, renderRow, onRemove, removeLabel = "Supprimer", limit }: HistoryListProps<T>) {
  const rows = [...items].reverse();
  const visible = limit ? rows.slice(0, limit) : rows;
  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      <h3 className="font-semibold mb-4">Historique</h3>
      <div className="space-y-2">
        {visible.map((item, i) => {
          const { left, right } = renderRow(item, i);
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: Math.min(i, 10) * 0.03 }}
              className="flex items-center justify-between py-2.5 border-b border-border/30 last:border-0 group"
            >
              <div>{left}</div>
              <div className="flex items-center gap-3">
                {right}
                {onRemove && (
                  <button
                    type="button"
                    onClick={() => onRemove(item.id)}
                    aria-label={removeLabel}
                    className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 focus-visible:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
