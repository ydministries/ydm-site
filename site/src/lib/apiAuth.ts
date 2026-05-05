import { createServerClient } from "./supabase/server";

/**
 * Auth guards for API routes and server actions.
 * Checks profiles.role — never JWT claims (FOM lesson: JWT drifts).
 */

export interface AuthResult {
  userId: string;
  email: string;
  role: "admin" | "bishop";
}

/**
 * Non-throwing variant — returns the current user's profile or null if
 * unauthenticated / no profile row. Use in layouts and landing pages where
 * we want to render conditionally on role rather than redirect/throw.
 */
export async function getCurrentProfile(): Promise<AuthResult | null> {
  return getProfile();
}

async function getProfile(): Promise<AuthResult | null> {
  const supabase = await createServerClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) return null;

  const { data, error: profileError } = await supabase
    .from("profiles")
    .select("role, email")
    .eq("id", user.id);

  if (profileError || !data || data.length === 0) return null;

  const profile = data[0];

  return {
    userId: user.id,
    email: profile.email ?? user.email ?? "",
    role: profile.role as "admin" | "bishop",
  };
}

/**
 * Require admin role. Returns AuthResult or throws.
 */
export async function requireAdmin(): Promise<AuthResult> {
  const auth = await getProfile();
  if (!auth || auth.role !== "admin") {
    throw new Error("Unauthorized: admin role required");
  }
  return auth;
}

/**
 * Require bishop or admin role. Returns AuthResult or throws.
 */
export async function requireBishop(): Promise<AuthResult> {
  const auth = await getProfile();
  if (!auth) {
    throw new Error("Unauthorized: authentication required");
  }
  return auth;
}

/**
 * Require any editor (admin or bishop). Alias for requireBishop.
 */
export const requireAnyEditor = requireBishop;
