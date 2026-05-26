import { createClient } from "@/lib/supabase/client";
import type { Workout, WorkoutLog, PersonalRecord } from "@/types";

export const workoutsService = {
  async getByProgram(programId: string): Promise<Workout[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("workouts")
      .select("*, exercises(*)")
      .eq("program_id", programId)
      .order("created_at");

    if (error) throw error;
    return data as Workout[];
  },

  async logSet(log: Omit<WorkoutLog, "id" | "created_at">): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase.from("workout_logs").insert(log);
    if (error) throw error;
  },

  async getPersonalRecords(userId: string): Promise<PersonalRecord[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("personal_records")
      .select("*")
      .eq("user_id", userId)
      .order("max_weight", { ascending: false })
      .limit(20);

    if (error) throw error;
    return (data ?? []).map(d => ({
      exercise_name: d.exercise_name,
      weight: d.max_weight,
      reps: d.reps_at_max,
      date: d.achieved_at,
    }));
  },

  async getHistory(userId: string, exerciseName: string): Promise<WorkoutLog[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("workout_logs")
      .select("*")
      .eq("user_id", userId)
      .eq("exercise_name", exerciseName)
      .eq("completed", true)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) throw error;
    return data as WorkoutLog[];
  },
};
