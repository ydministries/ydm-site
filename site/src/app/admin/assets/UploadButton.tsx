"use client";

import { useRef, useState, type DragEvent } from "react";
import { useRouter } from "next/navigation";

type Status =
  | { kind: "idle" }
  | { kind: "uploading"; name: string }
  | { kind: "error"; message: string }
  | { kind: "success"; url: string };

export function UploadButton() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [dragOver, setDragOver] = useState(false);
  const router = useRouter();

  async function uploadFile(file: File) {
    setStatus({ kind: "uploading", name: file.name });
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/admin/assets/upload", {
        method: "POST",
        body: fd,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error ?? `Upload failed (${res.status})`);
      }
      setStatus({ kind: "success", url: data.url });
      router.refresh();
      setTimeout(() => {
        setStatus((s) => (s.kind === "success" ? { kind: "idle" } : s));
      }, 3000);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Upload failed";
      setStatus({ kind: "error", message });
    }
  }

  function handlePick() {
    fileRef.current?.click();
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) void uploadFile(f);
    e.target.value = "";
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) void uploadFile(f);
  }

  return (
    <div className="flex shrink-0 flex-col items-end gap-2">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`flex items-center gap-3 rounded-lg border-2 border-dashed px-4 py-2 transition-colors ${
          dragOver
            ? "border-ydm-gold bg-ydm-cream"
            : "border-ydm-line bg-ydm-surface"
        }`}
      >
        <span className="hidden text-xs text-ydm-muted sm:inline">
          Drag image here or
        </span>
        <button
          type="button"
          onClick={handlePick}
          disabled={status.kind === "uploading"}
          className="rounded bg-ydm-ink px-3 py-1.5 text-xs font-medium text-ydm-surface hover:bg-ydm-gold disabled:cursor-not-allowed disabled:opacity-50"
        >
          {status.kind === "uploading" ? "Uploading…" : "Upload"}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
          onChange={handleChange}
          className="hidden"
        />
      </div>
      <StatusLine status={status} />
    </div>
  );
}

function StatusLine({ status }: { status: Status }) {
  if (status.kind === "uploading") {
    return (
      <span className="text-xs text-ydm-muted">Uploading {status.name}…</span>
    );
  }
  if (status.kind === "error") {
    return <span className="text-xs text-red-700">{status.message}</span>;
  }
  if (status.kind === "success") {
    return <span className="text-xs text-emerald-700">Uploaded ✓</span>;
  }
  return (
    <span className="text-xs text-ydm-muted">JPG · PNG · WebP · 4MB max</span>
  );
}
