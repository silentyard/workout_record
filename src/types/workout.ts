// ─── Row types (match Supabase column names) ──────────────────────────────────

export interface Body {
  id: string;
  name: string;
  created_at: string;
}

export interface Exercise {
  id: string;
  name: string;
  body_id: string;
  image_url?: string | null;
  created_at: string;
}

/** One set in a workout: weight (kg/lb), number of reps, number of sets */
export interface SetConfig {
  weight: number;
  reps: number;
  sets: number;
}

export interface WorkoutRecord {
  id: string;
  date: string; // ISO date string, e.g. "2026-06-01"
  exercise_id: string;
  configs: SetConfig[];
  notes?: string | null;
  created_at: string;
}

// ─── Input / creation types ────────────────────────────────────────────────────

export interface CreateBodyInput {
  name: string;
}

export interface CreateExerciseInput {
  name: string;
  body_id: string;
  image_url?: string; // Vercel Blob URL — resolved before calling createExercise
}

export interface CreateWorkoutRecordInput {
  date: string; // YYYY-MM-DD
  exercise_id: string;
  configs: SetConfig[];
  notes?: string;
}

// ─── Update / partial-update types ─────────────────────────────────────────────

export interface UpdateBodyInput {
  name?: string;
}

export interface UpdateExerciseInput {
  name?: string;
  body_id?: string;
  image_url?: string | null;
}

export interface UpdateWorkoutRecordInput {
  date?: string;
  exercise_id?: string;
  configs?: SetConfig[];
  notes?: string | null;
}
