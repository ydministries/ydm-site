/**
 * Phase S.5 fix — diagnose the `previous_value` insert error.
 *
 * Uses the service-role key to:
 *   1. probe the content_versions table to infer its actual columns
 *   2. attempt an insert that the trigger would mimic, surfacing the
 *      real Postgres error so we can pinpoint the offending object.
 *
 * Run with:  cd site && npx tsx scripts/diag-content-versions.ts
 */
import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { resolve } from "node:path";

config({ path: resolve(process.cwd(), ".env.local") });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}
const sb = createClient(url, serviceKey, {
  auth: { persistSession: false },
});

async function main() {
  console.log("\n── 1. content_versions: probe columns via select * limit 1");
  const probe = await sb.from("content_versions").select("*").limit(1);
  if (probe.error) {
    console.error("  select error:", probe.error.message);
  } else {
    const sample = probe.data?.[0];
    if (sample) {
      console.log("  columns from sample row:", Object.keys(sample).sort());
    } else {
      console.log("  table is empty — sending an INSERT probe to surface column shape via error");
    }
  }

  console.log("\n── 2. probe insert with our app's column names (old_value / new_value)");
  const ins1 = await sb.from("content_versions").insert({
    page_key: "__diag__",
    field_key: "__diag__",
    old_value: "before",
    new_value: "after",
    value_type: "text",
  });
  if (ins1.error) {
    console.error("  app-style insert error:", ins1.error.message);
  } else {
    console.log("  OK — old_value/new_value insert accepted. Cleaning up.");
    await sb
      .from("content_versions")
      .delete()
      .eq("page_key", "__diag__")
      .eq("field_key", "__diag__");
  }

  console.log("\n── 3. trigger an UPDATE on page_content to reproduce the runtime error");
  // Pick any existing row.
  const sampleRow = await sb
    .from("page_content")
    .select("page_key, field_key, value")
    .limit(1)
    .maybeSingle();
  if (!sampleRow.data) {
    console.error("  no page_content rows; skipping reproduction step");
  } else {
    const r = sampleRow.data;
    const newVal = r.value === "__probe__" ? "__probe2__" : "__probe__";
    const upd = await sb
      .from("page_content")
      .update({ value: newVal })
      .eq("page_key", r.page_key)
      .eq("field_key", r.field_key);
    if (upd.error) {
      console.error("  reproduced error on page_content UPDATE:", upd.error.message);
      console.error("  → confirms a TRIGGER on page_content writes to the missing column");
    } else {
      console.log("  no error reproduced. revert the value so this is a no-op.");
      await sb
        .from("page_content")
        .update({ value: r.value })
        .eq("page_key", r.page_key)
        .eq("field_key", r.field_key);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
