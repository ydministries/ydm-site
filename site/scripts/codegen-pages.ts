#!/usr/bin/env npx tsx
/**
 * codegen-pages.ts — Step 5 of the migration guide.
 *
 * Reads content-map.json + site-map.json and emits skeleton page.tsx files
 * for every page_key. Zero styling. Every visible string is an Editable* primitive.
 */

import * as fs from "fs";
import * as path from "path";

// ── Paths ──
const ROOT = path.join(__dirname, "..", "..");
const CONTENT_MAP_PATH = path.join(ROOT, "archive/wordpress/scrape/content-map.json");
const SITE_MAP_PATH = path.join(ROOT, "archive/wordpress/scrape/site-map.json");
const APP_DIR = path.join(__dirname, "..", "src", "app", "(site)");

// ── Load inputs ──
const contentMap: Record<string, unknown> = JSON.parse(
  fs.readFileSync(CONTENT_MAP_PATH, "utf-8")
);
const siteMapRaw = JSON.parse(fs.readFileSync(SITE_MAP_PATH, "utf-8"));
const siteMapPages: Array<{ slug: string; url: string; title?: string }> =
  siteMapRaw.pages ?? [];

// ── Build slug → URL lookup ──
const slugToUrl = new Map<string, string>();
for (const p of siteMapPages) {
  const urlPath = new URL(p.url).pathname.replace(/\/$/, "") || "/";
  if (!slugToUrl.has(p.slug)) {
    slugToUrl.set(p.slug, urlPath);
  }
}

// ── URL overrides: WP routes we want to clean up for Next.js ──
const URL_OVERRIDES: Record<string, string> = {
  "about": "/about",
  "blog_page": "/blog",
  "contact": "/contact",
  "events_page": "/events",
  "latest_sermons": "/sermons",
  "our_campaigns": "/campaigns",
  "our_ministries": "/ministries",
  "our_team": "/team",
  "prayer_requests": "/prayer",
  "profile.bishopwilson": "/team/bishop-wilson",
  "profile.clementinawilson": "/team/clementina-wilson",
  "singleton.ask": "/ask",
  "singleton.gallery": "/gallery",
  "singleton.huel_clementina": "/huel-clementina",
  "singleton.huelwilsonbio": "/bishop-wilson-bio",
  "singleton.live": "/live",
  "singleton.maltoncog": "/malton-cog",
};

// ── Summary tracking ──
const summary = {
  created: [] as string[],
  skipped: [] as string[],
  derivedUrls: [] as string[],
  genericFields: [] as { pageKey: string; fieldKey: string }[],
  editableListStubs: [] as { pageKey: string; prefix: string; count: number }[],
};

// ── Helpers ──

interface FieldInfo {
  fieldKey: string;
  type: string;
  value: unknown;
}

function resolveUrl(pageKey: string, alias?: string): string {
  if (URL_OVERRIDES[pageKey]) return URL_OVERRIDES[pageKey];

  // Try alias from content-map
  if (alias && slugToUrl.has(alias)) return slugToUrl.get(alias)!;

  // Try page_key variations
  const slugVariants = [
    pageKey,
    pageKey.replace(/\./g, "/"),
    pageKey.replace(/_/g, "-"),
    pageKey.replace(/_/g, "-").replace(/\./g, "/"),
  ];
  for (const s of slugVariants) {
    if (slugToUrl.has(s)) return slugToUrl.get(s)!;
  }

  // Derive from page_key
  const derived = "/" + pageKey.replace(/\./g, "/").replace(/_/g, "-");
  summary.derivedUrls.push(`${pageKey} → ${derived}`);
  return derived;
}

function pascalCase(s: string): string {
  return s
    .replace(/[._-]/g, " ")
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join("");
}

function collectFields(obj: Record<string, unknown>): FieldInfo[] {
  const fields: FieldInfo[] = [];
  for (const [key, val] of Object.entries(obj)) {
    if (key.startsWith("_")) continue; // skip meta keys
    if (typeof val === "object" && val !== null && "type" in val) {
      fields.push({
        fieldKey: key,
        type: (val as unknown as { type: string }).type,
        value: (val as unknown as { value: unknown }).value,
      });
    }
  }
  return fields;
}

