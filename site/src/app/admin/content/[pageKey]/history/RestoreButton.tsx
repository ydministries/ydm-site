"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { restoreContentVersion } from "../../actions";

export function RestoreButton({
  versionId,
  disabled,
}: {
  versionId: string;
  disabled?: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function handleClick() {
    if (
      !window.confirm(
        "Restore this version? This will become the current value (and create a new history entry).",
      )
    ) {
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await restoreContentVersion({ versionId });
      if (!result.ok) {
        setError(result.error);
      } else {
        router.refresh();
      }
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled || pending}
        className="rounded border border-ydm-gold px-3 py-1.5 text-xs font-medium text-ydm-gold transition-colors hover:bg-ydm-gold hover:text-ydm-ink disabled:cursor-not-allowed disabled:opacity-40"
      >
        {pending ? "Restoring…" : "Restore this"}
      </button>
      {error && <p className="m-0 text-xs text-red-700">{error}</p>}
    </div>
  );
}
