"use client";

import { createBrowserClient as createSSRBrowserClient } from "@supabase/ssr";

/**
 * Cookie-aware Supabase client for client components ('use client').
 * Use for sign-in / sign-up / sign-out flows on the auth pages and any
 * client-side reads that need the current user. The session cookie is
 * shared with the server-side client, so a sign-in here is immediately
 * visible to the next server render.
 */
export function createBrowserClient() {
  return createSSRBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
