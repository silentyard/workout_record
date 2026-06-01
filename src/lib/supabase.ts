import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'Missing Supabase environment variables: SUPABASE_URL and SUPABASE_ANON_KEY are required.'
  );
}

/**
 * Server-side Supabase client.
 * This module must NOT be imported from client components.
 */
export const supabase = createClient(supabaseUrl, supabaseKey);
