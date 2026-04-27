"use client";

import { useState } from "react";

interface Props {
  url: string;
  title: string;
}

export function ShareButtons({ url, title }: Props) {
  const [copied, setCopied] = useState(false);
  const fullUrl = typeof window !== "undefined" ? window.location.origin + url : url;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard denied — silently no-op */
    }
  };

  const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(fullUrl)}`;
  const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullUrl)}`;

  const btn =
    "flex h-10 w-10 items-center justify-center rounded-full border border-ydm-line text-ydm-muted transition-colors hover:border-ydm-gold hover:text-ydm-gold";

  return (
    <div className="flex items-center justify-center gap-3">
      <a href={tweetUrl} target="_blank" rel="noopener noreferrer" aria-label="Share on X" className={btn}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M18.244 2H21l-6.557 7.494L22 22h-6.793l-5.32-6.957L3.744 22H1l7.04-8.043L1 2h6.957l4.83 6.39L18.244 2zm-2.382 18h1.853L7.183 4h-1.99L15.862 20z" />
        </svg>
      </a>
      <a href={fbUrl} target="_blank" rel="noopener noreferrer" aria-label="Share on Facebook" className={btn}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M22 12.06C22 6.51 17.52 2 12 2S2 6.51 2 12.06c0 5 3.66 9.15 8.44 9.94v-7.03H7.9v-2.91h2.54v-2.21c0-2.51 1.49-3.89 3.78-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.45 2.91h-2.33V22c4.78-.79 8.43-4.94 8.43-9.94z" />
        </svg>
      </a>
      <button onClick={copyLink} aria-label={copied ? "Copied!" : "Copy link"} className={btn}>
        {copied ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </svg>
        )}
      </button>
    </div>
  );
}
