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
  email: "lucas@projectmass.app",
  full_name: "Lucas Gateau",
  avatar_url: null,
  created_at: "2024-01-01",
};

export const MOCK_EXERCISES_PUSH: Exercise[] = [
  { id: "e1", workout_id: "w1", name: "Développé couché", muscle_group: "chest", sets: 4, reps: 8, weight: 100, rest_time: 180, order_index: 0 },
  { id: "e2", workout_id: "w1", name: "Développé incliné haltères", muscle_group: "chest", sets: 3, reps: 10, weight: 36, rest_time: 120, order_index: 1 },
  { id: "e3", workout_id: "w1", name: "Élévations latérales", muscle_group: "shoulders", sets: 4, reps: 15, weight: 14, rest_time: 60, order_index: 2 },
  { id: "e4", workout_id: "w1", name: "Développé militaire", muscle_group: "shoulders", sets: 3, reps: 8, weight: 70, rest_time: 150, order_index: 3 },
  { id: "e5", workout_id: "w1", name: "Dips lestés", muscle_group: "triceps", sets: 3, reps: 12, weight: 20, rest_time: 90, order_index: 4 },
  { id: "e6", workout_id: "w1", name: "Extensions triceps câble", muscle_group: "triceps", sets: 3, reps: 15, weight: 35, rest_time: 60, order_index: 5 },
];

export const MOCK_EXERCISES_PULL: Exercise[] = [
  { id: "e7", workout_id: "w2", name: "Tractions lestées", muscle_group: "lats", sets: 4, reps: 8, weight: 15, rest_time: 180, order_index: 0 },
  { id: "e8", workout_id: "w2", name: "Rowing barre", muscle_group: "back", sets: 4, reps: 8, weight: 80, rest_time: 150, order_index: 1 },
  { id: "e9", workout_id: "w2", name: "Tirage poulie haute", muscle_group: "lats", sets: 3, reps: 12, weight: 70, rest_time: 90, order_index: 2 },
  { id: "e10", workout_id: "w2", name: "Curl barre", muscle_group: "biceps", sets: 3, reps: 10, weight: 40, rest_time: 90, order_index: 3 },
  { id: "e11", workout_id: "w2", name: "Curl marteau", muscle_group: "biceps", sets: 3, reps: 12, weight: 18, rest_time: 60, order_index: 4 },
  { id: "e12", workout_id: "w2", name: "Face pull", muscle_group: "traps", sets: 3, reps: 15, weight: 25, rest_time: 60, order_index: 5 },
];

export const MOCK_EXERCISES_LEGS: Exercise[] = [
  { id: "e13", workout_id: "w3", name: "Squat", muscle_group: "quads", sets: 5, reps: 5, weight: 140, rest_time: 240, order_index: 0 },
  { id: "e14", workout_id: "w3", name: "Presse à cuisses", muscle_group: "quads", sets: 3, reps: 10, weight: 200, rest_time: 150, order_index: 1 },
  { id: "e15", workout_id: "w3", name: "Romanian Deadlift", muscle_group: "hamstrings", sets: 3, reps: 10, weight: 90, rest_time: 120, order_index: 2 },
  { id: "e16", workout_id: "w3", name: "Leg curl couché", muscle_group: "hamstrings", sets: 3, reps: 12, weight: 50, rest_time: 90, order_index: 3 },
  { id: "e17", workout_id: "w3", name: "Hip thrust", muscle_group: "glutes", sets: 3, reps: 12, weight: 120, rest_time: 90, order_index: 4 },
  { id: "e18", workout_id: "w3", name: "Mollets debout", muscle_group: "calves", sets: 4, reps: 20, weight: 60, rest_time: 60, order_index: 5 },
];

