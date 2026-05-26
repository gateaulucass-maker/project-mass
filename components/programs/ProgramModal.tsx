"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { ProgramType } from "@/types";
import { getProgramTypeLabel } from "@/lib/utils";

const PROGRAM_TYPES: ProgramType[] = ["mass", "cut", "strength", "maintenance", "recomposition"];

interface ProgramModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ProgramFormData) => Promise<void>;
}

export interface ProgramFormData {
  title: string;
  type: ProgramType;
  start_date: string;
  end_date?: string;
  start_weight?: number;
  target_weight?: number;
  calories_target?: number;
  weekly_frequency: number;
  goal?: string;
}

export function ProgramModal({ open, onClose, onSubmit }: ProgramModalProps) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<ProgramFormData>({
    title: "",
    type: "mass",
    start_date: new Date().toISOString().split("T")[0],
    weekly_frequency: 4,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(form);
      toast.success("Programme créé !");
      onClose();
    } catch {
      toast.error("Erreur lors de la création");
    } finally {
      setLoading(false);
    }
  }

  const update = (field: keyof ProgramFormData, value: any) =>
    setForm(prev => ({ ...prev, [field]: value }));

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.4 }}
            className="fixed inset-x-4 top-[5%] md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-lg bg-card border border-border/50 rounded-3xl shadow-card-dark z-50 overflow-hidden max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-border/50 sticky top-0 bg-card z-10">
              <h2 className="text-lg font-bold">Nouveau programme</h2>
              <button onClick={onClose} className="w-8 h-8 rounded-xl bg-secondary/50 flex items-center justify-center hover:bg-secondary transition-all">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Title */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Nom du programme</label>
                <input
                  value={form.title}
                  onChange={e => update("title", e.target.value)}
                  placeholder="ex: PPL Prise de masse"
                  required
                  className="w-full px-4 py-3 bg-secondary/50 border border-border/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all"
                />
              </div>

              {/* Type */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Type d&apos;objectif</label>
                <div className="grid grid-cols-2 gap-2">
                  {PROGRAM_TYPES.map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => update("type", type)}
                      className={`px-3 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                        form.type === type
                          ? "bg-violet-600/20 border-violet-500/40 text-violet-400"
                          : "bg-secondary/40 border-border/50 text-muted-foreground hover:border-border"
                      }`}
                    >
                      {getProgramTypeLabel(type)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Date début</label>
                  <input
                    type="date"
                    value={form.start_date}
                    onChange={e => update("start_date", e.target.value)}
                    className="w-full px-3 py-3 bg-secondary/50 border border-border/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Date fin</label>
                  <input
                    type="date"
                    value={form.end_date ?? ""}
                    onChange={e => update("end_date", e.target.value)}
                    className="w-full px-3 py-3 bg-secondary/50 border border-border/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all"
                  />
                </div>
              </div>

              {/* Weights */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Poids départ (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={form.start_weight ?? ""}
                    onChange={e => update("start_weight", parseFloat(e.target.value))}
                    placeholder="80.0"
                    className="w-full px-3 py-3 bg-secondary/50 border border-border/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Poids cible (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={form.target_weight ?? ""}
                    onChange={e => update("target_weight", parseFloat(e.target.value))}
                    placeholder="87.0"
                    className="w-full px-3 py-3 bg-secondary/50 border border-border/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all"
                  />
                </div>
              </div>

              {/* Calories & Frequency */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Calories/jour</label>
                  <input
                    type="number"
                    value={form.calories_target ?? ""}
                    onChange={e => update("calories_target", parseInt(e.target.value))}
                    placeholder="3200"
                    className="w-full px-3 py-3 bg-secondary/50 border border-border/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Séances/semaine</label>
                  <select
                    value={form.weekly_frequency}
                    onChange={e => update("weekly_frequency", parseInt(e.target.value))}
                    className="w-full px-3 py-3 bg-secondary/50 border border-border/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all"
                  >
                    {[2, 3, 4, 5, 6].map(n => (
                      <option key={n} value={n}>{n}×/semaine</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Goal */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Objectif (optionnel)</label>
                <textarea
                  value={form.goal ?? ""}
                  onChange={e => update("goal", e.target.value)}
                  placeholder="Décris ton objectif principal..."
                  rows={3}
                  className="w-full px-4 py-3 bg-secondary/50 border border-border/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 gradient-violet text-white font-semibold rounded-xl glow-violet-sm hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Créer le programme"}
              </button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
