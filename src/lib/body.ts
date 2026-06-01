import { supabase } from './supabase';
import type { Body, CreateBodyInput } from '../types/workout';

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
