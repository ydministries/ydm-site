import { createServerClient } from "./supabase";

/**
 * Canonical 66-book Bible ordering (Protestant). Used for sorting the
 * scripture index. Both common spellings (e.g. "Psalm" / "Psalms") are
 * accepted by the parser; storage uses whatever the original sermon
 * text used.
 */
export const BOOK_ORDER: ReadonlyArray<string> = [
  // Old Testament
  "Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy",
  "Joshua", "Judges", "Ruth",
  "1 Samuel", "2 Samuel",
  "1 Kings", "2 Kings",
  "1 Chronicles", "2 Chronicles",
  "Ezra", "Nehemiah", "Esther",
  "Job", "Psalms", "Proverbs", "Ecclesiastes", "Song of Solomon",
  "Isaiah", "Jeremiah", "Lamentations", "Ezekiel", "Daniel",
  "Hosea", "Joel", "Amos", "Obadiah", "Jonah", "Micah",
  "Nahum", "Habakkuk", "Zephaniah", "Haggai", "Zechariah", "Malachi",
  // New Testament
  "Matthew", "Mark", "Luke", "John", "Acts", "Romans",
  "1 Corinthians", "2 Corinthians",
  "Galatians", "Ephesians", "Philippians", "Colossians",
  "1 Thessalonians", "2 Thessalonians",
  "1 Timothy", "2 Timothy",
  "Titus", "Philemon", "Hebrews", "James",
  "1 Peter", "2 Peter",
  "1 John", "2 John", "3 John",
  "Jude", "Revelation",
];

const BOOK_INDEX = new Map<string, number>(
  BOOK_ORDER.map((b, i) => [b.toLowerCase(), i]),
);
// Aliases — common variant spellings. Maps lowercase variant → canonical name.
const BOOK_ALIASES: Record<string, string> = {
  psalm: "Psalms",
  "song of songs": "Song of Solomon",
  "song of solomon": "Song of Solomon",
  canticles: "Song of Solomon",
  apocalypse: "Revelation",
  revelations: "Revelation",
};

/**
 * Parse "Joshua 4:19-20" → { book: "Joshua", chapter: 4, verseStart: 19, verseEnd: 20 }
 * Parse "Matthew 16:18" → { book: "Matthew", chapter: 16, verseStart: 18, verseEnd: 18 }
 * Parse "Romans 12" → { book: "Romans", chapter: 12, verseStart: null, verseEnd: null }
 */
export interface ParsedRef {
  book: string;
  chapter: number;
  verseStart: number | null;
  verseEnd: number | null;
  /** The original ref string (e.g. "Joshua 4:19-20"). */
  raw: string;
}

export function parseRef(raw: string): ParsedRef | null {
  // Match "<book> <chapter>:<verse>[-<verseEnd>]" or "<book> <chapter>"
  // Book can be "1 Samuel" / "2 Corinthians" — supports leading number.
  const match = raw
    .trim()
    .match(/^((?:[1-3]\s+)?[A-Za-z][A-Za-z ]+?)\s+(\d+)(?::(\d+)(?:-(\d+))?)?$/);
  if (!match) return null;

  const rawBook = match[1].trim();
  const aliasKey = rawBook.toLowerCase();
  const canonicalBook =
    BOOK_INDEX.has(aliasKey)
      ? rawBook
          .split(" ")
          .map((w) =>
            /^[1-3]$/.test(w) ? w : w[0].toUpperCase() + w.slice(1).toLowerCase(),
          )
          .join(" ")
      : (BOOK_ALIASES[aliasKey] ?? null);

  if (!canonicalBook || BOOK_INDEX.get(canonicalBook.toLowerCase()) === undefined) {
    return null;
  }

  return {
    book: canonicalBook,
    chapter: Number(match[2]),
    verseStart: match[3] ? Number(match[3]) : null,
    verseEnd: match[4] ? Number(match[4]) : (match[3] ? Number(match[3]) : null),
    raw,
  };
}

export interface SermonScriptureRef {
  /** "Joshua 4:19-20" — original text */
  ref: string;
  /** Verse text (cached by Phase K from bible-api.com) */
  text: string;
  translation: string;
  /** Set in Phase K to the sermon's own URL */
  url: string;
}

