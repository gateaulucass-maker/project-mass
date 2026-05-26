import { NextResponse } from "next/server";
import { isSheetsConfigured } from "@/lib/google-sheets";
import {
  getPrograms,
  createProgram,
  updateProgram,
  activateProgram,
  deleteProgram,
} from "@/services/sheets-programs";
import { MOCK_PROGRAMS } from "@/lib/mock-data";
import type { Program } from "@/types";

export async function GET() {
  if (!isSheetsConfigured()) {
    return NextResponse.json(MOCK_PROGRAMS);
  }
  try {
    const programs = await getPrograms();
    // Si Sheets est vide (non initialisé), on affiche les données mock
    return NextResponse.json(programs.length > 0 ? programs : MOCK_PROGRAMS);
  } catch (err: any) {
    console.error("[programs GET]", err.message);
    return NextResponse.json(MOCK_PROGRAMS);
  }
}

export async function POST(req: Request) {
  const body = await req.json();

  // Programme de secours local — toujours valide côté UI
  const fallback: Program = {
    id: `p_${Date.now()}`,
    user_id: "local",
    title: body.title,
    type: body.type,
    start_date: body.start_date,
    end_date: body.end_date,
    start_weight: body.start_weight ? Number(body.start_weight) : undefined,
    target_weight: body.target_weight ? Number(body.target_weight) : undefined,
    calories_target: body.calories_target ? Number(body.calories_target) : undefined,
    weekly_frequency: Number(body.weekly_frequency) || 4,
    goal: body.goal,
    is_active: body.is_active ?? false,
    created_at: new Date().toISOString(),
  };

  if (!isSheetsConfigured()) {
    return NextResponse.json(fallback);
  }

  try {
    const program = await createProgram(body);
    return NextResponse.json(program);
  } catch (err: any) {
    console.error("[programs POST]", err.message);
    return NextResponse.json(fallback);
  }
}

export async function PATCH(req: Request) {
  const body = await req.json();
  const { id, action, ...updates } = body;

  if (!isSheetsConfigured()) {
    return NextResponse.json({ ok: true });
  }

  try {
    if (action === "activate") {
      await activateProgram(id);
    } else {
      await updateProgram(id, updates);
    }
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("[programs PATCH]", err.message);
    return NextResponse.json({ ok: true }); // ne pas bloquer l'UI
  }
}

export async function DELETE(req: Request) {
  const { id } = await req.json();

  if (!isSheetsConfigured()) {
    return NextResponse.json({ ok: true });
  }

  try {
    await deleteProgram(id);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("[programs DELETE]", err.message);
    return NextResponse.json({ ok: true });
  }
}
