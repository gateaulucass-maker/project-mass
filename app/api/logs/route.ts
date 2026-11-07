import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { isSheetsConfigured } from "@/lib/google-sheets";
import { logWorkoutSet, getWorkoutLogs } from "@/services/sheets-workouts";

export async function GET(req: Request) {
  const denied = await requireAuth(req);
  if (denied) return denied;
  const { searchParams } = new URL(req.url);
  const exercise = searchParams.get("exercise") ?? undefined;

  if (!isSheetsConfigured()) {
    return NextResponse.json([]);
  }
  try {
    const logs = await getWorkoutLogs(exercise);
    return NextResponse.json(logs);
  } catch (err: any) {
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const denied = await requireAuth(req);
  if (denied) return denied;
  if (!isSheetsConfigured()) {
    return NextResponse.json({ ok: true }); // silently succeed in demo mode
  }
  try {
    const body = await req.json();
    await logWorkoutSet(body);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}
