import { createClient } from './supabase/server';
import type { Body, CreateBodyInput, UpdateBodyInput } from '../types/workout';

/**
 * Create a new body part for the authenticated user.
 */
export async function createBody(input: CreateBodyInput): Promise<Body> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('createBody: not authenticated');

  const { data, error } = await supabase
    .from('body')
    .insert({ name: input.name.trim(), user_id: user.id })
    .select()
    .single();

  if (error) throw new Error(`createBody failed: ${error.message}`);
  return data as Body;
}

/**
 * List all body parts for the authenticated user, ordered alphabetically.
 * RLS automatically filters to the current user — no explicit where needed.
 */
export async function listBodies(): Promise<Body[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('body')
    .select('*')
    .order('name', { ascending: true });

  if (error) throw new Error(`listBodies failed: ${error.message}`);
  return (data ?? []) as Body[];
}

/**
 * Update a body part by ID (user can only update their own via RLS).
 */
export async function updateBody(id: string, input: UpdateBodyInput): Promise<Body> {
  const supabase = await createClient();
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
  const supabase = await createClient();
  const { error } = await supabase
    .from('body')
    .delete()
    .eq('id', id);

  if (error) throw new Error(`deleteBody failed: ${error.message}`);
}
