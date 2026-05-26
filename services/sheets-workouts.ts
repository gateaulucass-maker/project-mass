import { readSheet, appendRow, updateRow, deleteRow, SHEETS, HEADERS } from "@/lib/google-sheets";
import type { Workout, Exercise, WorkoutLog } from "@/types";

function rowToWorkout(row: Record<string, string>): Workout {
  return {
    id: row.id,
    program_id: row.program_id,
    title: row.title,
    workout_type: row.workout_type as Workout["workout_type"],
    created_at: row.created_at,
  };
}

function rowToExercise(row: Record<string, string>): Exercise {
  return {
    id: row.id,
    workout_id: row.workout_id,
    name: row.name,
    muscle_group: row.muscle_group as Exercise["muscle_group"],
    sets: parseInt(row.sets) || 3,
    reps: parseInt(row.reps) || 10,
    weight: parseFloat(row.weight) || 0,
    rest_time: parseInt(row.rest_time) || 90,
    order_index: parseInt(row.order_index) || 0,
    notes: row.notes || undefined,
  };
}

export async function getWorkoutsByProgram(programId: string): Promise<Workout[]> {
  const [workoutRows, exerciseRows] = await Promise.all([
    readSheet<Record<string, string>>(SHEETS.WORKOUTS),
    readSheet<Record<string, string>>(SHEETS.EXERCISES),
  ]);

  return workoutRows
    .filter(r => r.program_id === programId)
    .map(r => ({
      ...rowToWorkout(r),
      exercises: exerciseRows.filter(e => e.workout_id === r.id).map(rowToExercise),
    }));
}

export async function getAllWorkouts(): Promise<Workout[]> {
  const [workoutRows, exerciseRows] = await Promise.all([
    readSheet<Record<string, string>>(SHEETS.WORKOUTS),
    readSheet<Record<string, string>>(SHEETS.EXERCISES),
  ]);

  return workoutRows.map(r => ({
    ...rowToWorkout(r),
    exercises: exerciseRows.filter(e => e.workout_id === r.id).map(rowToExercise),
  }));
}

export async function createWorkout(data: Omit<Workout, "id" | "created_at">): Promise<Workout> {
  const id = `w_${Date.now()}`;
  const workout: Workout = { ...data, id, created_at: new Date().toISOString() };
  const row = HEADERS.Workouts.map(h => String((workout as any)[h] ?? ""));
  await appendRow(SHEETS.WORKOUTS, row);
  return workout;
}

export async function createExercise(data: Omit<Exercise, "id">): Promise<Exercise> {
  const id = `e_${Date.now()}`;
  const exercise: Exercise = { ...data, id };
  const row = HEADERS.Exercises.map(h => String((exercise as any)[h] ?? ""));
  await appendRow(SHEETS.EXERCISES, row);
  return exercise;
}

export async function logWorkoutSet(data: {
  workout_id: string;
  exercise_name: string;
  performed_weight: number;
  performed_reps: number;
  set_number: number;
  completed: boolean;
}): Promise<void> {
  const id = `l_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const row = HEADERS.WorkoutLogs.map(h => {
    if (h === "id") return id;
    if (h === "created_at") return new Date().toISOString();
    return String((data as any)[h] ?? "");
  });
  await appendRow(SHEETS.WORKOUT_LOGS, row);
}

export async function getWorkoutLogs(exerciseName?: string): Promise<WorkoutLog[]> {
  const rows = await readSheet<Record<string, string>>(SHEETS.WORKOUT_LOGS);
  const logs = rows.map(r => ({
    id: r.id,
    user_id: "local",
    workout_id: r.workout_id,
    exercise_name: r.exercise_name,
    performed_weight: parseFloat(r.performed_weight) || 0,
    performed_reps: parseInt(r.performed_reps) || 0,
    set_number: parseInt(r.set_number) || 1,
    completed: r.completed === "true",
    created_at: r.created_at,
  }));

  if (exerciseName) return logs.filter(l => l.exercise_name === exerciseName);
  return logs;
}
