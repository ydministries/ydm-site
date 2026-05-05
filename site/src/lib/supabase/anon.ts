import { createClient } from "@supabase/supabase-js";

/**
 * Bare anon-key Supabase client — no cookie binding, no session refresh.
 *
 * Use this for public, unauthenticated writes (e.g. visitor form submissions).
 * Going through the cookie-aware @supabase/ssr client can return 401 if a
 * stale or partial auth cookie is present in the request, even when the RLS
 * policy permits the `anon` role.
 *
 * NOT for any path that needs to know who the caller is — that's still
 * lib/supabase/server.ts.
 */
export function createAnonClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } },
  );
}
