"use client";

import { useState } from "react";
import { Plus, Target, Dumbbell } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { PageHeader } from "@/components/shared/PageHeader";
import { ProgramCard } from "@/components/programs/ProgramCard";
import { ProgramModal, type ProgramFormData } from "@/components/programs/ProgramModal";
import { useLocalPrograms } from "@/hooks/useLocalPrograms";
import { MOCK_BODYWEIGHT } from "@/lib/mock-data";

export default function ProgramsPage() {
  const router = useRouter();
  const { allPrograms, ready, addProgram, removeProgram } = useLocalPrograms();
  const [modalOpen, setModalOpen] = useState(false);

  const currentWeight = MOCK_BODYWEIGHT[MOCK_BODYWEIGHT.length - 1].weight;
  const activeProgram = allPrograms.find(p => p.is_active);
  const otherPrograms = allPrograms.filter(p => !p.is_active);

  async function handleCreate(data: ProgramFormData) {
    const p = addProgram({ ...data, is_active: false });
    // Rediriger directement vers le détail pour renseigner les exercices
    router.push(`/programs/${p.id}`);
  }

  if (!ready) return null;

  return (
    <div className="flex-1">
      <Header title="Programmes" subtitle="Ton programme en cours" />

      <div className="px-4 lg:px-6 py-5 max-w-2xl space-y-6">
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

        {/* Programme actif */}
        {activeProgram && (
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Programme actif</p>
            <Link href={`/programs/${activeProgram.id}`}>
              <ProgramCard
                program={activeProgram}
                index={0}
                currentWeight={currentWeight}
                onActivate={() => {}}
                onDelete={id => removeProgram(id)}
              />
            </Link>
          </div>
        )}

        {/* Mes programmes */}
        {otherPrograms.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Historique — {otherPrograms.length} programme{otherPrograms.length > 1 ? "s" : ""}
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              {otherPrograms.map((p, i) => (
                <Link key={p.id} href={`/programs/${p.id}`}>
                  <ProgramCard
                    program={p}
                    index={i + 1}
                    currentWeight={currentWeight}
                    onActivate={() => {}}
                    onDelete={id => removeProgram(id)}
                  />
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Empty */}
        {allPrograms.length === 0 && (
          <div className="bg-card border border-dashed border-border rounded-2xl p-10 text-center">
            <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
              <Dumbbell className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="font-bold mb-1">Aucun programme</p>
            <p className="text-sm text-muted-foreground mb-6">
              Crée ton programme pour structurer ton entraînement.
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
