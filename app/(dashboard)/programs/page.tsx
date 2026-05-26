"use client";

import { useState } from "react";
import { Plus, Target, Dumbbell } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { PageHeader } from "@/components/shared/PageHeader";
import { ProgramCard } from "@/components/programs/ProgramCard";
import { ProgramModal, type ProgramFormData } from "@/components/programs/ProgramModal";
import { SkeletonCard } from "@/components/shared/LoadingSpinner";
import { usePrograms } from "@/hooks/usePrograms";
import { useBodyweight } from "@/hooks/useBodyweight";

export default function ProgramsPage() {
  const { programs, loading, createProgram, activate, remove } = usePrograms();
  const { logs: weightLogs } = useBodyweight();
  const [modalOpen, setModalOpen] = useState(false);

  const currentWeight = weightLogs.length > 0 ? weightLogs[weightLogs.length - 1].weight : undefined;
  const activeProgram = programs.find(p => p.is_active);

  async function handleCreate(data: ProgramFormData) {
    await createProgram({ ...data, is_active: true });
  }

  return (
    <div className="flex-1">
      <Header title="Programmes" subtitle="Ton programme en cours" />

      <div className="px-4 lg:px-6 py-5 max-w-2xl space-y-5">
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
          <SkeletonCard className="h-64" />
        ) : activeProgram ? (
          <ProgramCard
            program={activeProgram}
            index={0}
            currentWeight={currentWeight}
            onActivate={activate}
            onDelete={remove}
          />
        ) : (
          <div className="bg-card border border-dashed border-border rounded-2xl p-10 text-center">
            <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
              <Dumbbell className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="font-bold mb-1">Aucun programme actif</p>
            <p className="text-sm text-muted-foreground mb-6">
              Crée ton programme pour structurer ton entraînement et suivre ta progression.
            </p>
            <button
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-3 gradient-brand text-white text-sm font-semibold rounded-xl glow-brand-sm hover:opacity-90 transition-all"
            >
              <Plus className="w-4 h-4" />
              Créer un programme
            </button>
          </div>
        )}
      </div>

      <ProgramModal open={modalOpen} onClose={() => setModalOpen(false)} onSubmit={handleCreate} />
    </div>
  );
}
