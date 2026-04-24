#!/usr/bin/env npx tsx
/**
 * validate-content.ts
 *
 * Two-pass validation:
 *   1. Syntactic — no JSX text literals > 3 chars in app/(site)/**
 *   2. DB — every fieldKey referenced in code exists in page_content
 *
 * Usage:
 *   npx tsx scripts/validate-content.ts           # full check (hits Supabase)
 *   npx tsx scripts/validate-content.ts --syntax   # syntax only (no DB)
 *
 * Exit code 0 = pass, 1 = failures found.
 */

import * as fs from "fs";
import * as path from "path";
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

// Load .env.local
config({ path: path.join(__dirname, "..", ".env.local") });

const SITE_DIR = path.join(__dirname, "..", "src", "app", "(site)");
const SYNTAX_ONLY = process.argv.includes("--syntax");

interface Violation {
  file: string;
  line: number;
  message: string;
}

interface FieldRef {
  fieldKey: string;
  file: string;
  line: number;
  listPrefix?: string;    // set when inside a validate:list-prefix scope
  isItemPrefix?: boolean; // set for itemPrefix="..." on EditableList
}

function findTsxFiles(dir: string): string[] {
  const results: string[] = [];
  if (!fs.existsSync(dir)) return results;

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findTsxFiles(full));
    } else if (entry.name.endsWith(".tsx")) {
      results.push(full);
    }
  }
  return results;
}

function extractFieldRefs(filePath: string): FieldRef[] {
  const refs: FieldRef[] = [];
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split("\n");
  const relPath = path.relative(process.cwd(), filePath);

  // Extract all fieldKey refs, detecting list scope from validate:list-prefix comments.
  // Scope rule: a validate:list-prefix="X" comment applies only to the NEXT line that
  // contains a <LinkList>, <TextList>, or <ContentBlockList> component.
  // All other fieldKey refs are treated as top-level.
  let pendingListPrefix: string | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;

    // Detect list-prefix hint
    const listMatch = line.match(/validate:list-prefix="([^"]+)"/);
    if (listMatch) {
      pendingListPrefix = listMatch[1];
      continue;
    }

    // If this line has a list component, the itemPrefix is list-scoped — skip fieldKey extraction
    // (the list wrapper reads itemPrefix, not fieldKey)
    if (
      pendingListPrefix &&
      (line.includes("<LinkList") || line.includes("<TextList") || line.includes("<ContentBlockList"))
    ) {
      // Extract itemPrefix for validation
      const ipMatch = line.match(/itemPrefix="([^"]+)"/);
      if (ipMatch) {
        refs.push({
          fieldKey: ipMatch[1],
          file: relPath,
          line: lineNum,
          isItemPrefix: true,
        });
      }
      pendingListPrefix = null;
      continue;
    }

    // If we had a pending prefix but this line isn't a list component, clear it
    if (pendingListPrefix && !line.trim().startsWith("{/*")) {
      pendingListPrefix = null;
    }

    // Extract fieldKey references from this line
    const fieldKeyPattern = /fieldKey="([^"]*)"/g;
    let fkMatch;
    while ((fkMatch = fieldKeyPattern.exec(line)) !== null) {
      const rawKey = fkMatch[1];
      refs.push({ fieldKey: rawKey, file: relPath, line: lineNum });
    }

    // Also extract standalone itemPrefix references
    if (line.includes("itemPrefix=") && !line.includes("<LinkList") && !line.includes("<TextList") && !line.includes("<ContentBlockList")) {
      const ipMatch = line.match(/itemPrefix="([^"]+)"/);
      if (ipMatch) {
        refs.push({
          fieldKey: ipMatch[1],
          file: relPath,
          line: lineNum,
          isItemPrefix: true,
        });
      }
    }
  }
  return refs;
}

