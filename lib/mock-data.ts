import type {
  Program,
  Workout,
  Exercise,
  BodyweightLog,
  PersonalRecord,
  WeeklyStats,
  AiConversation,
} from "@/types";

export const MOCK_USER = {
  id: "mock-user-1",
  email: "gateau.lucass@gmail.com",
  full_name: "Lucas Gateau",
  avatar_url: null,
  created_at: "2026-02-03",
};

// --- Exercices Mai 2026 (charges actuelles) ---

export const MOCK_EXERCISES_PUSH: Exercise[] = [
  { id: "e1", workout_id: "w1", name: "Developpe incline barre", muscle_group: "chest", sets: 4, reps: 6, weight: 30, rest_time: 180, order_index: 0 },
  { id: "e2", workout_id: "w1", name: "Butterfly", muscle_group: "chest", sets: 4, reps: 6, weight: 86, rest_time: 120, order_index: 1 },
  { id: "e3", workout_id: "w1", name: "Developpe militaire", muscle_group: "shoulders", sets: 4, reps: 8, weight: 24, rest_time: 150, order_index: 2 },
  { id: "e4", workout_id: "w1", name: "Elevation laterale", muscle_group: "shoulders", sets: 3, reps: 15, weight: 12, rest_time: 60, order_index: 3 },
  { id: "e5", workout_id: "w1", name: "Dips barre parallele", muscle_group: "triceps", sets: 4, reps: 10, weight: 25, rest_time: 120, order_index: 4 },
  { id: "e6", workout_id: "w1", name: "Extension triceps corde", muscle_group: "triceps", sets: 4, reps: 10, weight: 25, rest_time: 60, order_index: 5 },
];

export const MOCK_EXERCISES_PULL: Exercise[] = [
  { id: "e7", workout_id: "w2", name: "Tractions / tirage vertical", muscle_group: "lats", sets: 4, reps: 8, weight: 66, rest_time: 180, order_index: 0 },
  { id: "e8", workout_id: "w2", name: "Rowing barre", muscle_group: "back", sets: 4, reps: 8, weight: 45, rest_time: 150, order_index: 1 },
  { id: "e9", workout_id: "w2", name: "Tirage horizontal", muscle_group: "back", sets: 4, reps: 8, weight: 59, rest_time: 120, order_index: 2 },
  { id: "e10", workout_id: "w2", name: "Face pull", muscle_group: "shoulders", sets: 3, reps: 15, weight: 40, rest_time: 60, order_index: 3 },
  { id: "e11", workout_id: "w2", name: "Curl marteau", muscle_group: "biceps", sets: 3, reps: 10, weight: 14, rest_time: 90, order_index: 4 },
  { id: "e12", workout_id: "w2", name: "Curl incline halteres", muscle_group: "biceps", sets: 3, reps: 10, weight: 14, rest_time: 60, order_index: 5 },
];

export const MOCK_EXERCISES_LEGS: Exercise[] = [
  { id: "e13", workout_id: "w3", name: "Squat", muscle_group: "quads", sets: 4, reps: 8, weight: 80, rest_time: 240, order_index: 0 },
  { id: "e14", workout_id: "w3", name: "Presse a cuisses", muscle_group: "quads", sets: 4, reps: 10, weight: 85, rest_time: 150, order_index: 1 },
  { id: "e15", workout_id: "w3", name: "Leg curl", muscle_group: "hamstrings", sets: 4, reps: 10, weight: 70, rest_time: 120, order_index: 2 },
  { id: "e16", workout_id: "w3", name: "Leg extensions", muscle_group: "quads", sets: 4, reps: 10, weight: 76, rest_time: 90, order_index: 3 },
  { id: "e17", workout_id: "w3", name: "Mollets", muscle_group: "calves", sets: 4, reps: 15, weight: 20, rest_time: 60, order_index: 4 },
  { id: "e18", workout_id: "w3", name: "Gainage", muscle_group: "abs", sets: 3, reps: 1, weight: 0, rest_time: 60, order_index: 5 },
];

