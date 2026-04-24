/**
 * Cloudflare R2 media helpers.
 *
 * All media lives in the `ydm-media` R2 bucket, served publicly via
 * https://media.ydministries.ca. Supabase Storage is NOT used for media.
 */

const R2_PUBLIC_URL =
  process.env.R2_PUBLIC_URL ?? "https://media.ydministries.ca";

/**
 * Build a public URL for an R2 object.
 * @param path — object key within the bucket, e.g. "sermons/filename.mp3"
 */
export function r2Url(path: string): string {
  const clean = path.startsWith("/") ? path.slice(1) : path;
  return `${R2_PUBLIC_URL}/${clean}`;
}

/**
 * Build a sermon audio URL.
 */
export function sermonAudioUrl(filename: string): string {
  return r2Url(`sermons/${filename}`);
}