function checkSyntax(filePath: string): Violation[] {
  const violations: Violation[] = [];
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split("\n");
  const relPath = path.relative(process.cwd(), filePath);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;

    // Check for JSX text literals > 3 chars between > and <
    const textMatch = line.match(/>\s*([^<>{}"'`]+?)\s*</);
    if (textMatch) {
      const text = textMatch[1].trim();
      if (text.length > 3 && !text.startsWith("{") && !text.startsWith("[")) {
        violations.push({
          file: relPath,
          line: lineNum,
          message: `JSX text literal: "${text.slice(0, 50)}"`,
        });
      }
    }
  }

  return violations;
}

interface DbRow {
  page_key: string;
  field_key: string;
}

async function fetchAllKeys(): Promise<{ keys: Set<string>; rows: DbRow[] }> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    console.warn(
      "⚠ NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set — skipping DB check"
    );
    return { keys: new Set(), rows: [] };
  }

  const supabase = createClient(url, key);

  const { data, error } = await supabase
    .from("page_content")
    .select("page_key, field_key");

  if (error) {
    console.error("Failed to fetch page_content:", error.message);
    process.exit(1);
  }

  // Build composite keys: "page_key:field_key"
  // Also build field_key-only set since page components use bare field_keys
  // within a ContentProvider that scopes to a page_key
  const keys = new Set<string>();
  for (const row of data ?? []) {
    keys.add(row.field_key);
    keys.add(`${row.page_key}:${row.field_key}`);
  }
  return { keys, rows: (data ?? []) as DbRow[] };
}

// ── Main ──

async function main() {
  const files = findTsxFiles(SITE_DIR);
  const allViolations: Violation[] = [];

  // Pass 1: Syntax check
  for (const file of files) {
    allViolations.push(...checkSyntax(file));
  }

  // Pass 2: DB key check
  if (!SYNTAX_ONLY) {
    const { keys: dbKeys, rows: allDbRows } = await fetchAllKeys();

    if (dbKeys.size > 0) {
      // Build a sub-key index for list validation: prefix → Set<subKey>
      const listSubKeys = new Map<string, Set<string>>();
      for (const row of allDbRows) {
        // Match patterns like "beliefs.item1.title" or "cta.1.href"
        const m = row.field_key.match(/^(.+?)\.(?:item)?\d+\.(.+)$/);
        if (m) {
          const [, prefix, subKey] = m;
          if (!listSubKeys.has(prefix)) listSubKeys.set(prefix, new Set());
          listSubKeys.get(prefix)!.add(subKey);
        }
      }

      for (const file of files) {
        const refs = extractFieldRefs(file);
        for (const ref of refs) {
          // itemPrefix — just check that any rows with this prefix exist
          if (ref.isItemPrefix) {
            if (listSubKeys.has(ref.fieldKey)) continue;
            // Also check with "item" prefix pattern
            const hasAny = [...dbKeys].some((k) =>
              k.match(new RegExp(`^${ref.fieldKey.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\.(?:item)?\\d+\\.`))
            );
            if (hasAny) continue;
            allViolations.push({
              file: ref.file,
              line: ref.line,
              message: `itemPrefix "${ref.fieldKey}" has no matching rows in page_content`,
            });
            continue;
          }

          // List-scoped fieldKey — check against the sub-key index
          if (ref.listPrefix) {
            const subs = listSubKeys.get(ref.listPrefix);
            if (subs) {
              // Direct sub-key match
              if (ref.fieldKey === "" || subs.has(ref.fieldKey)) continue;
              // EditableLink inside list: empty fieldKey resolves to .href/.label
              if (ref.fieldKey === "" && subs.has("href") && subs.has("label")) continue;
              // Link pair: fieldKey is a sub-prefix with .href + .label
              if (subs.has(`${ref.fieldKey}.href`) && subs.has(`${ref.fieldKey}.label`)) continue;
            }
            allViolations.push({
              file: ref.file,
              line: ref.line,
              message: `fieldKey "${ref.fieldKey}" not found under any ${ref.listPrefix}.<n>.* in page_content`,
            });
            continue;
          }

          // Direct match
          if (dbKeys.has(ref.fieldKey)) continue;
          // EditableLink pattern: fieldKey is a prefix, DB has .href + .label
          if (
            dbKeys.has(`${ref.fieldKey}.href`) &&
            dbKeys.has(`${ref.fieldKey}.label`)
          ) continue;

          allViolations.push({
            file: ref.file,
            line: ref.line,
            message: `fieldKey "${ref.fieldKey}" not found in page_content table`,
          });
        }
      }
      console.log(`  DB: ${dbKeys.size} keys loaded from page_content`);
    }
  }

  // Report
  if (allViolations.length > 0) {
    console.error(
      `\n❌ Content validation failed (${allViolations.length} issues):\n`
    );
    for (const v of allViolations) {
      console.error(`  ${v.file}:${v.line} — ${v.message}`);
    }
    process.exit(1);
  } else {
    console.log(
      `✓ Content validation passed (${files.length} files, ${SYNTAX_ONLY ? "syntax only" : "syntax + DB"})`
    );
    process.exit(0);
  }
}

main();
