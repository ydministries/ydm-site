#!/usr/bin/env python3
"""
extract_pass_1b.py  —  Pass 1b of the YDM content-map extractor.

Pass 1a (manual, already shipped):
  global.* + 10 singleton top-level pages (home, about, contact, etc.)

Pass 1b (this script):
  Custom post types + remaining singletons:
    - ministries/*       →  ministry.<slug>.*
    - event/*            →  event.<slug>.*
    - campaigns/*        →  campaign.<slug>.*
    - cmsms_profile/*    →  profile.<slug>.*
    - blog posts (free-standing slug pages, sermon-style) → sermon.<slug>.*
    - remaining singletons (aboutydm, huelwilsonbio, maltoncog, gallery, guestbook,
      live, ask, events-page, blog-page, our-team) → one namespace each

Approach:
  1. Walk archive/wordpress/scrape/pages/*.json
  2. Skip media files (wp-content_*) and junk URLs (popups, anchors, elementor-action)
  3. Build a global frequency counter over all paragraphs/buttons/headings
  4. For each real page, emit only strings that are either:
       - page-unique (freq == 1), or
       - appear on ≤ 5 pages (likely widget content, kept with note)
     Anything on ≥ 6 pages is global chrome — already in Pass 1a, skip.
  5. Emit one content-map-pass-1b.json at the scrape root.
  6. Also write a review doc content-map-pass-1b-review.md grouping pages for Mikey.

Run:
  cd archive/wordpress/scrape/scripts
  python3 extract_pass_1b.py

Output:
  archive/wordpress/scrape/content-map-pass-1b.json
  archive/wordpress/scrape/content-map-pass-1b-review.md
"""
from __future__ import annotations
import json
import os
import re
import sys
from collections import Counter
from pathlib import Path

# ---------- paths ----------
HERE = Path(__file__).resolve().parent
SCRAPE_ROOT = HERE.parent                    # archive/wordpress/scrape/
PAGES_DIR = SCRAPE_ROOT / "pages"
OUT_JSON = SCRAPE_ROOT / "content-map-pass-1b.json"
OUT_REVIEW = SCRAPE_ROOT / "content-map-pass-1b-review.md"

# ---------- filtering ----------
CHROME_THRESHOLD = 6       # ≥ 6 pages = global chrome, skip
MEDIA_PREFIX = "wp-content_"
JUNK_PATTERNS = ("#cmsmasters", "#elementor-action", "#", "%", "elementor-action")

# Pages covered by Pass 1a — skip them here
PASS_1A_SLUGS = {
    "home", "about-us", "aboutydm", "contact", "prayer-requests",
    "our-ministries", "our-team", "events-page", "latest-sermons",
    "our-campaigns", "blog-page",
}

# Explicit drops per PLAN.md §8.6 (no /home-two, /home-three, no guestbook)
DROP_SLUGS = {
    "home-two", "home-three", "guestbook", "blog-page",  # blog-page lives in Pass 1a
}

# Blog posts don't have a CPT prefix in their filename — they look like plain slugs.
# Anything that isn't in another bucket and is a real page is treated as sermon.<slug>.
KNOWN_SINGLETONS = {
    "aboutydm", "huelwilsonbio", "huel-clementina", "maltoncog",
    "gallery", "live", "ask", "events-page", "blog-page", "our-team",
}

# ---------- helpers ----------
def slug_to_key(slug: str) -> str:
    """Turn a slug segment into a dotted-key-safe identifier."""
    s = slug.lower().replace("-", "_").replace("/", ".")
    s = re.sub(r"[^a-z0-9._]", "", s)
    return s

