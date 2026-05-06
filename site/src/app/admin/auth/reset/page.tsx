"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase/client";

/**
 * Password reset landing page.
 *
 * Two flows can land here:
 *
 *  A. Recovery hash flow — Supabase redirects from its `/auth/v1/verify`
 *     endpoint with `#access_token=…&refresh_token=…&type=recovery`. The
 *     `@supabase/ssr` browser client picks the hash up automatically on
 *     mount and stores a temporary recovery session in cookies. Once that
 *     session is in place, calling `updateUser({ password })` works.
 *
 *  B. Token-hash query flow — newer Supabase recovery emails include
 *     `?token_hash=…&type=recovery`. We call `verifyOtp({ token_hash,
 *     type: 'recovery' })` to exchange that for a session.
 *
 * We probe both and surface a friendly error if the link is too old or has
 * already been used. On successful password update we bounce to /admin.
 */
export default function ResetPasswordPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<
    "checking" | "ready" | "submitting" | "done" | "error"
  >("checking");
  const [error, setError] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [isInvite, setIsInvite] = useState(false);

  const supabase = createBrowserClient();

  useEffect(() => {
    let cancelled = false;
    let unsubscribe: (() => void) | null = null;

    async function init() {
      // Three possible flows can land here, in order of preference:
      //
      // 1. Query-param token_hash flow (`?token_hash=…&type=recovery|invite`)
      //    — used by our branded templates. Verify via verifyOtp.
      //
      // 2. URL-hash implicit flow (`#access_token=…&refresh_token=…&type=…`)
      //    — used by Supabase's default templates AND by verify-endpoint
      //    redirects. The SSR browser client auto-detects this on load,
      //    but the timing races our useEffect — so we explicitly parse
      //    and call setSession.
      //
      // 3. Already-authenticated session — user landed here directly while
      //    signed in. Just show the password form.

      const url = new URL(window.location.href);

      // ── Flow 1: query-param token_hash ──────────────────────────────────
      const tokenHash = url.searchParams.get("token_hash");
      const queryType = url.searchParams.get("type");
      if (
        tokenHash &&
        (queryType === "recovery" || queryType === "invite")
      ) {
        const { error: verifyErr } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: queryType,
        });
        if (verifyErr) {
          if (cancelled) return;
          setError(
            queryType === "invite"
              ? "This invite link is no longer valid. It may have expired or already been used. Ask the admin to send a new invite."
              : "This reset link is no longer valid. It may have expired or already been used. Request a new one from the sign-in page.",
          );
          setPhase("error");
          return;
        }
        if (queryType === "invite") setIsInvite(true);
        window.history.replaceState({}, "", "/admin/auth/reset");
        if (cancelled) return;
        setPhase("ready");
        return;
      }

      // ── Flow 2: URL hash implicit (#access_token=…) ─────────────────────
      // Parse the hash to detect invite vs recovery + extract tokens.
      const hashParams = new URLSearchParams(
        window.location.hash.replace(/^#/, ""),
      );
      const hashAccess = hashParams.get("access_token");
      const hashRefresh = hashParams.get("refresh_token");
      const hashType = hashParams.get("type");
      if (hashAccess && hashRefresh) {
        const { error: setErr } = await supabase.auth.setSession({
          access_token: hashAccess,
          refresh_token: hashRefresh,
        });
        if (cancelled) return;
        if (setErr) {
          setError(
            hashType === "invite"
              ? "This invite link is no longer valid. It may have expired or already been used. Ask the admin to send a new invite."
              : "This reset link is no longer valid. It may have expired or already been used. Request a new one from the sign-in page.",
          );
          setPhase("error");
          return;
        }
        if (hashType === "invite") setIsInvite(true);
        window.history.replaceState({}, "", "/admin/auth/reset");
        setPhase("ready");
        return;
      }

      // ── Flow 3: existing session (or maybe SSR client already settled)
      // Give the SSR client a brief moment to finish processing, then check.
      const { data: { session } } = await supabase.auth.getSession();
      if (cancelled) return;
      if (session) {
        setPhase("ready");
        return;
      }

      // Subscribe to auth state changes — if the SSR client picks up a
      // session within the timeout window, we can still proceed.
      const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
        if (cancelled) return;
        if (sess) {
          setPhase("ready");
          sub.subscription.unsubscribe();
        }
      });
      unsubscribe = () => sub.subscription.unsubscribe();

      // Bail after 3s — anything beyond that is an actual failure.
      setTimeout(() => {
        if (cancelled) return;
        supabase.auth.getSession().then(({ data }) => {
          if (cancelled || data.session) return;
          setError(
            "We couldn't verify your link. Open the most recent email and click the link again, or request a new one from the sign-in page.",
          );
          setPhase("error");
          if (unsubscribe) unsubscribe();
        });
      }, 3000);
    }
    init();
    return () => {
      cancelled = true;
      if (unsubscribe) unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setError("");
    setPhase("submitting");
    const { error: updErr } = await supabase.auth.updateUser({ password });
    if (updErr) {
      setError(updErr.message);
      setPhase("ready");
      return;
    }
    setPhase("done");
    setTimeout(() => {
      router.push("/admin");
      router.refresh();
    }, 1200);
  }

  return (
    <div className="rounded-lg border border-ydm-line bg-ydm-surface p-8 shadow-sm">
      <h1 className="m-0 mb-2 font-display text-2xl uppercase tracking-wide text-ydm-ink">
        {isInvite ? "Welcome to YDM admin" : "Set a new password"}
      </h1>
      <p className="m-0 mb-6 text-sm text-ydm-muted">
        {isInvite
          ? "Choose a password to finish setting up your account. You'll be signed in right after."
          : "Choose a password for your YDM admin account."}
      </p>

      {phase === "checking" && (
        <p className="rounded border border-ydm-line bg-ydm-cream/40 p-3 text-sm text-ydm-muted">
          Verifying your reset link…
        </p>
      )}

      {phase === "error" && (
        <div className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700">
          {error}
          <p className="mt-3">
            <a
              href="/admin/login"
              className="font-semibold text-ydm-ink underline"
            >
              Back to sign in
            </a>
          </p>
        </div>
      )}

      {phase === "done" && (
        <div className="rounded border border-green-300 bg-green-50 p-3 text-sm text-green-800">
          Password updated. Signing you in…
        </div>
      )}

      {(phase === "ready" || phase === "submitting") && (
        <form onSubmit={onSubmit} className="space-y-4">
          {error && (
            <div className="rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}
          <div>
            <label
              htmlFor="reset-password"
              className="mb-1 block text-xs font-semibold uppercase tracking-wider text-ydm-muted"
            >
              New password
            </label>
            <input
              id="reset-password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded border border-ydm-line bg-white px-3 py-2 text-sm text-ydm-ink focus:border-ydm-gold focus:outline-none"
            />
          </div>
          <div>
            <label
              htmlFor="reset-confirm"
              className="mb-1 block text-xs font-semibold uppercase tracking-wider text-ydm-muted"
            >
              Confirm new password
            </label>
            <input
              id="reset-confirm"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full rounded border border-ydm-line bg-white px-3 py-2 text-sm text-ydm-ink focus:border-ydm-gold focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={phase === "submitting"}
            className="w-full rounded-full bg-ydm-gold px-4 py-2.5 text-sm font-semibold text-ydm-ink hover:bg-ydm-gold/90 disabled:opacity-60"
          >
            {phase === "submitting" ? "Saving…" : "Set new password"}
          </button>
        </form>
      )}
    </div>
  );
}