export const MOCK_WORKOUTS: Workout[] = [
  { id: "w1", program_id: "p1", title: "Push A — Chest & Triceps", workout_type: "push", created_at: "2024-01-15T08:00:00Z", exercises: MOCK_EXERCISES_PUSH },
  { id: "w2", program_id: "p1", title: "Pull A — Back & Biceps", workout_type: "pull", created_at: "2024-01-16T08:00:00Z", exercises: MOCK_EXERCISES_PULL },
  { id: "w3", program_id: "p1", title: "Legs A — Quads & Glutes", workout_type: "legs", created_at: "2024-01-17T08:00:00Z", exercises: MOCK_EXERCISES_LEGS },
  {
    id: "w4", program_id: "p1", title: "Push B — Shoulders Focus", workout_type: "push", created_at: "2024-01-19T08:00:00Z",
    exercises: [
      { id: "e19", workout_id: "w4", name: "Développé militaire", muscle_group: "shoulders", sets: 5, reps: 5, weight: 72.5, rest_time: 180, order_index: 0 },
      { id: "e20", workout_id: "w4", name: "Élévations latérales", muscle_group: "shoulders", sets: 4, reps: 15, weight: 14, rest_time: 60, order_index: 1 },
      { id: "e21", workout_id: "w4", name: "Développé couché incliné", muscle_group: "chest", sets: 4, reps: 10, weight: 80, rest_time: 120, order_index: 2 },
      { id: "e22", workout_id: "w4", name: "Triceps poulie", muscle_group: "triceps", sets: 4, reps: 12, weight: 40, rest_time: 60, order_index: 3 },
    ],
  },
  {
    id: "w5", program_id: "p1", title: "Pull B — Heavy Deadlift", workout_type: "pull", created_at: "2024-01-20T08:00:00Z",
    exercises: [
      { id: "e23", workout_id: "w5", name: "Soulevé de terre", muscle_group: "back", sets: 4, reps: 4, weight: 170, rest_time: 240, order_index: 0 },
      { id: "e24", workout_id: "w5", name: "Tractions", muscle_group: "lats", sets: 4, reps: 8, weight: 15, rest_time: 150, order_index: 1 },
      { id: "e25", workout_id: "w5", name: "Rowing haltère", muscle_group: "back", sets: 3, reps: 10, weight: 50, rest_time: 90, order_index: 2 },
      { id: "e26", workout_id: "w5", name: "Curl EZ", muscle_group: "biceps", sets: 3, reps: 10, weight: 42.5, rest_time: 90, order_index: 3 },
    ],
  },
  {
    id: "w6", program_id: "p1", title: "Legs B — Hamstrings Focus", workout_type: "legs", created_at: "2024-01-21T08:00:00Z",
    exercises: [
      { id: "e27", workout_id: "w6", name: "Squat bulgare", muscle_group: "quads", sets: 4, reps: 10, weight: 40, rest_time: 120, order_index: 0 },
      { id: "e28", workout_id: "w6", name: "Soulevé de terre roumain", muscle_group: "hamstrings", sets: 4, reps: 8, weight: 100, rest_time: 150, order_index: 1 },
      { id: "e29", workout_id: "w6", name: "Leg press", muscle_group: "quads", sets: 3, reps: 12, weight: 180, rest_time: 120, order_index: 2 },
      { id: "e30", workout_id: "w6", name: "Leg curl", muscle_group: "hamstrings", sets: 3, reps: 15, weight: 45, rest_time: 60, order_index: 3 },
    ],
  },
];

export const MOCK_PROGRAMS: Program[] = [
  {
    id: "p1",
    user_id: "mock-user-1",
    title: "PPL — Prise de masse v2",
    type: "mass",
    start_date: "2024-01-15",
    end_date: "2024-04-15",
    start_weight: 78,
    target_weight: 85,
    calories_target: 3200,
    weekly_frequency: 6,
    goal: "Prise de masse propre avec focus sur les mouvements de force. Objectif +7kg en 3 mois.",
    is_active: true,
    created_at: "2024-01-14T10:00:00Z",
    workouts: MOCK_WORKOUTS,
  },
  {
    id: "p2",
    user_id: "mock-user-1",
    title: "5/3/1 Force — Automne",
    type: "strength",
    start_date: "2023-09-01",
    end_date: "2023-12-31",
    start_weight: 76,
    target_weight: 80,
    calories_target: 2800,
    weekly_frequency: 4,
    goal: "Augmenter les 4 mouvements de force principaux.",
    is_active: false,
    created_at: "2023-08-28T10:00:00Z",
  },
  {
    id: "p3",
    user_id: "mock-user-1",
    title: "Summer Cut 2023",
    type: "cut",
    start_date: "2023-05-01",
    end_date: "2023-08-01",
    start_weight: 85,
    target_weight: 76,
    calories_target: 2200,
    weekly_frequency: 5,
    goal: "Sèche pour l'été, garder un maximum de muscle.",
    is_active: false,
    created_at: "2023-04-28T10:00:00Z",
  },
];

