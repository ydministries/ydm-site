"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase/client";

type Mode = "signin" | "forgot";

/**
 * YDM admin sign-in page.
 *
 * Public sign-up is intentionally NOT exposed here — admin access is by
 * invitation only. Add new editors via:
 *  1. Supabase Dashboard → Authentication → Users → Invite User (sends a
 *     magic link via the configured SMTP), OR
 *  2. SQL `INSERT INTO auth.users` with the service-role key
 *
 * "Allow new users to sign up" is also disabled in Supabase Auth settings
 * so direct API calls to `auth.signUp()` are rejected at the API layer too
 * — defense in depth against the UI being bypassed.
 */
export default function LoginPage() {
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get("next") || "/admin";
  const errorParam = search.get("error");

  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(errorParam ?? "");
  const [info, setInfo] = useState("");

  const supabase = createBrowserClient();

  async function handleSignIn(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setInfo("");
    const { error: err } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (err) {
      setError(err.message);
      setBusy(false);
      return;
    }
    router.push(next);
    router.refresh();
  }

  async function handleForgot(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setInfo("");
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/admin/auth/reset`,
    });
    if (err) {
      setError(err.message);
      setBusy(false);
      return;
    }
    setInfo(
      "If an account exists for that email, a password-reset link is on the way.",
    );
    setBusy(false);
  }

  return (
    <div className="rounded-lg border border-ydm-line bg-ydm-surface p-8 shadow-sm">
      <h1 className="m-0 mb-2 font-display text-xl uppercase tracking-wide text-ydm-ink">
        {mode === "signin" ? "Sign in" : "Reset password"}
      </h1>
      <p className="m-0 mb-6 text-xs text-ydm-muted">
        {mode === "signin"
          ? "YDM admin access is by invitation."
          : "Enter your account email and we'll send you a reset link."}
      </p>

      {error ? (
        <div className="mb-4 rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      ) : null}
      {info ? (
        <div className="mb-4 rounded border border-green-300 bg-green-50 px-3 py-2 text-sm text-green-700">
          {info}
        </div>
      ) : null}

      {mode === "signin" && (
        <form onSubmit={handleSignIn} className="space-y-4">
          <Field
            id="email"
            label="Email"
            type="email"
            value={email}
            onChange={setEmail}
            required
          />
          <Field
            id="password"
            label="Password"
            type="password"
            value={password}
            onChange={setPassword}
            required
          />
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-full bg-ydm-gold px-4 py-2.5 text-sm font-semibold text-ydm-ink hover:bg-ydm-gold/90 disabled:opacity-60"
          >
            {busy ? "Signing in…" : "Sign In"}
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("forgot");
              setError("");
              setInfo("");
            }}
            className="w-full text-center text-xs text-ydm-muted hover:text-ydm-gold"
          >
            Forgot your password?
          </button>
        </form>
      )}

      {mode === "forgot" && (
        <form onSubmit={handleForgot} className="space-y-4">
          <Field
            id="email"
            label="Email"
            type="email"
            value={email}
            onChange={setEmail}
            required
          />
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-full bg-ydm-gold px-4 py-2.5 text-sm font-semibold text-ydm-ink hover:bg-ydm-gold/90 disabled:opacity-60"
          >
            {busy ? "Sending…" : "Send reset link"}
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("signin");
              setError("");
              setInfo("");
            }}
            className="w-full text-center text-xs text-ydm-muted hover:text-ydm-gold"
          >
            Back to sign in
          </button>
        </form>
      )}

      <p className="mt-8 border-t border-ydm-line pt-4 text-center text-[11px] leading-relaxed text-ydm-muted">
        Need access? Email{" "}
        <a
          href="mailto:yeshuawebmaster@gmail.com?subject=YDM%20admin%20access%20request"
          className="text-ydm-ink underline"
        >
          yeshuawebmaster@gmail.com
        </a>{" "}
        and we'll get back to you.
      </p>
    </div>
  );
}

function Field({
  id,
  label,
  type,
  value,
  onChange,
  required,
  hint,
}: {
  id: string;
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  hint?: string;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1 block text-xs font-medium uppercase tracking-wider text-ydm-ink"
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        autoComplete={type === "password" ? "current-password" : undefined}
        className="w-full rounded border border-ydm-line bg-white px-3 py-2 text-sm text-ydm-ink focus:border-ydm-gold focus:outline-none focus:ring-2 focus:ring-ydm-gold/30"
      />
      {hint ? <p className="mt-1 text-xs text-ydm-muted">{hint}</p> : null}
    </div>
  );
}
