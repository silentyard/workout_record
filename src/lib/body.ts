import { supabase } from './supabase';
import type { Body, CreateBodyInput, UpdateBodyInput } from '../types/workout';

/**
 * Create a new body part (e.g. "Chest", "Back").
 * Returns the created row.
 */
export async function createBody(input: CreateBodyInput): Promise<Body> {
  const { data, error } = await supabase
    .from('body')
    .insert({ name: input.name.trim() })
    .select()
    .single();

  if (error) throw new Error(`createBody failed: ${error.message}`);
  return data as Body;
}

/**
 * List all body parts, ordered alphabetically.
 */
export async function listBodies(): Promise<Body[]> {
  const { data, error } = await supabase
    .from('body')
    .select('*')
    .order('name', { ascending: true });

  if (error) throw new Error(`listBodies failed: ${error.message}`);
  return (data ?? []) as Body[];
}

/**
 * Update a body part by ID.
 */
export async function updateBody(id: string, input: UpdateBodyInput): Promise<Body> {
  const updates: Record<string, unknown> = {};
  if (input.name !== undefined) updates.name = input.name.trim();

  const { data, error } = await supabase
    .from('body')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(`updateBody failed: ${error.message}`);
  return data as Body;
}

/**
 * Delete a body part by ID. Cascades to exercises.
 */
export async function deleteBody(id: string): Promise<void> {
  const { error } = await supabase
    .from('body')
    .delete()
    .eq('id', id);

  if (error) throw new Error(`deleteBody failed: ${error.message}`);
}
