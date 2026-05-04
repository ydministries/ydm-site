"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase/client";

type Mode = "signin" | "signup" | "forgot";

export default function LoginPage() {
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get("next") || "/admin";

  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const supabase = createBrowserClient();

  async function handleSignIn(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setInfo("");
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) {
      setError(err.message);
      setBusy(false);
      return;
    }
    router.push(next);
    router.refresh();
  }

  async function handleSignUp(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setInfo("");
    if (password !== confirm) {
      setError("Passwords don't match.");
      setBusy(false);
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      setBusy(false);
      return;
    }
    const { data, error: err } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/admin/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
    if (err) {
      setError(err.message);
      setBusy(false);
      return;
    }
    if (data.user && !data.session) {
      // Email confirmation required.
      setInfo("Check your email to confirm your address. After confirming you'll be redirected back here.");
      setBusy(false);
      return;
    }
    // Confirmation disabled — already signed in.
    router.push(next);
    router.refresh();
  }

  async function handleForgot(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setInfo("");
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/admin/login`,
    });
    if (err) {
      setError(err.message);
      setBusy(false);
      return;
    }
    setInfo("Check your email for a password-reset link.");
    setBusy(false);
  }

  return (
    <div className="rounded-lg border border-ydm-line bg-ydm-surface p-8 shadow-sm">
      {/* Tabs */}
      <div className="mb-6 flex border-b border-ydm-line">
        <button
          type="button"
          onClick={() => {
            setMode("signin");
            setError("");
            setInfo("");
          }}
          className={`flex-1 border-b-2 py-2 text-sm font-medium ${
            mode === "signin"
              ? "border-ydm-gold text-ydm-ink"
              : "border-transparent text-ydm-muted hover:text-ydm-ink"
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => {
            setMode("signup");
            setError("");
            setInfo("");
          }}
          className={`flex-1 border-b-2 py-2 text-sm font-medium ${
            mode === "signup"
              ? "border-ydm-gold text-ydm-ink"
              : "border-transparent text-ydm-muted hover:text-ydm-ink"
          }`}
        >
          Sign Up
        </button>
      </div>

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
          <Field id="email" label="Email" type="email" value={email} onChange={setEmail} required />
          <Field id="password" label="Password" type="password" value={password} onChange={setPassword} required />
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

      {mode === "signup" && (
        <form onSubmit={handleSignUp} className="space-y-4">
          <Field id="email" label="Email" type="email" value={email} onChange={setEmail} required />
          <Field id="password" label="Password" type="password" value={password} onChange={setPassword} required hint="At least 8 characters" />
          <Field id="confirm" label="Confirm Password" type="password" value={confirm} onChange={setConfirm} required />
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-full bg-ydm-gold px-4 py-2.5 text-sm font-semibold text-ydm-ink hover:bg-ydm-gold/90 disabled:opacity-60"
          >
            {busy ? "Creating account…" : "Create Account"}
          </button>
          <p className="text-center text-xs text-ydm-muted">
            By signing up you'll be granted Bishop-level access. Admin elevation
            requires a manual database update.
          </p>
        </form>
      )}

      {mode === "forgot" && (
        <form onSubmit={handleForgot} className="space-y-4">
          <Field id="email" label="Email" type="email" value={email} onChange={setEmail} required />
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-full bg-ydm-gold px-4 py-2.5 text-sm font-semibold text-ydm-ink hover:bg-ydm-gold/90 disabled:opacity-60"
          >
            {busy ? "Sending…" : "Send Reset Link"}
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
      <label htmlFor={id} className="mb-1 block text-xs font-medium uppercase tracking-wider text-ydm-ink">
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