function groupBySectionPrefix(fields: FieldInfo[]): Map<string, FieldInfo[]> {
  const groups = new Map<string, FieldInfo[]>();
  for (const f of fields) {
    const prefix = f.fieldKey.split(".")[0];
    if (!groups.has(prefix)) groups.set(prefix, []);
    groups.get(prefix)!.push(f);
  }
  return groups;
}

function detectLinkPairs(fields: FieldInfo[]): Set<string> {
  const consumed = new Set<string>();
  const byPrefix = new Map<string, string[]>();
  for (const f of fields) {
    if (f.fieldKey.endsWith(".href") || f.fieldKey.endsWith(".label")) {
      const prefix = f.fieldKey.replace(/\.(href|label)$/, "");
      if (!byPrefix.has(prefix)) byPrefix.set(prefix, []);
      byPrefix.get(prefix)!.push(f.fieldKey);
    }
  }
  for (const [prefix, keys] of byPrefix) {
    if (keys.some((k) => k.endsWith(".href")) && keys.some((k) => k.endsWith(".label"))) {
      consumed.add(`${prefix}.href`);
      consumed.add(`${prefix}.label`);
    }
  }
  return consumed;
}

function detectRepeatingBlocks(fields: FieldInfo[]): Map<string, Map<string, FieldInfo[]>> {
  const repeating = new Map<string, Map<string, FieldInfo[]>>();
  for (const f of fields) {
    const parts = f.fieldKey.split(".");
    // Look for pattern: prefix.N.sub or prefix.itemN.sub
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i + 1];
      if (/^(item)?\d+$/.test(part) || /^item\d+$/.test(part)) {
        const prefix = parts.slice(0, i + 1).join(".");
        const index = part;
        const sub = parts.slice(i + 2).join(".");
        if (!repeating.has(prefix)) repeating.set(prefix, new Map());
        const items = repeating.get(prefix)!;
        if (!items.has(index)) items.set(index, []);
        items.get(index)!.push({ ...f, fieldKey: sub || f.fieldKey });
        break;
      }
    }
  }
  return repeating;
}

function emitFieldJsx(f: FieldInfo, linkPairs: Set<string>, indent: string): string | null {
  if (f.fieldKey.startsWith("seo.") || f.fieldKey.startsWith("meta.")) return null;
  if (linkPairs.has(f.fieldKey)) return null; // consumed by link pair

  // Link pair — emit EditableLink
  if (f.fieldKey.endsWith(".label") && linkPairs.has(f.fieldKey)) return null;
  const linkPrefix = f.fieldKey.replace(/\.(href|label)$/, "");
  if (
    f.fieldKey.endsWith(".href") &&
    !linkPairs.has(f.fieldKey)
  ) {
    return null; // standalone URL, skip
  }

  switch (f.type) {
    case "text":
      if (f.fieldKey.endsWith(".title") || f.fieldKey.endsWith(".heading")) {
        return `${indent}<EditableContent fieldKey="${f.fieldKey}" as="h2" />`;
      }
      return `${indent}<EditableContent fieldKey="${f.fieldKey}" as="p" />`;

    case "richtext":
    case "html":
    case "markdown":
      return `${indent}<EditableRichText fieldKey="${f.fieldKey}" />`;

    case "asset_key":
      return `${indent}<EditableImage fieldKey="${f.fieldKey}" />`;

    case "url":
      return null; // standalone URLs are consumed by link pairs or skipped

    case "number":
    case "date":
      return `${indent}<EditableContent fieldKey="${f.fieldKey}" as="span" /> {/* TODO: format ${f.type} */}`;

    case "email":
    case "phone":
      return `${indent}<EditableContent fieldKey="${f.fieldKey}" as="p" />`;

    default:
      summary.genericFields.push({ pageKey: "", fieldKey: f.fieldKey });
      return `${indent}<EditableContent fieldKey="${f.fieldKey}" as="p" />`;
  }
}

// ── Page emitter ──

