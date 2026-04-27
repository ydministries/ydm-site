import { readFile } from 'node:fs/promises';
import { basename } from 'node:path';

// Captures absolute and protocol-relative WP upload URLs in arbitrary text
// (decoded JSON strings, raw XML CDATA, etc). Stops at quote/backslash/space/
// closing-bracket — covers JSON strings, srcset entries, inline HTML.
export const WP_UPLOAD_RE =
  /(?:https?:)?\/\/(?:www\.)?ydministries\.ca\/wp-content\/uploads\/[^\s"'<>\\)\]]+/gi;

export type ManifestItem = {
  sourceUrl: string;
  publicUrl: string;
};

export type RewriteMaps = {
  byCanonical: Map<string, string>;
  byBasename: Map<string, string>;
};

export function canonicalize(url: string): string {
  let u = url;
  if (u.startsWith('//')) u = 'https:' + u;
  u = u.replace(/[.,;:!?]+$/g, '');
  const qi = u.indexOf('?');
  if (qi >= 0) u = u.slice(0, qi);
  const hi = u.indexOf('#');
  if (hi >= 0) u = u.slice(0, hi);
  u = u.replace(/^https?:\/\/www\./i, 'https://');
  u = u.replace(/^http:\/\//i, 'https://');
  return u;
}

export function basenameFromUrl(url: string): string {
  try {
    const path = decodeURIComponent(new URL(canonicalize(url)).pathname);
    return basename(path);
  } catch {
    return basename(url.split('?')[0]);
  }
}

export async function loadRewriteMaps(manifestPath: string): Promise<RewriteMaps> {
  const m = JSON.parse(await readFile(manifestPath, 'utf8')) as { items: ManifestItem[] };
  const byCanonical = new Map<string, string>();
  const byBasename = new Map<string, string>();
  for (const it of m.items) {
    byCanonical.set(canonicalize(it.sourceUrl), it.publicUrl);
    const bn = basenameFromUrl(it.sourceUrl);
    if (!byBasename.has(bn)) byBasename.set(bn, it.publicUrl);
  }
  return { byCanonical, byBasename };
}

export type RewriteCounters = {
  replacements: number;
  unmatched: Set<string>;
};

export function rewriteString(
  s: string,
  maps: RewriteMaps,
  counters: RewriteCounters,
): string {
  return s.replace(WP_UPLOAD_RE, (match) => {
    const canon = canonicalize(match);
    const exact = maps.byCanonical.get(canon);
    if (exact) {
      counters.replacements++;
      return exact;
    }
    const bn = basenameFromUrl(match);
    const fallback = maps.byBasename.get(bn);
    if (fallback) {
      counters.replacements++;
      return fallback;
    }
    counters.unmatched.add(canon);
    return match;
  });
}
