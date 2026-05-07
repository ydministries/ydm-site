/**
 * Helpers for the structured `video_url` field on sermon (and future
 * blog/event) pages. Bishop pastes any common YouTube URL shape via
 * /admin/content; the template renders a privacy-enhanced embed.
 *
 * Privacy default: youtube-nocookie.com — no tracking cookies set
 * unless the user actually presses play.
 */

/**
 * Extract the 11-character YouTube video ID from any common URL form.
 * Returns null when no ID is found (caller should render no embed).
 *
 * Handled shapes:
 *   https://www.youtube.com/watch?v=ID
 *   https://www.youtube.com/watch?v=ID&t=30s
 *   https://youtu.be/ID
 *   https://youtu.be/ID?si=...
 *   https://www.youtube.com/embed/ID
 *   https://m.youtube.com/watch?v=ID
 *   https://www.youtube.com/shorts/ID
 *   https://www.youtube.com/v/ID
 */
export function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const re =
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:[^&]+&)*v=|embed\/|shorts\/|v\/))([A-Za-z0-9_-]{11})/;
  const m = url.trim().match(re);
  return m ? m[1] : null;
}

/**
 * Build the privacy-enhanced embed URL for an 11-character video ID.
 * Caller should pass the ID returned from `extractYouTubeId`, never raw
 * user input.
 */
export function youtubeEmbedUrl(videoId: string): string {
  return `https://www.youtube-nocookie.com/embed/${videoId}`;
}
