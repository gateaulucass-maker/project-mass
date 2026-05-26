import { NextResponse } from "next/server";
import { isSheetsConfigured } from "@/lib/google-sheets";
import { getBodyweightLogs, logBodyweight } from "@/services/sheets-bodyweight";
import { MOCK_BODYWEIGHT } from "@/lib/mock-data";
import type { BodyweightLog } from "@/types";

export async function GET() {
  if (!isSheetsConfigured()) {
    return NextResponse.json(MOCK_BODYWEIGHT);
  }
  try {
    const logs = await getBodyweightLogs();
    return NextResponse.json(logs);
  } catch (err: any) {
    console.error("[bodyweight GET]", err.message);
    return NextResponse.json(MOCK_BODYWEIGHT);
  }
}

export async function POST(req: Request) {
  const body = await req.json();
  const weight = parseFloat(body.weight);

  // Réponse locale de secours — toujours valide côté UI
  const fallback: BodyweightLog = {
    id: `bw_${Date.now()}`,
    user_id: "local",
    weight,
    created_at: new Date().toISOString(),
  };

  if (!isSheetsConfigured()) {
    return NextResponse.json(fallback);
  }

  try {
    const log = await logBodyweight(weight);
    return NextResponse.json(log);
  } catch (err: any) {
    console.error("[bodyweight POST]", err.message);
    // Sheets indisponible : on retourne quand même un log valide
    return NextResponse.json(fallback);
  }
}
