/**
 * Cloudflare R2 server-side upload helpers.
 *
 * Reuses the env conventions established in scripts/migrate-media-to-r2.ts:
 *   R2_ENDPOINT (full URL, falls back to https://<account>.r2.cloudflarestorage.com),
 *   R2_BUCKET_NAME, R2_PUBLIC_URL, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY,
 *   R2_ACCOUNT_ID.
 *
 * Server-only — do NOT import from a client component (it would leak the
 * secret access key into the browser bundle).
 */
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const BUCKET = process.env.R2_BUCKET_NAME ?? "ydm-media";
const PUBLIC_URL =
  (process.env.R2_PUBLIC_URL ?? "https://media.ydministries.ca").replace(
    /\/$/,
    "",
  );
const ENDPOINT =
  process.env.R2_ENDPOINT ??
  (ACCOUNT_ID ? `https://${ACCOUNT_ID}.r2.cloudflarestorage.com` : undefined);

let _client: S3Client | null = null;
function client(): S3Client {
  if (_client) return _client;
  if (!ENDPOINT) {
    throw new Error(
      "R2 endpoint not configured. Set R2_ENDPOINT or R2_ACCOUNT_ID.",
    );
  }
  _client = new S3Client({
    region: "auto",
    endpoint: ENDPOINT,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
  });
  return _client;
}

export async function uploadToR2(
  buffer: Buffer,
  key: string,
  contentType: string,
): Promise<string> {
  await client().send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );
  return `${PUBLIC_URL}/${key}`;
}

export function r2KeyForUpload(filename: string): string {
  const ext = (filename.split(".").pop() ?? "bin").toLowerCase().slice(0, 8);
  const uuid = crypto.randomUUID();
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  return `uploads/admin/${yyyy}/${mm}/${uuid}.${ext}`;
}
