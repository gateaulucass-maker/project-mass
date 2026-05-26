import { NextResponse } from "next/server";
import { isSheetsConfigured } from "@/lib/google-sheets";
import { getAllWorkouts, getWorkoutsByProgram, createWorkout, createExercise } from "@/services/sheets-workouts";
import { MOCK_WORKOUTS } from "@/lib/mock-data";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const programId = searchParams.get("programId");

  if (!isSheetsConfigured()) {
    const filtered = programId ? MOCK_WORKOUTS.filter(w => w.program_id === programId) : MOCK_WORKOUTS;
    return NextResponse.json(filtered);
  }
  try {
    const workouts = programId ? await getWorkoutsByProgram(programId) : await getAllWorkouts();
    return NextResponse.json(workouts);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  if (!isSheetsConfigured()) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }
  try {
    const { workout, exercises } = await req.json();
    const created = await createWorkout(workout);
    if (exercises?.length) {
      await Promise.all(exercises.map((e: any) => createExercise({ ...e, workout_id: created.id })));
    }
    return NextResponse.json(created);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
