export interface BodyPart {
  id: string;
  name: string;
}

export interface Exercise {
  id: string;
  name: string;
  bodyPartId: string;
  imageUrl?: string;
}

export interface SetConfig {
  weight: number;
  reps: number;
  sets: number;
}

export interface WorkoutRecord {
  id: string;
  date: string; // YYYY-MM-DD
  exerciseId: string;
  configs: SetConfig[];
}

export interface DatabaseSchema {
  bodyParts: BodyPart[];
  exercises: Exercise[];
  records: WorkoutRecord[];
}