export const MOCK_WORKOUTS: Workout[] = [
  {
    id: "w1",
    program_id: "p1",
    title: "Push — Pecs / Epaules / Triceps",
    workout_type: "push",
    created_at: "2026-04-01T08:00:00Z",
    exercises: MOCK_EXERCISES_PUSH,
  },
  {
    id: "w2",
    program_id: "p1",
    title: "Pull — Dos / Biceps",
    workout_type: "pull",
    created_at: "2026-04-02T08:00:00Z",
    exercises: MOCK_EXERCISES_PULL,
  },
  {
    id: "w3",
    program_id: "p1",
    title: "Legs — Quadriceps / Ischios",
    workout_type: "legs",
    created_at: "2026-04-03T08:00:00Z",
    exercises: MOCK_EXERCISES_LEGS,
  },
];

export const MOCK_PROGRAMS: Program[] = [
  {
    id: "p1",
    user_id: "mock-user-1",
    title: "PPL Mass — Avril a Juillet",
    type: "mass",
    start_date: "2026-04-01",
    end_date: "2026-07-31",
    start_weight: 85,
    target_weight: 93,
    calories_target: 3400,
    weekly_frequency: 5,
    goal: "Prise de masse — plus de volume, plus de stress musculaire, plus de masse visuelle.",
    is_active: true,
    created_at: "2026-04-01T10:00:00Z",
    workouts: MOCK_WORKOUTS,
  },
  {
    id: "p2",
    user_id: "mock-user-1",
    title: "Full Body — Reprise (Fev-Mars)",
    type: "mass",
    start_date: "2026-02-03",
    end_date: "2026-03-31",
    start_weight: 78,
    target_weight: 85,
    calories_target: 3000,
    weekly_frequency: 3,
    goal: "Base solide. Force + volume. Meilleure reprise = meilleure prise de poids.",
    is_active: false,
    created_at: "2026-02-01T10:00:00Z",
  },
];

// Historique reel : reprise Fevrier → PPL Mai
export const MOCK_BODYWEIGHT: BodyweightLog[] = [
  { id: "bw1",  user_id: "mock-user-1", weight: 78.0, created_at: "2026-02-03T07:00:00Z" },
  { id: "bw2",  user_id: "mock-user-1", weight: 79.2, created_at: "2026-02-10T07:00:00Z" },
  { id: "bw3",  user_id: "mock-user-1", weight: 80.0, created_at: "2026-02-17T07:00:00Z" },
  { id: "bw4",  user_id: "mock-user-1", weight: 81.0, created_at: "2026-02-24T07:00:00Z" },
  { id: "bw5",  user_id: "mock-user-1", weight: 83.0, created_at: "2026-03-03T07:00:00Z" },
  { id: "bw6",  user_id: "mock-user-1", weight: 84.0, created_at: "2026-03-10T07:00:00Z" },
  { id: "bw7",  user_id: "mock-user-1", weight: 84.0, created_at: "2026-03-17T07:00:00Z" },
  { id: "bw8",  user_id: "mock-user-1", weight: 85.0, created_at: "2026-03-24T07:00:00Z" },
  { id: "bw9",  user_id: "mock-user-1", weight: 85.0, created_at: "2026-04-01T07:00:00Z" },
  { id: "bw10", user_id: "mock-user-1", weight: 86.0, created_at: "2026-04-07T07:00:00Z" },
  { id: "bw11", user_id: "mock-user-1", weight: 87.0, created_at: "2026-04-14T07:00:00Z" },
  { id: "bw12", user_id: "mock-user-1", weight: 87.0, created_at: "2026-04-21T07:00:00Z" },
  { id: "bw13", user_id: "mock-user-1", weight: 87.0, created_at: "2026-04-28T07:00:00Z" },
  { id: "bw14", user_id: "mock-user-1", weight: 88.8, created_at: "2026-05-05T07:00:00Z" },
  { id: "bw15", user_id: "mock-user-1", weight: 90.0, created_at: "2026-05-12T07:00:00Z" },
];

