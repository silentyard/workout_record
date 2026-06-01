import { supabase } from './supabase';
import type { WorkoutRecord, CreateWorkoutRecordInput } from '../types/workout';

/**
 * Create a new workout record for a given exercise.
 */
export async function createWorkoutRecord(
  input: CreateWorkoutRecordInput
): Promise<WorkoutRecord> {
  const { data, error } = await supabase
    .from('workout_record')
    .insert({
      date: input.date,
      exercise_id: input.exercise_id,
      configs: input.configs,
      notes: input.notes ?? null,
    })
    .select()
    .single();

  if (error) throw new Error(`createWorkoutRecord failed: ${error.message}`);
  return data as WorkoutRecord;
}

/**
 * List all workout records, most recent first.
 */
export async function listWorkoutRecords(): Promise<WorkoutRecord[]> {
  const { data, error } = await supabase
    .from('workout_record')
    .select('*')
    .order('date', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) throw new Error(`listWorkoutRecords failed: ${error.message}`);
  return (data ?? []) as WorkoutRecord[];
}

/**
 * List all workout records for a specific exercise, most recent first.
 */
export async function listWorkoutRecordsByExercise(
  exerciseId: string
): Promise<WorkoutRecord[]> {
  const { data, error } = await supabase
    .from('workout_record')
    .select('*')
    .eq('exercise_id', exerciseId)
    .order('date', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) throw new Error(`listWorkoutRecordsByExercise failed: ${error.message}`);
  return (data ?? []) as WorkoutRecord[];
}
