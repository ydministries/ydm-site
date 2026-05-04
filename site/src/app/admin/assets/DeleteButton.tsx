"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteAsset } from "./actions";

export function DeleteButton({
  assetKey,
  fileName,
}: {
  assetKey: string;
  fileName: string;
}) {
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function openModal() {
    setOpen(true);
    setConfirmText("");
    setError(null);
  }

  function close() {
    if (pending) return;
    setOpen(false);
  }

  function handleDelete() {
    setError(null);
    startTransition(async () => {
      const result = await deleteAsset({ assetKey, confirm: confirmText });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        title="Delete asset"
        className="rounded border border-ydm-line bg-ydm-surface px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-red-700 hover:border-red-300 hover:bg-red-50"
      >
        Delete
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-ydm-ink/60 px-4 py-8"
          onClick={(e) => {
            if (e.target === e.currentTarget) close();
          }}
        >
          <div className="w-full max-w-md overflow-hidden rounded-lg border border-ydm-line bg-ydm-surface shadow-xl">
            <header className="border-b border-ydm-line px-5 py-4">
              <h2 className="m-0 font-display text-base uppercase tracking-wide text-ydm-ink">
                Delete this asset?
              </h2>
            </header>
            <div className="space-y-3 px-5 py-4">
              <p className="m-0 break-all font-mono text-xs text-ydm-muted">
                {fileName}
              </p>
              <p className="m-0 text-sm text-red-700">
                This permanently removes the file from R2 and cannot be undone.
              </p>
              <div>
                <label className="block font-accent text-[10px] uppercase tracking-wider text-ydm-muted">
                  Type{" "}
                  <span className="font-mono font-bold text-red-700">DELETE</span>{" "}
                  to confirm
                </label>
                <input
                  ref={inputRef}
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="DELETE"
                  className="mt-1 w-full rounded border border-ydm-line bg-ydm-surface px-3 py-2 font-mono text-sm text-ydm-ink focus:border-ydm-gold focus:outline-none"
                />
              </div>
              {error && (
                <p className="m-0 text-xs text-red-700">{error}</p>
              )}
            </div>
            <footer className="flex items-center justify-end gap-2 border-t border-ydm-line bg-ydm-cream px-5 py-3">
              <button
                type="button"
                onClick={close}
                disabled={pending}
                className="rounded border border-ydm-line bg-ydm-surface px-3 py-1.5 text-xs font-medium text-ydm-ink hover:bg-ydm-cream disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={pending || confirmText !== "DELETE"}
                className="rounded bg-red-700 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-white hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {pending ? "Deleting…" : "Delete permanently"}
              </button>
            </footer>
          </div>
        </div>
      )}
    </>
  );
}
