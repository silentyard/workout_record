import { createClient } from './supabase/server';
import type { WorkoutRecord, CreateWorkoutRecordInput, UpdateWorkoutRecordInput } from '../types/workout';

/**
 * Create a new workout record for the authenticated user.
 */
export async function createWorkoutRecord(
  input: CreateWorkoutRecordInput
): Promise<WorkoutRecord> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('createWorkoutRecord: not authenticated');

  const { data, error } = await supabase
    .from('workout_record')
    .insert({
      date: input.date,
      exercise_id: input.exercise_id,
      configs: input.configs,
      notes: input.notes ?? null,
      user_id: user.id,
    })
    .select()
    .single();

  if (error) throw new Error(`createWorkoutRecord failed: ${error.message}`);
  return data as WorkoutRecord;
}

/**
 * List all workout records for the current user, most recent first.
 * RLS automatically filters to the current user.
 */
export async function listWorkoutRecords(): Promise<WorkoutRecord[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('workout_record')
    .select('*')
    .order('date', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) throw new Error(`listWorkoutRecords failed: ${error.message}`);
  return (data ?? []) as WorkoutRecord[];
}

/**
 * List all workout records within a date range (inclusive), oldest first.
 * If from/to are omitted the range is open-ended.
 */
export async function listWorkoutRecordsByDateRange(
  from?: string, // YYYY-MM-DD
  to?: string    // YYYY-MM-DD
): Promise<WorkoutRecord[]> {
  const supabase = await createClient();
  let query = supabase
    .from('workout_record')
    .select('*')
    .order('date', { ascending: true })
    .order('created_at', { ascending: true });

  if (from) query = query.gte('date', from);
  if (to)   query = query.lte('date', to);

  const { data, error } = await query;
  if (error) throw new Error(`listWorkoutRecordsByDateRange failed: ${error.message}`);
  return (data ?? []) as WorkoutRecord[];
}

/**
 * List all workout records for a specific exercise (current user only via RLS).
 */
export async function listWorkoutRecordsByExercise(
  exerciseId: string
): Promise<WorkoutRecord[]> {
  const supabase = await createClient();
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
 * Update a workout record by ID (RLS enforces ownership).
 */
export async function updateWorkoutRecord(
  id: string,
  input: UpdateWorkoutRecordInput
): Promise<WorkoutRecord> {
  const supabase = await createClient();
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
  const supabase = await createClient();
  const { error } = await supabase
    .from('workout_record')
    .delete()
    .eq('id', id);

  if (error) throw new Error(`deleteWorkoutRecord failed: ${error.message}`);
}