export const MOCK_PERSONAL_RECORDS: PersonalRecord[] = [
  { exercise_name: "Squat", weight: 90, reps: 6, date: "2026-04-01", is_new: false },
  { exercise_name: "Tractions / tirage vertical", weight: 66, reps: 8, date: "2026-04-14", is_new: true },
  { exercise_name: "Rowing barre", weight: 45, reps: 8, date: "2026-05-05", is_new: true },
  { exercise_name: "Butterfly", weight: 86, reps: 6, date: "2026-05-05", is_new: true },
  { exercise_name: "Presse a cuisses", weight: 85, reps: 10, date: "2026-05-12", is_new: true },
];

export const MOCK_WEEKLY_STATS: WeeklyStats[] = [
  { week: "Fev S1", sessions: 3, volume: 12400, avg_weight: 78.6 },
  { week: "Fev S2", sessions: 3, volume: 13100, avg_weight: 79.5 },
  { week: "Mar S1", sessions: 3, volume: 13800, avg_weight: 81.5 },
  { week: "Mar S2", sessions: 3, volume: 14200, avg_weight: 83.5 },
  { week: "Avr S1", sessions: 4, volume: 16800, avg_weight: 85.5 },
  { week: "Avr S2", sessions: 5, volume: 19200, avg_weight: 86.5 },
  { week: "Mai S1", sessions: 5, volume: 20400, avg_weight: 87.9 },
];

export const MOCK_PERFORMANCE_DATA = [
  { date: "Fev", squat: 70, tirage: 55, rowing: 35, presse: 60 },
  { date: "Mar", squat: 80, tirage: 60, rowing: 40, presse: 70 },
  { date: "Avr", squat: 90, tirage: 66, rowing: 45, presse: 80 },
  { date: "Mai", squat: 90, tirage: 66, rowing: 45, presse: 85 },
];

export const MOCK_AI_CONVERSATIONS: AiConversation[] = [];

export const EXERCISES_LIBRARY = [
  { name: "Developpe couche", muscle_group: "chest" },
  { name: "Developpe incline barre", muscle_group: "chest" },
  { name: "Developpe incline halteres", muscle_group: "chest" },
  { name: "Butterfly", muscle_group: "chest" },
  { name: "Developpe militaire", muscle_group: "shoulders" },
  { name: "Elevation laterale", muscle_group: "shoulders" },
  { name: "Face pull", muscle_group: "shoulders" },
  { name: "Tractions / tirage vertical", muscle_group: "lats" },
  { name: "Tirage horizontal", muscle_group: "back" },
  { name: "Rowing barre", muscle_group: "back" },
  { name: "Rowing haltere", muscle_group: "back" },
  { name: "Souleve de terre", muscle_group: "back" },
  { name: "Curl barre", muscle_group: "biceps" },
  { name: "Curl marteau", muscle_group: "biceps" },
  { name: "Curl incline halteres", muscle_group: "biceps" },
  { name: "Dips barre parallele", muscle_group: "triceps" },
  { name: "Extension triceps corde", muscle_group: "triceps" },
  { name: "Skull crusher", muscle_group: "triceps" },
  { name: "Squat", muscle_group: "quads" },
  { name: "Presse a cuisses", muscle_group: "quads" },
  { name: "Leg extensions", muscle_group: "quads" },
  { name: "Leg curl", muscle_group: "hamstrings" },
  { name: "Souleve de terre roumain", muscle_group: "hamstrings" },
  { name: "Mollets", muscle_group: "calves" },
  { name: "Gainage", muscle_group: "abs" },
  { name: "Crunch cable", muscle_group: "abs" },
];