def classify(slug: str, filename: str) -> tuple[str, str] | None:
    """
    Return (namespace, instance_key) or None to skip.
    namespace ∈ {ministry, event, campaign, profile, sermon, singleton, skip}
    """
    if slug in DROP_SLUGS:
        return None
    if slug in PASS_1A_SLUGS:
        return None
    if filename.startswith(MEDIA_PREFIX):
        return None
    # junk anchors / Elementor actions end up with weird filenames
    if any(p in filename for p in JUNK_PATTERNS):
        return None

    parts = slug.strip("/").split("/")
    first = parts[0] if parts else ""
    rest = ".".join(parts[1:]) if len(parts) > 1 else parts[0] if parts else ""

    if first == "ministries" and len(parts) > 1:
        return ("ministry", slug_to_key(parts[1]))
    if first == "event" and len(parts) > 1:
        return ("event", slug_to_key(parts[1]))
    if first == "campaigns" and len(parts) > 1:
        return ("campaign", slug_to_key(parts[1]))
    if first == "cmsms_profile" and len(parts) > 1:
        return ("profile", slug_to_key(parts[1]))
    if first in ("category", "author", "tag"):
        return None  # WordPress archive pages, not content

    if slug in KNOWN_SINGLETONS:
        return ("singleton", slug_to_key(slug))

    # Everything else that's a single-segment slug → treat as sermon/blog post.
    if len(parts) == 1 and parts[0]:
        # Some of these are still junk (popups, tracking) — skip if obviously not a post
        if parts[0].startswith(("cmsmasters", "elementor")):
            return None
        return ("sermon", slug_to_key(parts[0]))

    return None

def load_page(path: Path) -> dict | None:
    try:
        with path.open() as f:
            return json.load(f)
    except Exception as e:
        print(f"  !! skip {path.name}: {e}", file=sys.stderr)
        return None

def norm(s: str) -> str:
    return s.strip() if isinstance(s, str) else ""

