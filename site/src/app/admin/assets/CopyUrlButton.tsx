"use client";

import { useState } from "react";

export function CopyUrlButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  async function handleClick() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard API can fail on insecure origins; fall back to prompt
      window.prompt("Copy URL:", url);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="rounded border border-ydm-line bg-ydm-surface px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-ydm-ink hover:border-ydm-gold"
    >
      {copied ? "Copied!" : "Copy URL"}
    </button>
  );
}
