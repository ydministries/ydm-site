"use client";

import { useContent } from "./ContentProvider";
import { ItemProvider } from "./ItemProvider";
import type { ElementType, ReactNode } from "react";

/**
 * EditableList — renders a repeating block from page_content rows.
 *
 * Seed convention: `<prefix>.<n>.<subkey>` where <n> is an integer.
 * Example: beliefs.1.title, beliefs.1.body, beliefs.2.title, ...
 *
 * Also supports `item<n>` format: beliefs.item1.title, beliefs.item2.title, ...
 *
 * The render callback receives { index } and renders inside an ItemProvider,
 * so child EditableContent/EditableRichText/EditableLink components resolve
 * their fieldKeys relative to `<prefix>.<index>.*`.
 *
 * Zero-fallback: no items → dev placeholder, prod null.
 * Do NOT add children/fallback/defaultValue/placeholder props.
 */
type EditableListProps = {
  itemPrefix: string;
  render: (args: { index: number }) => ReactNode;
  className?: string;
  as?: ElementType;
} & {
  children?: never;
  fallback?: never;
  defaultValue?: never;
  placeholder?: never;
};

export function EditableList({
  itemPrefix,
  render,
  className,
  as,
}: EditableListProps) {
  const { content } = useContent();

  // Match both numeric and "item<n>" patterns
  const escaped = itemPrefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(
    `^${escaped}\\.((?:item)?\\d+)\\.`
  );

  const indices = new Set<number>();
  for (const key of content.keys()) {
    const m = key.match(pattern);
    if (m) {
      const idx = parseInt(m[1].replace("item", ""), 10);
      indices.add(idx);
    }
  }

  const sortedIndices = [...indices].sort((a, b) => a - b);
  const Tag = as ?? "div";

  if (sortedIndices.length === 0) {
    if (process.env.NODE_ENV !== "production") {
      return (
        <Tag className={className}>
          <mark style={{ background: "#ff0", color: "#000" }}>
            [MISSING LIST: {itemPrefix}]
          </mark>
        </Tag>
      );
    }
    return null;
  }

  // Build a map of numeric index → raw key string (e.g. 1 → "1" or 1 → "item1")
  const indexKeyMap = new Map<number, string>();
  for (const key of content.keys()) {
    const m = key.match(pattern);
    if (m) {
      const raw = m[1]; // "1" or "item1"
      const idx = parseInt(raw.replace("item", ""), 10);
      if (!indexKeyMap.has(idx)) indexKeyMap.set(idx, raw);
    }
  }

  return (
    <Tag className={className}>
      {sortedIndices.map((index) => (
        <ItemProvider
          key={index}
          prefix={itemPrefix}
          index={index}
          indexKey={indexKeyMap.get(index) ?? `${index}`}
        >
          {render({ index })}
        </ItemProvider>
      ))}
    </Tag>
  );
}
