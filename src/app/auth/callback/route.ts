import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * OAuth / email-confirmation callback handler.
 *
 * Supabase redirects here after:
 *   - Email confirmation link clicks
 *   - Future OAuth flows (Google, GitHub, etc.)
 *
 * Exchanges the one-time `code` for a session cookie, then
 * redirects the user to the home page (or a `next` param if provided).
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Exchange failed — redirect to login with an error indicator
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
