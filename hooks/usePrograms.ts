"use client";

import { useState, useEffect, useCallback } from "react";
import type { Program } from "@/types";

export function usePrograms() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPrograms = useCallback(async () => {
    try {
      const res = await fetch("/api/programs");
      const data = await res.json();
      setPrograms(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPrograms(); }, [fetchPrograms]);

  const activeProgram = programs.find(p => p.is_active);

  async function createProgram(data: Omit<Program, "id" | "user_id" | "created_at">) {
    const res = await fetch("/api/programs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const program = await res.json();
    // Vérifier que la réponse est un programme valide (pas une erreur)
    if (!program?.id) throw new Error(program?.error ?? "Erreur création programme");
    setPrograms(prev => [program, ...prev]);
    return program;
  }

  async function activate(programId: string) {
    await fetch("/api/programs", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: programId, action: "activate" }),
    });
    setPrograms(prev => prev.map(p => ({ ...p, is_active: p.id === programId })));
  }

  async function remove(programId: string) {
    await fetch("/api/programs", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: programId }),
    });
    setPrograms(prev => prev.filter(p => p.id !== programId));
  }

  return { programs, activeProgram, loading, error, createProgram, activate, remove, refresh: fetchPrograms };
}
