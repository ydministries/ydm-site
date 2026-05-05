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
 * its layout. Widen here (e.g. iframe for YouTube embeds) when we need it,
 * not at every caller.
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