export const MOCK_BODYWEIGHT: BodyweightLog[] = [
  { id: "bw1", user_id: "mock-user-1", weight: 78.0, created_at: "2024-01-15T07:00:00Z" },
  { id: "bw2", user_id: "mock-user-1", weight: 78.4, created_at: "2024-01-16T07:00:00Z" },
  { id: "bw3", user_id: "mock-user-1", weight: 78.2, created_at: "2024-01-17T07:00:00Z" },
  { id: "bw4", user_id: "mock-user-1", weight: 78.6, created_at: "2024-01-19T07:00:00Z" },
  { id: "bw5", user_id: "mock-user-1", weight: 78.9, created_at: "2024-01-22T07:00:00Z" },
  { id: "bw6", user_id: "mock-user-1", weight: 79.1, created_at: "2024-01-24T07:00:00Z" },
  { id: "bw7", user_id: "mock-user-1", weight: 79.0, created_at: "2024-01-26T07:00:00Z" },
  { id: "bw8", user_id: "mock-user-1", weight: 79.4, created_at: "2024-01-29T07:00:00Z" },
  { id: "bw9", user_id: "mock-user-1", weight: 79.6, created_at: "2024-01-31T07:00:00Z" },
  { id: "bw10", user_id: "mock-user-1", weight: 79.8, created_at: "2024-02-02T07:00:00Z" },
  { id: "bw11", user_id: "mock-user-1", weight: 80.1, created_at: "2024-02-05T07:00:00Z" },
  { id: "bw12", user_id: "mock-user-1", weight: 80.3, created_at: "2024-02-07T07:00:00Z" },
  { id: "bw13", user_id: "mock-user-1", weight: 80.5, created_at: "2024-02-09T07:00:00Z" },
  { id: "bw14", user_id: "mock-user-1", weight: 80.2, created_at: "2024-02-12T07:00:00Z" },
  { id: "bw15", user_id: "mock-user-1", weight: 80.7, created_at: "2024-02-14T07:00:00Z" },
  { id: "bw16", user_id: "mock-user-1", weight: 81.0, created_at: "2024-02-16T07:00:00Z" },
  { id: "bw17", user_id: "mock-user-1", weight: 81.2, created_at: "2024-02-19T07:00:00Z" },
  { id: "bw18", user_id: "mock-user-1", weight: 81.5, created_at: "2024-02-21T07:00:00Z" },
];

export const MOCK_PERSONAL_RECORDS: PersonalRecord[] = [
  { exercise_name: "Développé couché", weight: 105, reps: 3, date: "2024-02-14", is_new: true },
  { exercise_name: "Squat", weight: 147.5, reps: 3, date: "2024-02-21", is_new: true },
  { exercise_name: "Soulevé de terre", weight: 175, reps: 2, date: "2024-02-19", is_new: false },
  { exercise_name: "Développé militaire", weight: 75, reps: 5, date: "2024-02-16", is_new: false },
  { exercise_name: "Tractions lestées", weight: 20, reps: 8, date: "2024-02-12", is_new: false },
];

export const MOCK_WEEKLY_STATS: WeeklyStats[] = [
  { week: "S1", sessions: 5, volume: 18400, avg_weight: 78.3 },
  { week: "S2", sessions: 6, volume: 21200, avg_weight: 78.9 },
  { week: "S3", sessions: 4, volume: 16800, avg_weight: 79.4 },
  { week: "S4", sessions: 6, volume: 22100, avg_weight: 79.9 },
  { week: "S5", sessions: 5, volume: 20500, avg_weight: 80.4 },
  { week: "S6", sessions: 6, volume: 23800, avg_weight: 80.9 },
  { week: "S7", sessions: 6, volume: 24200, avg_weight: 81.3 },
];