function emitPage(pageKey: string, fields: FieldInfo[], url: string): string {
  const componentName = pascalCase(pageKey) + "Page";
  const sections = groupBySectionPrefix(fields);
  const linkPairs = detectLinkPairs(fields);
  const repeating = detectRepeatingBlocks(fields);

  // Track which fields are part of repeating blocks
  const repeatingFieldKeys = new Set<string>();
  for (const [prefix, items] of repeating) {
    for (const [idx, subFields] of items) {
      for (const sf of subFields) {
        repeatingFieldKeys.add(`${prefix}.${idx}.${sf.fieldKey}`);
        // Also mark the original compound key
        for (const f of fields) {
          if (f.fieldKey.startsWith(`${prefix}.${idx}`)) {
            repeatingFieldKeys.add(f.fieldKey);
          }
        }
      }
    }
  }

  // Determine which imports are needed
  const needsRichText = fields.some(
    (f) => ["richtext", "html", "markdown"].includes(f.type) && !f.fieldKey.startsWith("seo.") && !f.fieldKey.startsWith("meta.")
  );
  const needsImage = fields.some(
    (f) => f.type === "asset_key" && !f.fieldKey.startsWith("seo.") && !f.fieldKey.startsWith("meta.")
  );
  const needsLink = linkPairs.size > 0;

  // Build imports
  const imports = [
    `// GENERATED by scripts/codegen-pages.ts — do not hand-edit unless you also update codegen`,
    `import type { Metadata } from "next";`,
    `import { fetchPageContent, fetchAssets } from "@/lib/content";`,
    `import { ContentProviderWrapper } from "@/components/ContentProviderWrapper";`,
    `import { AssetProviderWrapper } from "@/components/AssetProviderWrapper";`,
    `import { EditableContent } from "@/components/EditableContent";`,
  ];
  if (needsRichText) imports.push(`import { EditableRichText } from "@/components/EditableRichText";`);
  if (needsImage) imports.push(`import { EditableImage } from "@/components/EditableImage";`);
  if (needsLink) imports.push(`import { EditableLink } from "@/components/EditableLink";`);

  // Build section JSX
  const sectionJsx: string[] = [];
  for (const [sectionName, sectionFields] of sections) {
    if (sectionName === "seo" || sectionName === "meta") continue;

    sectionJsx.push(`        {/* section: ${sectionName} */}`);
    sectionJsx.push(`        <section>`);

    // Check for repeating blocks in this section
    const sectionRepeating = new Map<string, Map<string, FieldInfo[]>>();
    for (const [prefix, items] of repeating) {
      if (prefix === sectionName || prefix.startsWith(sectionName + ".")) {
        sectionRepeating.set(prefix, items);
      }
    }

    if (sectionRepeating.size > 0) {
      for (const [prefix, items] of sectionRepeating) {
        const itemCount = items.size;
        summary.editableListStubs.push({ pageKey, prefix, count: itemCount });
        sectionJsx.push(
          `          {/* TODO: EditableList not yet implemented — ${itemCount} repeating items under "${prefix}" */}`
        );
        // Still emit each item individually so content renders
        for (const [idx, subFields] of items) {
          for (const sf of subFields) {
            const fullKey = `${prefix}.${idx}.${sf.fieldKey}`;
            const originalField = fields.find((f) => f.fieldKey === fullKey);
            if (originalField) {
              const jsx = emitFieldJsx(originalField, linkPairs, "          ");
              if (jsx) sectionJsx.push(jsx);
            }
          }
        }
      }
    }

    // Emit non-repeating fields
    // Emit link pairs first
    const emittedLinkPrefixes = new Set<string>();
    for (const f of sectionFields) {
      if (repeatingFieldKeys.has(f.fieldKey)) continue;
      if (f.fieldKey.startsWith("seo.") || f.fieldKey.startsWith("meta.")) continue;

      const lp = f.fieldKey.replace(/\.(href|label)$/, "");
      if (
        (f.fieldKey.endsWith(".href") || f.fieldKey.endsWith(".label")) &&
        linkPairs.has(`${lp}.href`) &&
        linkPairs.has(`${lp}.label`)
      ) {
        if (!emittedLinkPrefixes.has(lp)) {
          emittedLinkPrefixes.add(lp);
          sectionJsx.push(`          <EditableLink fieldKey="${lp}" />`);
        }
        continue;
      }

      const jsx = emitFieldJsx(f, linkPairs, "          ");
      if (jsx) sectionJsx.push(jsx);
    }

    sectionJsx.push(`        </section>`);
  }

  const body = `${imports.join("\n")}

const PAGE_KEY = "${pageKey}";

export async function generateMetadata(): Promise<Metadata> {
  const [page, global] = await Promise.all([
    fetchPageContent(PAGE_KEY),
    fetchPageContent("global"),
  ]);
  const siteName = global.get("site_name")?.value ?? "Yeshua Deliverance Ministries";
  const title = page.get("seo.title")?.value ?? global.get("seo.title")?.value ?? "";
  const description = page.get("seo.description")?.value ?? global.get("seo.description")?.value ?? "";
  return {
    title,
    description,
    openGraph: { title, description, siteName },
  };
}

export default async function ${componentName}() {
  const [content, assets] = await Promise.all([
    fetchPageContent(PAGE_KEY),
    fetchAssets(PAGE_KEY + "."),
  ]);
  const contentEntries = Array.from(content.values());
  const assetEntries = Array.from(assets.values());

  return (
    <ContentProviderWrapper pageKey={PAGE_KEY} entries={contentEntries}>
      <AssetProviderWrapper entries={assetEntries}>
${sectionJsx.length > 0 ? sectionJsx.join("\n") : "        {/* No renderable fields — SEO-only page. Add content rows to page_content to populate. */}\n        <section />"}
      </AssetProviderWrapper>
    </ContentProviderWrapper>
  );
}
`;

  return body;
}

