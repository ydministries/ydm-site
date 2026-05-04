"use server";

import { revalidatePath } from "next/cache";
import { createServerClient } from "@/lib/supabase/server";
import { deleteFromR2, r2KeyFromPublicUrl } from "@/lib/r2-server";

export type DeleteResult = { ok: true } | { ok: false; error: string };

export interface DeleteAssetInput {
  assetKey: string;
  confirm: string;
}

export async function deleteAsset(
  input: DeleteAssetInput,
): Promise<DeleteResult> {
  if (input.confirm !== "DELETE") {
    return { ok: false, error: "Confirmation phrase mismatch" };
  }

  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in" };

  const { data: profile, error: profileErr } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (profileErr) return { ok: false, error: profileErr.message };
  if (!profile || !["admin", "bishop"].includes(profile.role)) {
    return { ok: false, error: "Forbidden" };
  }

  const { data: asset, error: fErr } = await supabase
    .from("assets")
    .select("storage_path")
    .eq("asset_key", input.assetKey)
    .maybeSingle();
  if (fErr) return { ok: false, error: fErr.message };
  if (!asset) return { ok: false, error: "Asset not found" };

  // Best-effort R2 delete. If the URL isn't on our public domain, or R2
  // returns NoSuchKey (already gone), we still proceed with the DB row delete
  // so the admin UI clears the orphan.
  const r2Key = r2KeyFromPublicUrl(asset.storage_path);
  if (r2Key) {
    try {
      await deleteFromR2(r2Key);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "R2 delete failed";
      console.warn("[deleteAsset] R2 delete warning:", msg);
    }
  }

  const { error: dErr } = await supabase
    .from("assets")
    .delete()
    .eq("asset_key", input.assetKey);
  if (dErr) return { ok: false, error: dErr.message };

  revalidatePath("/admin/assets");
  return { ok: true };
}
