export type ProgramType = "mass" | "cut" | "strength" | "maintenance" | "recomposition";

export type WorkoutType = "push" | "pull" | "legs" | "upper" | "lower" | "full" | "cardio";

export type MuscleGroup =
  | "chest"
  | "back"
  | "shoulders"
  | "biceps"
  | "triceps"
  | "forearms"
  | "quads"
  | "hamstrings"
  | "glutes"
  | "calves"
  | "abs"
  | "traps"
  | "lats";

export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
}

export interface Program {
  id: string;
  user_id: string;
  title: string;
  type: ProgramType;
  start_date: string;
  end_date?: string;
  start_weight?: number;
  target_weight?: number;
  calories_target?: number;
  weekly_frequency: number;
  goal?: string;
  is_active: boolean;
  created_at: string;
  workouts?: Workout[];
}

export interface Workout {
  id: string;
  program_id: string;
  title: string;
  workout_type: WorkoutType;
  created_at: string;
  exercises?: Exercise[];
  logs?: WorkoutLog[];
}

export interface Exercise {
  id: string;
  workout_id: string;
  name: string;
  muscle_group: MuscleGroup;
  sets: number;
  reps: number;
  weight: number;
  rest_time: number;
  order_index: number;
  notes?: string;
}

export interface WorkoutLog {
  id: string;
  user_id: string;
  workout_id: string;
  exercise_name: string;
  performed_weight: number;
  performed_reps: number;
  set_number: number;
  completed: boolean;
  created_at: string;
}

export interface ActiveSet {
  exercise_id: string;
  exercise_name: string;
  set_number: number;
  weight: number;
  reps: number;
  completed: boolean;
}

export interface BodyweightLog {
  id: string;
  user_id: string;
  weight: number;
  created_at: string;
}

export interface ProgressPhoto {
  id: string;
  user_id: string;
  image_url: string;
  note?: string;
  created_at: string;
}

export interface AiConversation {
  id: string;
  user_id: string;
  role: "user" | "assistant";
  message: string;
  created_at: string;
}

export interface PersonalRecord {
  exercise_name: string;
  weight: number;
  reps: number;
  date: string;
  is_new?: boolean;
}

export interface WeeklyStats {
  week: string;
  sessions: number;
  volume: number;
  avg_weight: number;
}

export interface DashboardStats {
  current_program?: Program;
  current_weight?: number;
  target_weight?: number;
  sessions_this_week: number;
  weekly_frequency: number;
  streak: number;
  recent_prs: PersonalRecord[];
  weight_trend: BodyweightLog[];
  weekly_stats: WeeklyStats[];
}
