"use server";

import { revalidatePath } from "next/cache";
import { createServerClient } from "@/lib/supabase/server";
import { publicRouteForPageKey } from "@/lib/routeMap";

export type SaveResult = { ok: true } | { ok: false; error: string };

export interface SaveContentFieldInput {
  pageKey: string;
  fieldKey: string;
  newValue: string;
}

export async function saveContentField(
  input: SaveContentFieldInput,
): Promise<SaveResult> {
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

  const { data: existing, error: readErr } = await supabase
    .from("page_content")
    .select("value, value_type")
    .eq("page_key", input.pageKey)
    .eq("field_key", input.fieldKey)
    .maybeSingle();
  if (readErr) return { ok: false, error: readErr.message };
  if (!existing) return { ok: false, error: "Field not found" };

  if (existing.value === input.newValue) return { ok: true };

  const [updateRes, versionRes] = await Promise.all([
    supabase
      .from("page_content")
      .update({
        value: input.newValue,
        updated_at: new Date().toISOString(),
      })
      .eq("page_key", input.pageKey)
      .eq("field_key", input.fieldKey),
    supabase.from("content_versions").insert({
      page_key: input.pageKey,
      field_key: input.fieldKey,
      old_value: existing.value,
      new_value: input.newValue,
      value_type: existing.value_type,
      changed_by: user.id,
    }),
  ]);

  if (updateRes.error) return { ok: false, error: updateRes.error.message };
  if (versionRes.error) {
    console.warn(
      "[saveContentField] version insert failed (update succeeded):",
      versionRes.error.message,
    );
  }

  const route = publicRouteForPageKey(input.pageKey);
  if (route) {
    try {
      revalidatePath(route);
    } catch (e) {
      console.warn("[saveContentField] revalidatePath failed:", e);
    }
  }

  return { ok: true };
}

export interface RestoreContentVersionInput {
  versionId: string;
}

export async function restoreContentVersion(
  input: RestoreContentVersionInput,
): Promise<SaveResult> {
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

  const { data: version, error: vErr } = await supabase
    .from("content_versions")
    .select("page_key, field_key, old_value")
    .eq("id", input.versionId)
    .maybeSingle();
  if (vErr) return { ok: false, error: vErr.message };
  if (!version) return { ok: false, error: "Version not found" };
  if (version.old_value === null) {
    return {
      ok: false,
      error: "Cannot restore — no prior value to roll back to",
    };
  }

  // Reuse saveContentField so the restore creates its own audit row and
  // triggers the same revalidatePath behaviour.
  return saveContentField({
    pageKey: version.page_key,
    fieldKey: version.field_key,
    newValue: version.old_value,
  });
}
