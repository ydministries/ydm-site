"use client";

import { useEffect, useState } from "react";

/**
 * Compute the next 4th Sunday of the month at 1:00 PM in the user's local
 * timezone. The site is GTA-based (Eastern), so for visitors in that timezone
 * the 1pm here matches the live service. Visitors elsewhere see the countdown
 * in their own local time — which is acceptable for a "time until next service"
 * display (it's a relative duration, not a wall-clock).
 */
function nextFourthSunday(now: Date = new Date()): Date {
  const findFourthSunday = (year: number, month: number): Date | null => {
    let count = 0;
    for (let d = 1; d <= 31; d++) {
      const candidate = new Date(year, month, d, 13, 0, 0);
      if (candidate.getMonth() !== month) break;
      if (candidate.getDay() === 0) {
        count++;
        if (count === 4) return candidate;
      }
    }
    return null;
  };

  const thisMonth = findFourthSunday(now.getFullYear(), now.getMonth());
  if (thisMonth && thisMonth.getTime() > now.getTime()) return thisMonth;

  // Fall through to next month
  const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const next = findFourthSunday(nextMonthStart.getFullYear(), nextMonthStart.getMonth());
  if (next) return next;

  // Pathological fallback (shouldn't hit): 30 days from now
  return new Date(now.getTime() + 30 * 86400000);
}

interface Diff {
  d: number;
  h: number;
  m: number;
  s: number;
}

function diffFrom(target: Date, now: Date): Diff {
  const ms = Math.max(0, target.getTime() - now.getTime());
  return {
    d: Math.floor(ms / 86400000),
    h: Math.floor((ms / 3600000) % 24),
    m: Math.floor((ms / 60000) % 60),
    s: Math.floor((ms / 1000) % 60),
  };
}

function Block({ n, label }: { n: number; label: string }) {
  return (
    <div className="text-center">
      <p className="m-0 font-display text-6xl leading-none text-white tabular-nums sm:text-7xl">
        {String(n).padStart(2, "0")}
      </p>
      <p className="m-0 mt-2 font-accent text-xs uppercase tracking-[0.3em] text-white/60">
        {label}
      </p>
    </div>
  );
}

export function CountdownToService() {
  // Render zeros on first paint to avoid SSR/CSR mismatch — the real numbers
  // tick in via useEffect on the client.
  const [diff, setDiff] = useState<Diff>({ d: 0, h: 0, m: 0, s: 0 });

  useEffect(() => {
    const target = nextFourthSunday();
    const tick = () => setDiff(diffFrom(target, new Date()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex justify-center gap-6 sm:gap-12">
      <Block n={diff.d} label="Days" />
      <Block n={diff.h} label="Hours" />
      <Block n={diff.m} label="Minutes" />
      <Block n={diff.s} label="Seconds" />
    </div>
  );
}
