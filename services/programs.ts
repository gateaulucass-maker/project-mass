import { createClient } from "@/lib/supabase/client";
import type { Program, ProgramType } from "@/types";

export const programsService = {
  async getAll(userId: string): Promise<Program[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("programs")
      .select("*, workouts(*, exercises(*))")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data as Program[];
  },

  async getActive(userId: string): Promise<Program | null> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("programs")
      .select("*, workouts(*, exercises(*))")
      .eq("user_id", userId)
      .eq("is_active", true)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return data as Program | null;
  },

  async create(userId: string, program: Omit<Program, "id" | "user_id" | "created_at">): Promise<Program> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("programs")
      .insert({ ...program, user_id: userId })
      .select()
      .single();

    if (error) throw error;
    return data as Program;
  },

  async update(id: string, updates: Partial<Program>): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase.from("programs").update(updates).eq("id", id);
    if (error) throw error;
  },

  async activate(userId: string, programId: string): Promise<void> {
    const supabase = createClient();
    // Deactivate all programs for user
    await supabase.from("programs").update({ is_active: false }).eq("user_id", userId);
    // Activate the selected one
    const { error } = await supabase.from("programs").update({ is_active: true }).eq("id", programId);
    if (error) throw error;
  },

  async delete(id: string): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase.from("programs").delete().eq("id", id);
    if (error) throw error;
  },
};
