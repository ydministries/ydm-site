import { createServerClient } from "./supabase";

/**
 * Auth guards for API routes and server actions.
 * Checks profiles.role — never JWT claims (FOM lesson: JWT drifts).
 */

export interface AuthResult {
  userId: string;
  email: string;
  role: "admin" | "bishop";
}

async function getProfile(): Promise<AuthResult | null> {
  const supabase = createServerClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) return null;

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role, email")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) return null;

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
