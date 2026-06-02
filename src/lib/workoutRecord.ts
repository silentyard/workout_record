import { supabase } from './supabase';
import type { WorkoutRecord, CreateWorkoutRecordInput, UpdateWorkoutRecordInput } from '../types/workout';

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

/**
 * Update a workout record by ID.
 */
export async function updateWorkoutRecord(
  id: string,
  input: UpdateWorkoutRecordInput
): Promise<WorkoutRecord> {
  const updates: Record<string, unknown> = {};
  if (input.date !== undefined) updates.date = input.date;
  if (input.exercise_id !== undefined) updates.exercise_id = input.exercise_id;
  if (input.configs !== undefined) updates.configs = input.configs;
  if (input.notes !== undefined) updates.notes = input.notes;

  const { data, error } = await supabase
    .from('workout_record')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(`updateWorkoutRecord failed: ${error.message}`);
  return data as WorkoutRecord;
}

/**
 * Delete a workout record by ID.
 */
export async function deleteWorkoutRecord(id: string): Promise<void> {
  const { error } = await supabase
    .from('workout_record')
    .delete()
    .eq('id', id);

  if (error) throw new Error(`deleteWorkoutRecord failed: ${error.message}`);
}
