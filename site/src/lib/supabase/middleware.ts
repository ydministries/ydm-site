import { NextResponse, type NextRequest } from "next/server";
import { createServerClient as createSSRServerClient, type CookieOptions } from "@supabase/ssr";

type CookieRecord = { name: string; value: string; options?: CookieOptions };

/**
 * Refresh the Supabase auth session on every matched request and return the
 * up-to-date NextResponse with synced cookies.
 *
 * Usage from site/middleware.ts:
 *
 *   const { response, supabase, user } = await updateSession(request);
 *   // ...do role checks...
 *   return response;
 *
 * Returning the same response object is critical — Supabase needs to write
 * the refreshed access/refresh tokens back as cookies, and Next throws if
 * you create a different response after.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createSSRServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: CookieRecord[]) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  // Touch getUser() to trigger session refresh if the access token expired.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { response, supabase, user };
}
