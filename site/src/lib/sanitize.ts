import sanitizeHtmlLib from "sanitize-html";

/**
 * Pure-JS HTML sanitizer for content coming out of the DB.
 *
 * Replaces the previous isomorphic-dompurify + jsdom chain (which broke
 * in Phase Y when @exodus/bytes flipped to ESM-only and the SSR import
 * failed). sanitize-html has no DOM dependency — it walks the parse tree
 * directly — so it works in Node, Edge, and the browser without any
 * environment shim.
 *
 * Allowlist: sanitize-html's strong defaults plus `<img>`, with class /
 * id / style permitted on every tag so migrated WordPress markup keeps
 * its layout.
 *
 * `<iframe>` is INTENTIONALLY NOT in the allowlist (Phase YY decision —
 * audit Warning #13). Video embedding uses the structured `video_url`
 * field on sermon (and future blog/event) pages, with the template
 * rendering a hardcoded youtube-nocookie.com iframe. This avoids the XSS
 * surface of permitting user-supplied iframe HTML and gives Bishop a
 * simpler UX (paste a URL, not an HTML embed code).
 *
 * If iframe support for ad-hoc embeds becomes a real need beyond
 * structured fields, widen here with strict per-host URL allow-listing
 * (only youtube-nocookie.com, vimeo.com, biblegateway.com, etc.).
 * Don't blanket-allow iframes.
 */
const OPTIONS: sanitizeHtmlLib.IOptions = {
  allowedTags: [...sanitizeHtmlLib.defaults.allowedTags, "img"],
  allowedAttributes: {
    ...sanitizeHtmlLib.defaults.allowedAttributes,
    "*": ["class", "id", "style"],
  },
};

export function sanitizeHtml(dirty: string): string {
  return sanitizeHtmlLib(dirty, OPTIONS);
}
