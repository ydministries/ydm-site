"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  src: string;
}

function fmt(s: number): string {
  if (!Number.isFinite(s) || s < 0) return "0:00";
  const total = Math.floor(s);
  const m = Math.floor(total / 60);
  const sec = total % 60;
  return `${m}:${String(sec).padStart(2, "0")}`;
}

export function CustomAudioPlayer({ src }: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const onEnded = () => setPlaying(false);
    a.addEventListener("ended", onEnded);
    return () => a.removeEventListener("ended", onEnded);
  }, []);

  const togglePlay = async () => {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) {
      await a.play();
      setPlaying(true);
    } else {
      a.pause();
      setPlaying(false);
    }
  };

  const skip = (delta: number) => {
    const a = audioRef.current;
    if (!a) return;
    a.currentTime = Math.max(0, Math.min((a.duration || 0), a.currentTime + delta));
  };

  const seek = (t: number) => {
    const a = audioRef.current;
    if (!a) return;
    a.currentTime = t;
    setCurrent(t);
  };

  return (
    <div className="rounded-sm border border-ydm-line bg-ydm-cream p-4 sm:p-6">
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        onTimeUpdate={(e) => setCurrent((e.target as HTMLAudioElement).currentTime)}
        onLoadedMetadata={(e) => setDuration((e.target as HTMLAudioElement).duration)}
      />
      <div className="flex items-center gap-3 sm:gap-4">
        <button
          onClick={togglePlay}
          aria-label={playing ? "Pause" : "Play"}
          className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-ydm-gold text-ydm-ink transition-colors hover:bg-ydm-gold-light"
        >
          {playing ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <rect x="6" y="5" width="4" height="14" rx="1" />
              <rect x="14" y="5" width="4" height="14" rx="1" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>
        <button
          onClick={() => skip(-15)}
          aria-label="Skip back 15 seconds"
          className="flex-shrink-0 font-accent text-xs uppercase tracking-wider text-ydm-muted transition-colors hover:text-ydm-ink"
        >
          ‹ 15s
        </button>
        <div className="flex flex-1 flex-col gap-1">
          <input
            type="range"
            min={0}
            max={duration || 0}
            step={0.1}
            value={current}
            onChange={(e) => seek(+e.target.value)}
            aria-label="Seek"
            className="w-full accent-ydm-gold"
          />
          <div className="flex justify-between font-accent text-xs uppercase tracking-wider text-ydm-muted">
            <span>{fmt(current)}</span>
            <span>{fmt(duration)}</span>
          </div>
        </div>
        <button
          onClick={() => skip(15)}
          aria-label="Skip forward 15 seconds"
          className="flex-shrink-0 font-accent text-xs uppercase tracking-wider text-ydm-muted transition-colors hover:text-ydm-ink"
        >
          15s ›
        </button>
      </div>
    </div>
  );
}
