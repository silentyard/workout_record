import { supabase } from './supabase';
import type { Exercise, CreateExerciseInput } from '../types/workout';

/**
 * Create a new exercise.
 * If the exercise has an image, upload it to Vercel Blob first and pass
 * the resulting URL as `image_url` in the input.
 */
export async function createExercise(input: CreateExerciseInput): Promise<Exercise> {
  const { data, error } = await supabase
    .from('exercise')
    .insert({
      name: input.name.trim(),
      body_id: input.body_id,
      image_url: input.image_url ?? null,
    })
    .select()
    .single();

  if (error) throw new Error(`createExercise failed: ${error.message}`);
  return data as Exercise;
}

/**
 * List all exercises, ordered alphabetically.
 */
export async function listExercises(): Promise<Exercise[]> {
  const { data, error } = await supabase
    .from('exercise')
    .select('*')
    .order('name', { ascending: true });

  if (error) throw new Error(`listExercises failed: ${error.message}`);
  return (data ?? []) as Exercise[];
}

/**
 * List exercises that belong to a specific body part.
 */
export async function listExercisesByBody(bodyId: string): Promise<Exercise[]> {
  const { data, error } = await supabase
    .from('exercise')
    .select('*')
    .eq('body_id', bodyId)
    .order('name', { ascending: true });

  if (error) throw new Error(`listExercisesByBody failed: ${error.message}`);
  return (data ?? []) as Exercise[];
}