export interface ScriptureIndexEntry {
  /** "Joshua 4:19-20" */
  ref: string;
  /** Parsed components for sorting */
  parsed: ParsedRef;
  /** Verse text */
  text: string;
  translation: string;
  /** All sermons that referenced this ref. Multiple sermons can reference the same verse. */
  sermons: ReadonlyArray<{
    slug: string;
    title: string;
  }>;
}

export interface ScriptureBookGroup {
  book: string;
  bookIndex: number; // canonical position
  refs: ScriptureIndexEntry[];
}

/**
 * Build the scripture index across all sermons. One DB round-trip pulls
 * scripture_refs + meta.title for every sermon, then we parse, deduplicate,
 * and group.
 *
 * Two refs are considered the same if their `ref` string is identical
 * (e.g. two sermons quoting "John 3:16" merge to one entry with two
 * sermon links). Verse-range overlaps are NOT detected — "Joshua 4:17-20"
 * and "Joshua 4:19-20" are separate entries by design (preserves what
 * each sermon actually quoted).
 */
export async function getScriptureIndex(): Promise<ScriptureBookGroup[]> {
  const sb = createServerClient();
  const { data, error } = await sb
    .from("page_content")
    .select("page_key, field_key, value")
    .like("page_key", "sermons.%")
    .neq("page_key", "sermons.index")
    .not("page_key", "like", "sermons.cat.%")
    .in("field_key", ["scripture_refs", "meta.title"]);

  if (error) {
    console.error("[scriptureIndex] failed:", error);
    return [];
  }

  // Pivot: page_key → { refsJson, title }
  const sermonData = new Map<
    string,
    { refsJson?: string; title?: string }
  >();
  for (const row of data ?? []) {
    const slug = row.page_key.replace(/^sermons\./, "");
    if (!sermonData.has(slug)) sermonData.set(slug, {});
    if (row.field_key === "scripture_refs") {
      sermonData.get(slug)!.refsJson = row.value;
    } else if (row.field_key === "meta.title") {
      sermonData.get(slug)!.title = row.value;
    }
  }

  // Aggregate refs across sermons. Map keyed by ref string; value collects
  // text/translation (first sermon wins) and the list of sermons.
  type Aggregated = {
    ref: string;
    parsed: ParsedRef;
    text: string;
    translation: string;
    sermons: { slug: string; title: string }[];
  };
  const byRef = new Map<string, Aggregated>();

  for (const [slug, { refsJson, title }] of sermonData) {
    if (!refsJson) continue;
    let parsed: SermonScriptureRef[];
    try {
      const x = JSON.parse(refsJson);
      if (!Array.isArray(x)) continue;
      parsed = x as SermonScriptureRef[];
    } catch {
      continue;
    }
    for (const r of parsed) {
      const ref = r.ref?.trim();
      if (!ref) continue;
      const parsedRef = parseRef(ref);
      if (!parsedRef) continue;

      if (!byRef.has(ref)) {
        byRef.set(ref, {
          ref,
          parsed: parsedRef,
          text: r.text ?? "",
          translation: r.translation ?? "",
          sermons: [],
        });
      }
      const agg = byRef.get(ref)!;
      // De-dupe sermon entries (same sermon listing the same ref multiple
      // times shouldn't double-count)
      if (!agg.sermons.find((s) => s.slug === slug)) {
        agg.sermons.push({ slug, title: title ?? slug });
      }
    }
  }

  // Group by book, sort entries within a book by (chapter, verseStart, raw),
  // sort books by canonical order.
  const byBook = new Map<string, ScriptureIndexEntry[]>();
  for (const agg of byRef.values()) {
    const list = byBook.get(agg.parsed.book) ?? [];
    list.push({
      ref: agg.ref,
      parsed: agg.parsed,
      text: agg.text,
      translation: agg.translation,
      sermons: agg.sermons,
    });
    byBook.set(agg.parsed.book, list);
  }

  const groups: ScriptureBookGroup[] = [];
  for (const [book, refs] of byBook) {
    refs.sort((a, b) => {
      if (a.parsed.chapter !== b.parsed.chapter)
        return a.parsed.chapter - b.parsed.chapter;
      const av = a.parsed.verseStart ?? 0;
      const bv = b.parsed.verseStart ?? 0;
      if (av !== bv) return av - bv;
      return a.ref.localeCompare(b.ref);
    });
    const idx = BOOK_INDEX.get(book.toLowerCase()) ?? 999;
    groups.push({ book, bookIndex: idx, refs });
  }
  groups.sort((a, b) => a.bookIndex - b.bookIndex);
  return groups;
}