export const MOCK_PERFORMANCE_DATA = [
  { date: "Jan", bench: 90, squat: 120, deadlift: 150, ohp: 62.5 },
  { date: "Fév", bench: 95, squat: 127.5, deadlift: 155, ohp: 65 },
  { date: "Mar", bench: 100, squat: 135, deadlift: 162.5, ohp: 67.5 },
  { date: "Avr", bench: 105, squat: 142.5, deadlift: 170, ohp: 72.5 },
  { date: "Mai", bench: 105, squat: 147.5, deadlift: 175, ohp: 75 },
];

export const MOCK_AI_CONVERSATIONS: AiConversation[] = [
  {
    id: "ai1",
    user_id: "mock-user-1",
    role: "assistant",
    message: "👋 Bonjour ! Je suis ton coach IA. Je peux analyser ta progression, adapter tes programmes et répondre à toutes tes questions sur l'entraînement. Comment puis-je t'aider aujourd'hui ?",
    created_at: "2024-02-21T10:00:00Z",
  },
  {
    id: "ai2",
    user_id: "mock-user-1",
    role: "user",
    message: "Analyse ma progression sur le banc ces dernières semaines",
    created_at: "2024-02-21T10:01:00Z",
  },
  {
    id: "ai3",
    user_id: "mock-user-1",
    role: "assistant",
    message: "Excellente progression sur le développé couché ! 💪 Tu es passé de 90kg à 105kg en 5 semaines, soit +15kg (+16.7%). C'est une progression remarquable.\n\n**Points clés :**\n- Progression linéaire très saine (+2.5 à 5kg/semaine)\n- Nouveau PR cette semaine à 105kg × 3 reps\n- Ton 1RM estimé est ~130kg\n\n**Recommandation :** Continue avec les micro-charges de +2.5kg. À ce rythme, tu pourrais atteindre les 110kg d'ici 2-3 semaines.",
    created_at: "2024-02-21T10:01:30Z",
  },
];

export const EXERCISES_LIBRARY = [
  { name: "Développé couché", muscle_group: "chest" },
  { name: "Développé incliné haltères", muscle_group: "chest" },
  { name: "Développé décliné", muscle_group: "chest" },
  { name: "Écarté couché", muscle_group: "chest" },
  { name: "Pompes lestées", muscle_group: "chest" },
  { name: "Développé militaire", muscle_group: "shoulders" },
  { name: "Élévations latérales", muscle_group: "shoulders" },
  { name: "Élévations frontales", muscle_group: "shoulders" },
  { name: "Oiseau", muscle_group: "shoulders" },
  { name: "Tractions lestées", muscle_group: "lats" },
  { name: "Tirage poulie haute", muscle_group: "lats" },
  { name: "Rowing barre", muscle_group: "back" },
  { name: "Rowing haltère", muscle_group: "back" },
  { name: "Soulevé de terre", muscle_group: "back" },
  { name: "Hyperextension", muscle_group: "back" },
  { name: "Face pull", muscle_group: "traps" },
  { name: "Shrug barre", muscle_group: "traps" },
  { name: "Curl barre", muscle_group: "biceps" },
  { name: "Curl haltères", muscle_group: "biceps" },
  { name: "Curl marteau", muscle_group: "biceps" },
  { name: "Curl EZ", muscle_group: "biceps" },
  { name: "Dips lestés", muscle_group: "triceps" },
  { name: "Extension triceps câble", muscle_group: "triceps" },
  { name: "Skull crusher", muscle_group: "triceps" },
  { name: "Squat", muscle_group: "quads" },
  { name: "Squat bulgare", muscle_group: "quads" },
  { name: "Leg press", muscle_group: "quads" },
  { name: "Leg extension", muscle_group: "quads" },
  { name: "Romanian Deadlift", muscle_group: "hamstrings" },
  { name: "Leg curl couché", muscle_group: "hamstrings" },
  { name: "Hip thrust", muscle_group: "glutes" },
  { name: "Fentes", muscle_group: "glutes" },
  { name: "Mollets debout", muscle_group: "calves" },
  { name: "Crunch", muscle_group: "abs" },
  { name: "Gainage", muscle_group: "abs" },
  { name: "Crunch câble", muscle_group: "abs" },
];
