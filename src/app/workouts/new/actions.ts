'use server';

import { revalidatePath } from 'next/cache';
import { listBodies } from '@/lib/body';
import { listExercisesByBody, listExercises } from '@/lib/exercise';
import { createWorkoutRecord } from '@/lib/workoutRecord';
import type { SetConfig } from '@/types/workout';

export async function getBodyParts() {
  return listBodies();
}

export async function getExercises(bodyId?: string) {
  if (bodyId) return listExercisesByBody(bodyId);
  return listExercises();
}


export async function addWorkoutRecord(data: {
  date: string;
  exerciseId: string;
  configs: SetConfig[];
  notes?: string;
}) {
  if (!data.date || !data.exerciseId || !data.configs.length) {
    return { error: 'Incomplete data' };
  }

  try {
    await createWorkoutRecord({
      date: data.date,
      exercise_id: data.exerciseId,
      configs: data.configs,
      notes: data.notes,
    });
    revalidatePath('/workouts/new');
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return { error: message };
  }
}
