import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { uploadToR2, r2KeyForUpload } from "@/lib/r2-server";

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
];
const MAX_BYTES = 4 * 1024 * 1024;

export async function POST(req: NextRequest) {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const { data: profile, error: profileErr } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (profileErr) {
    return NextResponse.json({ error: profileErr.message }, { status: 500 });
  }
  if (!profile || !["admin", "bishop"].includes(profile.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file" }, { status: 400 });
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      {
        error: `Unsupported type: ${file.type}. Allowed: jpg, png, webp, gif, svg`,
      },
      { status: 400 },
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      {
        error: `File too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Max 4MB.`,
      },
      { status: 413 },
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const key = r2KeyForUpload(file.name);

  let publicUrl: string;
  try {
    publicUrl = await uploadToR2(buffer, key, file.type);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "R2 upload failed";
    console.error("[admin/assets/upload] R2 put failed:", msg);
    return NextResponse.json({ error: msg }, { status: 502 });
  }

  const assetKey = `admin.${user.id}.${Date.now()}`;
  const { error: insertErr } = await supabase.from("assets").insert({
    asset_key: assetKey,
    storage_path: publicUrl,
    mime_type: file.type,
    alt: null,
    caption: file.name,
  });
  if (insertErr) {
    return NextResponse.json({ error: insertErr.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, asset_key: assetKey, url: publicUrl });
}
