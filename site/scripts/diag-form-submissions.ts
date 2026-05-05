/**
 * Phase Y diagnostic — verify the form_submissions RLS policies are live.
 *
 *   1. Anon-key probe insert. Mirrors what the production /api/forms/submit
 *      handler does — if THIS works, the production handler will too.
 *   2. Service-role verifies the row landed (proves the INSERT actually
 *      went through, not a silent success).
 *   3. Service-role cleanup (delete probe row).
 *
 * pg_policies lives in pg_catalog so PostgREST can't read it. This
 * behavioural test is the cleanest way to confirm policy state from
 * the outside.
 *
 * Run with:  cd site && npx tsx scripts/diag-form-submissions.ts
 */
import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { resolve } from "node:path";

config({ path: resolve(process.cwd(), ".env.local") });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
if (!url || !anonKey || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL / ANON_KEY / SERVICE_ROLE_KEY");
  process.exit(1);
}

const anon = createClient(url, anonKey, { auth: { persistSession: false } });
const service = createClient(url, serviceKey, { auth: { persistSession: false } });

const PROBE_MARKER = `__diag-probe-${Date.now()}__`;

async function main() {
  console.log("\n── 1. Anon-key INSERT probe (mirrors production handler)");
  const insertRes = await anon
    .from("form_submissions")
    .insert({
      form_type: "contact",
      visitor_name: PROBE_MARKER,
      visitor_email: "diag@example.invalid",
      visitor_message: PROBE_MARKER,
      metadata: { source: "diag-form-submissions.ts" },
      status: "pending",
    })
    .select("id")
    .single();

  if (insertRes.error) {
    console.error("  ❌ anon INSERT FAILED");
    console.error("     code:", insertRes.error.code);
    console.error("     msg :", insertRes.error.message);
    console.error(
      "     hint:",
      insertRes.error.code === "42501"
        ? "RLS denied — INSERT policy missing or wrong role"
        : insertRes.error.code === "42P01"
          ? "table missing — migration not run"
          : insertRes.error.code === "PGRST301" || insertRes.error.code === "401"
            ? "401 — auth failure, anon key may be wrong"
            : "see Postgres docs",
    );
    process.exit(1);
  }
  console.log("  ✓ anon INSERT succeeded — policy 'Anyone submits form' is live");
  console.log("    inserted id:", insertRes.data.id);

  console.log("\n── 2. Service-role verifies the row landed");
  const readRes = await service
    .from("form_submissions")
    .select("id, form_type, visitor_name, status, created_at")
    .eq("id", insertRes.data.id)
    .maybeSingle();
  if (readRes.error || !readRes.data) {
    console.error("  ❌ service-role read failed:", readRes.error?.message);
    process.exit(1);
  }
  console.log("  ✓ row visible to service role:", readRes.data);

  console.log("\n── 3. Cleanup — service-role deletes the probe row");
  const delRes = await service
    .from("form_submissions")
    .delete()
    .eq("id", insertRes.data.id);
  if (delRes.error) {
    console.error("  ⚠ cleanup failed (probe row left in DB):", delRes.error.message);
  } else {
    console.log("  ✓ probe row deleted");
  }

  console.log("\n✓ form_submissions policies look correct.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
