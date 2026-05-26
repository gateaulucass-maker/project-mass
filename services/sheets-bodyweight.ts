import { readSheet, appendRow, SHEETS, HEADERS } from "@/lib/google-sheets";
import type { BodyweightLog } from "@/types";

export async function getBodyweightLogs(): Promise<BodyweightLog[]> {
  const rows = await readSheet<Record<string, string>>(SHEETS.BODYWEIGHT);
  return rows.map(r => ({
    id: r.id,
    user_id: "local",
    weight: parseFloat(r.weight) || 0,
    created_at: r.created_at,
  })).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
}

export async function logBodyweight(weight: number): Promise<BodyweightLog> {
  const id = `bw_${Date.now()}`;
  const log: BodyweightLog = {
    id,
    user_id: "local",
    weight,
    created_at: new Date().toISOString(),
  };
  const row = HEADERS.Bodyweight.map(h => String((log as any)[h] ?? ""));
  await appendRow(SHEETS.BODYWEIGHT, row);
  return log;
}
