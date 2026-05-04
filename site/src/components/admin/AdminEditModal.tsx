"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveContentField } from "@/app/admin/content/actions";
import type { EditTarget } from "./AdminEditProvider";

type Status =
  | { kind: "idle" }
  | { kind: "saving" }
  | { kind: "saved" }
  | { kind: "error"; message: string };

interface Props {
  target: EditTarget;
  onClose: () => void;
}

export function AdminEditModal({ target, onClose }: Props) {
  const [value, setValue] = useState(target.currentValue);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLTextAreaElement | HTMLInputElement | null>(null);
  const router = useRouter();

  // Esc to close, Cmd/Ctrl+Enter to submit.
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        void handleSave();
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  // Autofocus on mount.
  useEffect(() => {
    inputRef.current?.focus();
    if (inputRef.current && "select" in inputRef.current) {
      try {
        (inputRef.current as HTMLInputElement).select();
      } catch {
        /* noop */
      }
    }
  }, []);

  async function handleSave() {
    if (isPending) return;
    setStatus({ kind: "saving" });
    startTransition(async () => {
      const res = await saveContentField({
        pageKey: target.pageKey,
        fieldKey: target.fieldKey,
        newValue: value,
      });
      if (!res.ok) {
        setStatus({ kind: "error", message: res.error });
        return;
      }
      setStatus({ kind: "saved" });
      router.refresh();
      setTimeout(onClose, 800);
    });
  }

  const isLong =
    target.valueType === "html" ||
    value.length > 200 ||
    value.includes("\n");

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-ydm-ink/60 px-4 py-8"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-2xl overflow-hidden rounded-lg border border-ydm-line bg-ydm-surface shadow-xl">
        <header className="flex items-start justify-between gap-3 border-b border-ydm-line px-5 py-4">
          <div className="min-w-0">
            <h2 className="m-0 font-display text-base uppercase tracking-wide text-ydm-ink">
              Edit field
            </h2>
            <p className="mt-1 truncate font-mono text-xs text-ydm-muted">
              {target.pageKey} · {target.fieldKey}
              <span className="ml-2 rounded-full bg-ydm-cream px-2 py-0.5 font-accent text-[10px] uppercase tracking-wider text-ydm-muted">
                {target.valueType}
              </span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded p-1 text-ydm-muted hover:bg-ydm-cream hover:text-ydm-ink"
          >
            ✕
          </button>
        </header>

        <div className="px-5 py-4">
          {isLong ? (
            <textarea
              ref={(el) => {
                inputRef.current = el;
              }}
              rows={target.valueType === "html" ? 10 : 6}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className={`w-full rounded border border-ydm-line bg-ydm-surface px-3 py-2 text-sm text-ydm-ink focus:border-ydm-gold focus:outline-none ${
                target.valueType === "html" ? "font-mono text-xs" : "font-serif"
              }`}
            />
          ) : (
            <input
              ref={(el) => {
                inputRef.current = el;
              }}
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-full rounded border border-ydm-line bg-ydm-surface px-3 py-2 font-serif text-sm text-ydm-ink focus:border-ydm-gold focus:outline-none"
            />
          )}
          <p className="mt-2 text-[11px] text-ydm-muted">
            ⌘/Ctrl + Enter to save · Esc to cancel
          </p>
        </div>

        <footer className="flex items-center justify-between gap-3 border-t border-ydm-line bg-ydm-cream px-5 py-3">
          <StatusLine status={status} />
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded border border-ydm-line bg-ydm-surface px-3 py-1.5 text-xs font-medium text-ydm-ink hover:bg-ydm-cream"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isPending || value === target.currentValue}
              className="rounded bg-ydm-gold px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-ydm-ink hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPending ? "Saving…" : "Save"}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}

function StatusLine({ status }: { status: Status }) {
  if (status.kind === "saving")
    return <span className="text-xs text-ydm-muted">Saving…</span>;
  if (status.kind === "saved")
    return <span className="text-xs text-emerald-700">Saved ✓</span>;
  if (status.kind === "error")
    return (
      <span className="text-xs text-red-700">Error: {status.message}</span>
    );
  return <span className="text-xs text-ydm-muted">&nbsp;</span>;
}
