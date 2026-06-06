import { createClient } from './supabase/server';
import type { Exercise, CreateExerciseInput, UpdateExerciseInput } from '../types/workout';

/**
 * Create a new exercise for the authenticated user.
 * If the exercise has an image, upload it to Vercel Blob first and pass
 * the resulting URL as `image_url` in the input.
 */
export async function createExercise(input: CreateExerciseInput): Promise<Exercise> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('createExercise: not authenticated');

  const { data, error } = await supabase
    .from('exercise')
    .insert({
      name: input.name.trim(),
      body_id: input.body_id,
      image_url: input.image_url ?? null,
      user_id: user.id,
    })
    .select()
    .single();

  if (error) throw new Error(`createExercise failed: ${error.message}`);
  return data as Exercise;
}

/**
 * List all exercises for the current user, ordered alphabetically.
 * RLS automatically filters to the current user.
 */
export async function listExercises(): Promise<Exercise[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('exercise')
    .select('*')
    .order('name', { ascending: true });

  if (error) throw new Error(`listExercises failed: ${error.message}`);
  return (data ?? []) as Exercise[];
}

/**
 * List exercises that belong to a specific body part (current user only via RLS).
 */
export async function listExercisesByBody(bodyId: string): Promise<Exercise[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('exercise')
    .select('*')
    .eq('body_id', bodyId)
    .order('name', { ascending: true });

  if (error) throw new Error(`listExercisesByBody failed: ${error.message}`);
  return (data ?? []) as Exercise[];
}

/**
 * Update an exercise by ID (RLS enforces ownership).
 */
export async function updateExercise(id: string, input: UpdateExerciseInput): Promise<Exercise> {
  const supabase = await createClient();
  const updates: Record<string, unknown> = {};
  if (input.name !== undefined) updates.name = input.name.trim();
  if (input.body_id !== undefined) updates.body_id = input.body_id;
  if (input.image_url !== undefined) updates.image_url = input.image_url;

  const { data, error } = await supabase
    .from('exercise')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(`updateExercise failed: ${error.message}`);
  return data as Exercise;
}

/**
 * Delete an exercise by ID. Cascades to workout records.
 */
export async function deleteExercise(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from('exercise')
    .delete()
    .eq('id', id);

  if (error) throw new Error(`deleteExercise failed: ${error.message}`);
}
