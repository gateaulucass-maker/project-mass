import { readSheet, appendRow, updateRow, deleteRow, SHEETS, HEADERS } from "@/lib/google-sheets";
import type { Program } from "@/types";

function rowToProgram(row: Record<string, string>): Program {
  return {
    id: row.id,
    user_id: "local",
    title: row.title,
    type: row.type as Program["type"],
    start_date: row.start_date,
    end_date: row.end_date || undefined,
    start_weight: row.start_weight ? parseFloat(row.start_weight) : undefined,
    target_weight: row.target_weight ? parseFloat(row.target_weight) : undefined,
    calories_target: row.calories_target ? parseInt(row.calories_target) : undefined,
    weekly_frequency: parseInt(row.weekly_frequency) || 4,
    goal: row.goal || undefined,
    is_active: row.is_active === "true",
    created_at: row.created_at,
  };
}

function programToRow(p: Omit<Program, "user_id">): string[] {
  return HEADERS.Programs.map(h => {
    const v = (p as any)[h];
    return v === undefined || v === null ? "" : String(v);
  });
}

export async function getPrograms(): Promise<Program[]> {
  const rows = await readSheet<Record<string, string>>(SHEETS.PROGRAMS);
  return rows.map(rowToProgram);
}

export async function createProgram(data: Omit<Program, "id" | "user_id">): Promise<Program> {
  const id = `p_${Date.now()}`;
  const program: Program = { ...data, id, user_id: "local", created_at: new Date().toISOString() };
  await appendRow(SHEETS.PROGRAMS, programToRow(program));
  return program;
}

export async function updateProgram(id: string, updates: Partial<Program>): Promise<void> {
  const programs = await getPrograms();
  const existing = programs.find(p => p.id === id);
  if (!existing) throw new Error("Program not found");
  const updated = { ...existing, ...updates };
  await updateRow(SHEETS.PROGRAMS, id, programToRow(updated));
}

export async function activateProgram(programId: string): Promise<void> {
  const programs = await getPrograms();
  for (const p of programs) {
    if (p.is_active || p.id === programId) {
      await updateProgram(p.id, { is_active: p.id === programId });
    }
  }
}

export async function deleteProgram(id: string): Promise<void> {
  await deleteRow(SHEETS.PROGRAMS, id);
}
