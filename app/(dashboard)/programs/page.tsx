"use client";

import { useState } from "react";
import { Plus, Target } from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/layout/Header";
import { PageHeader } from "@/components/shared/PageHeader";
import { ProgramCard } from "@/components/programs/ProgramCard";
import { ProgramModal, type ProgramFormData } from "@/components/programs/ProgramModal";
import { EmptyState } from "@/components/shared/EmptyState";
import { SkeletonList } from "@/components/shared/LoadingSpinner";
import { usePrograms } from "@/hooks/usePrograms";

export default function ProgramsPage() {
  const { programs, loading, createProgram, activate, remove } = usePrograms();
  const [modalOpen, setModalOpen] = useState(false);

  const activeProgram = programs.find(p => p.is_active);
  const inactivePrograms = programs.filter(p => !p.is_active);

  async function handleCreate(data: ProgramFormData) {
    await createProgram({ ...data, is_active: false });
    toast.success("Programme créé !");
  }

  return (
    <div className="flex-1">
      <Header title="Programmes" subtitle="Gère tes programmes d'entraînement" />

      <div className="px-4 lg:px-6 py-5 max-w-4xl space-y-6">
        <PageHeader
          title="Programmes"
          icon={Target}
          action={
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 gradient-violet text-white text-sm font-semibold rounded-xl glow-violet-sm hover:opacity-90 active:scale-[0.98] transition-all"
            >
              <Plus className="w-4 h-4" />
              Nouveau
            </button>
          }
        />

        {loading ? (
          <SkeletonList count={3} />
        ) : (
          <>
            {activeProgram && (
              <div>
                <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Programme actif</h2>
                <ProgramCard program={activeProgram} index={0} onActivate={activate} onDelete={remove} />
              </div>
            )}

            {inactivePrograms.length > 0 && (
              <div>
                <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Programmes précédents</h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {inactivePrograms.map((p, i) => (
                    <ProgramCard key={p.id} program={p} index={i + 1} onActivate={activate} onDelete={remove} />
                  ))}
                </div>
              </div>
            )}

            {programs.length === 0 && (
              <EmptyState
                icon={Target}
                title="Aucun programme"
                description="Crée ton premier programme d'entraînement pour commencer à suivre ta progression."
                action={
                  <button
                    onClick={() => setModalOpen(true)}
                    className="px-5 py-2.5 gradient-violet text-white text-sm font-semibold rounded-xl glow-violet-sm hover:opacity-90 transition-all"
                  >
                    Créer un programme
                  </button>
                }
              />
            )}
          </>
        )}
      </div>

      <ProgramModal open={modalOpen} onClose={() => setModalOpen(false)} onSubmit={handleCreate} />
    </div>
  );
}