# ---------- main extraction ----------
def main():
    if not PAGES_DIR.exists():
        print(f"Missing {PAGES_DIR}", file=sys.stderr)
        sys.exit(1)

    # Phase 1: load all pages + collect frequency stats
    all_files = sorted(PAGES_DIR.glob("*.json"))
    pages: list[tuple[Path, dict, tuple[str, str]]] = []
    para_freq: Counter[str] = Counter()
    btn_freq: Counter[tuple[str, str]] = Counter()
    h2_freq: Counter[str] = Counter()
    h3_freq: Counter[str] = Counter()

    for path in all_files:
        data = load_page(path)
        if not data:
            continue
        slug = data.get("slug", "")
        cls = classify(slug, path.name)
        if cls is None:
            continue
        pages.append((path, data, cls))
        for p in data.get("paragraphs", []):
            s = norm(p)
            if s: para_freq[s] += 1
        for b in data.get("buttons", []):
            if isinstance(b, dict):
                key = (norm(b.get("text", "")).lower(), norm(b.get("href", "")))
                if key[0]: btn_freq[key] += 1
        headings = data.get("headings", {}) or {}
        for h in headings.get("h2", []) or []:
            s = norm(h)
            if s: h2_freq[s] += 1
        for h in headings.get("h3", []) or []:
            s = norm(h)
            if s: h3_freq[s] += 1

    print(f"Classified {len(pages)} pages for Pass 1b extraction.")

    # Phase 2: build the content-map
    out: dict = {
        "_meta": {
            "version": 1,
            "pass": "1b — CPTs + remaining singletons",
            "source": "archive/wordpress/scrape/pages/*.json",
            "generator": "scripts/extract_pass_1b.py",
            "filter": f"strings appearing on >= {CHROME_THRESHOLD} pages treated as chrome (already in Pass 1a global.*)",
            "status": "draft — awaiting Mikey page-by-page review",
            "conventions": {
                "key_shape": "namespace.slug.section.field",
                "namespaces": ["ministry", "event", "campaign", "profile", "sermon", "singleton"],
                "missing_value": "null means no scrape source — __needs_authoring__: true"
            }
        }
    }

    namespaces: dict[str, dict] = {}
    pages_summary: list[dict] = []

    for path, data, (ns, instance_key) in pages:
        slug = data.get("slug", "")
        title = norm(data.get("title", ""))
        meta_desc = norm(data.get("metaDescription", ""))
        h1 = norm(data.get("h1", ""))
        headings = data.get("headings", {}) or {}
        paragraphs = [norm(p) for p in data.get("paragraphs", []) if norm(p)]
        buttons = data.get("buttons", []) or []

        # Filter: unique or low-frequency only
        unique_paras = [p for p in paragraphs if para_freq[p] < CHROME_THRESHOLD]
        unique_btns = [
            b for b in buttons
            if isinstance(b, dict)
            and btn_freq[(norm(b.get("text", "")).lower(), norm(b.get("href", "")))] < CHROME_THRESHOLD
        ]
        unique_h2s = [h for h in (headings.get("h2") or []) if h2_freq[norm(h)] < CHROME_THRESHOLD]
        unique_h3s = [h for h in (headings.get("h3") or []) if h3_freq[norm(h)] < CHROME_THRESHOLD]

        # Build key namespace
        ns_bucket = namespaces.setdefault(ns, {})
        page_bucket = ns_bucket.setdefault(instance_key, {})

        # Meta
        if title:
            page_bucket[f"meta.title"] = {"type": "text", "value": title.split("–")[0].strip() or title}
        if meta_desc:
            page_bucket[f"meta.description"] = {"type": "text", "value": meta_desc}
        else:
            page_bucket[f"meta.description"] = {
                "type": "text", "value": None, "__needs_authoring__": True,
                "__hint__": "Short SEO description, 150-160 chars"
            }

        # Hero title — use h1
        if h1:
            page_bucket["hero.title"] = {"type": "text", "value": h1}

        # Body paragraphs — numbered
        for i, p in enumerate(unique_paras, start=1):
            page_bucket[f"body.p{i}"] = {"type": "richtext", "value": p}

        # Section headings — h2s as subsection titles
        for i, h in enumerate(unique_h2s, start=1):
            page_bucket[f"sections.h2_{i}"] = {"type": "text", "value": norm(h)}

        # Sub-section headings — h3s
        for i, h in enumerate(unique_h3s[:10], start=1):
            page_bucket[f"sections.h3_{i}"] = {"type": "text", "value": norm(h)}

        # Unique buttons → CTAs
        for i, b in enumerate(unique_btns[:6], start=1):
            page_bucket[f"cta.{i}.label"] = {"type": "text", "value": norm(b.get("text", ""))}
            page_bucket[f"cta.{i}.href"] = {"type": "url", "value": norm(b.get("href", ""))}

        pages_summary.append({
            "namespace": ns,
            "instance_key": instance_key,
            "slug": slug,
            "h1": h1,
            "field_count": len(page_bucket),
            "unique_paras": len(unique_paras),
            "unique_buttons": len(unique_btns),
        })

    # Merge namespaces into out (keep namespaces sorted for diff-friendliness)
    for ns in sorted(namespaces.keys()):
        out[ns] = dict(sorted(namespaces[ns].items()))

    # Write JSON
    OUT_JSON.write_text(json.dumps(out, indent=2, ensure_ascii=False))
    print(f"Wrote {OUT_JSON}  ({OUT_JSON.stat().st_size} bytes)")

    # Write review doc
    lines: list[str] = []
    lines.append("# content-map Pass 1b — Review\n")
    lines.append(f"**Scope:** CPTs + remaining singletons.  \n**Source:** `{OUT_JSON.name}`  \n**Generator:** `scripts/extract_pass_1b.py`\n")
    lines.append("**Your job:** scroll through each page, confirm the extracted fields make sense, mark anything that needs authoring, and flag sections where the scrape missed real copy.\n")
    lines.append("**How to read a key**\n```\nministry.family.hero.title   →  { type: text, value: 'Family Ministry' }\nministry.family.body.p1      →  { type: richtext, value: 'Family is at the center of…' }\nministry.family.cta.1.label  →  { type: text, value: 'give' }\n```\n")
    lines.append("---\n")

    by_ns: dict[str, list[dict]] = {}
    for p in pages_summary:
        by_ns.setdefault(p["namespace"], []).append(p)

    for ns in sorted(by_ns.keys()):
        lines.append(f"## `{ns}.*` — {len(by_ns[ns])} pages\n")
        for p in sorted(by_ns[ns], key=lambda x: x["instance_key"]):
            lines.append(f"### `{ns}.{p['instance_key']}`  ({p['field_count']} fields)")
            lines.append(f"- slug: `{p['slug']}`")
            lines.append(f"- h1: **{p['h1']}**")
            lines.append(f"- body paragraphs: {p['unique_paras']}  /  unique CTAs: {p['unique_buttons']}")
            lines.append("- ☐ Title correct / ☐ Body reads cleanly / ☐ Nothing critical missing\n")
        lines.append("")

    OUT_REVIEW.write_text("\n".join(lines))
    print(f"Wrote {OUT_REVIEW}")

    # Print a short summary
    print(f"\n--- Summary ---")
    for ns in sorted(by_ns.keys()):
        print(f"  {ns}: {len(by_ns[ns])} pages")
    total_fields = sum(p["field_count"] for p in pages_summary)
    print(f"  total fields extracted: {total_fields}")

if __name__ == "__main__":
    main()
