"use client";

import { useState } from "react";
import { Plus, Target, Dumbbell } from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/layout/Header";
import { PageHeader } from "@/components/shared/PageHeader";
import { ProgramCard } from "@/components/programs/ProgramCard";
import { ProgramModal, type ProgramFormData } from "@/components/programs/ProgramModal";
import { SkeletonList } from "@/components/shared/LoadingSpinner";
import { usePrograms } from "@/hooks/usePrograms";
import { useBodyweight } from "@/hooks/useBodyweight";

export default function ProgramsPage() {
  const { programs, loading, createProgram, activate, remove } = usePrograms();
  const { logs: weightLogs } = useBodyweight();
  const [modalOpen, setModalOpen] = useState(false);

  const currentWeight = weightLogs.length > 0 ? weightLogs[weightLogs.length - 1].weight : undefined;
  const activeProgram = programs.find(p => p.is_active);
  const inactivePrograms = programs.filter(p => !p.is_active);

  async function handleCreate(data: ProgramFormData) {
    await createProgram({ ...data, is_active: false });
  }

  return (
    <div className="flex-1">
      <Header title="Programmes" subtitle="Tes cycles d'entraînement" />

      <div className="px-4 lg:px-6 py-5 max-w-4xl space-y-6">
        <PageHeader
          title="Programmes"
          icon={Target}
          action={
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 gradient-brand text-white text-sm font-semibold rounded-xl glow-brand-sm hover:opacity-90 active:scale-[0.98] transition-all"
            >
              <Plus className="w-4 h-4" />
              Nouveau
            </button>
          }
        />

        {loading ? (
          <SkeletonList count={2} />
        ) : (
          <>
            {/* Summary strip */}
            {programs.length > 0 && (
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Total", value: programs.length.toString() },
                  { label: "Terminés", value: inactivePrograms.length.toString() },
                  { label: "Poids actuel", value: currentWeight ? `${currentWeight} kg` : "—" },
                ].map(s => (
                  <div key={s.label} className="bg-card border border-border rounded-xl p-3 text-center">
                    <p className="font-bold text-sm text-brand-700">{s.value}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Active program or CTA */}
            {activeProgram ? (
              <div>
                <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Programme actif</h2>
                <ProgramCard
                  program={activeProgram}
                  index={0}
                  currentWeight={currentWeight}
                  onActivate={activate}
                  onDelete={remove}
                />
              </div>
            ) : (
              <div className="bg-card border border-dashed border-border rounded-2xl p-6 text-center">
                <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-3">
                  <Dumbbell className="w-5 h-5 text-muted-foreground" />
                </div>
                <p className="font-semibold text-sm mb-1">Aucun programme actif</p>
                <p className="text-xs text-muted-foreground mb-4">
                  Lance un nouveau cycle ou réactive un programme précédent.
                </p>
                <button
                  onClick={() => setModalOpen(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 gradient-brand text-white text-sm font-semibold rounded-xl glow-brand-sm hover:opacity-90 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Créer un programme
                </button>
              </div>
            )}

            {/* History */}
            {inactivePrograms.length > 0 && (
              <div>
                <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Historique — {inactivePrograms.length} programme{inactivePrograms.length > 1 ? "s" : ""}
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {inactivePrograms.map((p, i) => (
                    <ProgramCard
                      key={p.id}
                      program={p}
                      index={i + 1}
                      currentWeight={currentWeight}
                      onActivate={activate}
                      onDelete={remove}
                    />
                  ))}
                </div>
              </div>
            )}

            {programs.length === 0 && (
              <div className="bg-card border border-dashed border-border rounded-2xl p-8 text-center">
                <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
                  <Target className="w-6 h-6 text-muted-foreground" />
                </div>
                <p className="font-bold mb-1">Aucun programme</p>
                <p className="text-sm text-muted-foreground mb-5">
                  Crée ton premier programme pour structurer ton entraînement.
                </p>
                <button
                  onClick={() => setModalOpen(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 gradient-brand text-white text-sm font-semibold rounded-xl glow-brand-sm hover:opacity-90 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Créer un programme
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <ProgramModal open={modalOpen} onClose={() => setModalOpen(false)} onSubmit={handleCreate} />
    </div>
  );
}
