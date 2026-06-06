import { createBrowserClient } from '@supabase/ssr';

/**
 * Browser-side Supabase client (Client Components only).
 * Used for auth operations that must run in the browser:
 *   - signInWithPassword / signUp / signOut
 *
 * OAuth-ready: to add a provider in future, call:
 *   supabase.auth.signInWithOAuth({ provider: 'google',
 *     options: { redirectTo: `${location.origin}/auth/callback` } })
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
