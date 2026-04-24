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
  const relPath = path.relative(process.cwd(), filePath);

  const pattern = /fieldKey="([^"]+)"/g;
  let match;
  while ((match = pattern.exec(content)) !== null) {
    const lineNum = content.slice(0, match.index).split("\n").length;
    refs.push({ fieldKey: match[1], file: relPath, line: lineNum });
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

async function fetchAllKeys(): Promise<Set<string>> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    console.warn(
      "⚠ NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set — skipping DB check"
    );
    return new Set();
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
  return keys;
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
    const dbKeys = await fetchAllKeys();

    if (dbKeys.size > 0) {
      for (const file of files) {
        const refs = extractFieldRefs(file);
        for (const ref of refs) {
          if (!dbKeys.has(ref.fieldKey)) {
            allViolations.push({
              file: ref.file,
              line: ref.line,
              message: `fieldKey "${ref.fieldKey}" not found in page_content table`,
            });
          }
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
