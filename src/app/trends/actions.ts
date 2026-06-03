'use server';

import { listWorkoutRecordsByDateRange } from '@/lib/workoutRecord';
import { listExercises } from '@/lib/exercise';
import { listBodies } from '@/lib/body';
import type { WorkoutRecord, Exercise, Body } from '@/types/workout';

export interface TrendsData {
  records: WorkoutRecord[];
  exercises: Exercise[];
  bodies: Body[];
}

/**
 * Fetch all data needed for the trends page.
 * Records are fetched for the full history; date filtering happens client-side
 * for instant interactivity without round-trips.
 */
export async function getTrendsData(): Promise<TrendsData> {
  const [records, exercises, bodies] = await Promise.all([
    listWorkoutRecordsByDateRange(), // no range → all records
    listExercises(),
    listBodies(),
  ]);
  return { records, exercises, bodies };
}
