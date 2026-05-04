import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

/**
 * Sign out and redirect to /. Accepts POST (canonical, used by the sidebar
 * form button) and GET (so a plain link works in case JS is off).
 */
async function handle(request: NextRequest) {
  const supabase = await createServerClient();
  await supabase.auth.signOut();
  const url = request.nextUrl.clone();
  url.pathname = "/";
  url.search = "";
  return NextResponse.redirect(url);
}

export const POST = handle;
export const GET = handle;
