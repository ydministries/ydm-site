import { cookies } from "next/headers";
import { createServerClient as createSSRServerClient, type CookieOptions } from "@supabase/ssr";

type CookieRecord = { name: string; value: string; options?: CookieOptions };

/**
 * Cookie-aware Supabase client for server components, route handlers, and
 * server actions. Reads/writes the auth session cookie via next/headers, so
 * `auth.getUser()` actually returns the current user.
 *
 * Use this anywhere you need to know who the user is. For pure public reads
 * (content fetchers like lib/blog.ts, lib/sermons.ts), the lighter
 * `lib/supabase.ts#createServerClient` is fine — it doesn't need the cookie
 * round-trip and skips the auth refresh path.
 */
export async function createServerClient() {
  const cookieStore = await cookies();
  return createSSRServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: CookieRecord[]) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // Called from a Server Component — Next forbids cookie writes
            // here. Middleware handles the refresh, so this is safe to
            // swallow.
          }
        },
      },
    },
  );
}