// ── Main ──

function main() {
  console.log("codegen-pages: starting...\n");

  // Collect all page_keys and their fields from content-map
  const pages: Array<{ pageKey: string; fields: FieldInfo[]; alias?: string }> = [];

  for (const [key, val] of Object.entries(contentMap)) {
    if (key === "_meta" || key === "global" || key === "home") continue;

    const obj = val as Record<string, unknown>;
    const alias = obj._page_key_alias as string | undefined;

    // Check if this is a template parent (sub-pages are objects, not {type, value})
    const directFields = collectFields(obj);

    if (directFields.length > 0) {
      // Top-level page with direct fields
      pages.push({ pageKey: key, fields: directFields, alias });
    }

    // Check for sub-pages
    for (const [subKey, subVal] of Object.entries(obj)) {
      if (subKey.startsWith("_")) continue;
      if (typeof subVal === "object" && subVal !== null && !("type" in subVal)) {
        // This is a sub-page object
        const subFields = collectFields(subVal as Record<string, unknown>);
        if (subFields.length > 0) {
          const subPageKey = `${key}.${subKey}`;
          const subAlias = (subVal as Record<string, unknown>)._page_key_alias as string | undefined;
          pages.push({ pageKey: subPageKey, fields: subFields, alias: subAlias });
        }
      }
    }
  }

  console.log(`Found ${pages.length} pages to process (excluding global + home)\n`);

  for (const { pageKey, fields, alias } of pages) {
    const url = resolveUrl(pageKey, alias);
    const filePath = path.join(APP_DIR, url, "page.tsx");

    // Skip existing files
    if (fs.existsSync(filePath)) {
      summary.skipped.push(`${pageKey} → ${url} (file exists)`);
      console.log(`  SKIP  ${pageKey} → ${url} (already exists)`);
      continue;
    }

    // Set pageKey context for generic field tracking
    for (const gf of summary.genericFields) {
      if (!gf.pageKey) gf.pageKey = pageKey;
    }

    const code = emitPage(pageKey, fields, url);

    // Create directory and write
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, code, "utf-8");
    summary.created.push(`${pageKey} → ${url}`);
    console.log(`  CREATE  ${pageKey} → ${url} (${fields.length} fields)`);
  }

  // ── Summary ──
  console.log("\n═══ CODEGEN SUMMARY ═══\n");
  console.log(`Created: ${summary.created.length}`);
  for (const c of summary.created) console.log(`  ✓ ${c}`);

  if (summary.skipped.length > 0) {
    console.log(`\nSkipped: ${summary.skipped.length}`);
    for (const s of summary.skipped) console.log(`  ⊘ ${s}`);
  }

  if (summary.derivedUrls.length > 0) {
    console.log(`\nDerived URLs (no site-map match): ${summary.derivedUrls.length}`);
    for (const d of summary.derivedUrls) console.log(`  ⚠ ${d}`);
  }

  if (summary.genericFields.length > 0) {
    console.log(`\nGeneric fallthrough fields: ${summary.genericFields.length}`);
    for (const g of summary.genericFields) console.log(`  ? ${g.pageKey}: ${g.fieldKey}`);
  }

  if (summary.editableListStubs.length > 0) {
    console.log(`\nEditableList stubs (need implementation): ${summary.editableListStubs.length}`);
    for (const e of summary.editableListStubs)
      console.log(`  📋 ${e.pageKey}: "${e.prefix}" (${e.count} items)`);
  }
}

main();
