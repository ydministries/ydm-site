import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * Protects /admin/* routes:
 *   1. Refresh the Supabase session (so server components see the current user).
 *   2. /admin/login, /admin/logout, /admin/auth/* always pass through (no role
 *      check). Otherwise a user with a broken/missing profile row could never
 *      sign out via the UI — the role gate would catch them first.
 *   3. If no session → redirect to /admin/login.
 *   4. If session present, look up profiles.role; if not in ('bishop','admin')
 *      → redirect to / with ?error=forbidden.
 *   5. Otherwise let the request through.
 */
const PUBLIC_ADMIN_PATHS = [
  "/admin/login",
  "/admin/logout",
  "/admin/auth/callback",
];

function isPublicAdminPath(pathname: string): boolean {
  return (
    PUBLIC_ADMIN_PATHS.some((p) => pathname === p) ||
    pathname.startsWith("/admin/auth/")
  );
}

export async function middleware(request: NextRequest) {
  const { response, supabase, user } = await updateSession(request);

  const pathname = request.nextUrl.pathname;

  if (isPublicAdminPath(pathname)) {
    // Signed-in users hitting /admin/login bounce to /admin to avoid the
    // confusing "log in again" loop.
    if (user && pathname === "/admin/login") {
      const url = request.nextUrl.clone();
      url.pathname = "/admin";
      url.search = "";
      return NextResponse.redirect(url);
    }
    return response;
  }

  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.search = `?next=${encodeURIComponent(pathname)}`;
    return NextResponse.redirect(url);
  }

  // Role gate: profiles.role must be 'bishop' or 'admin'.
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    // Most likely RLS policy issue (recursive policy → stack overflow, or
    // missing self-read policy). Log loudly so the next request shows up in
    // dev console with a clear cause.
    console.error("[middleware] profile read failed:", error.message);
  }

  const role = profile?.role as "admin" | "bishop" | undefined;
  if (role !== "admin" && role !== "bishop") {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.search = "?error=forbidden";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
